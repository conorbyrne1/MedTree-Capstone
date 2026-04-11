from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user
from schemas import (
    AddConditionRequest, AddConditionResponse,
    AddMedicationRequest, AddMedicationResponse,
    MemberConditionsSchema, ConditionItemSchema, MedicationItemSchema,
)
from datetime import datetime

router = APIRouter(prefix="/medical", tags=["medical"])

# Helper
def parse_member_id(member_id: str) -> int:
    """Strips the letter prefix from frontend IDs like 'p1', 'g3', 'u1'"""
    try:
        return int(member_id[1:])
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid member ID format: {member_id}"
        )

# Add Medical Condition
@router.post("/condition", response_model=AddConditionResponse)
def add_condition(
        body: AddConditionRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = parse_member_id(body.memberId)

    # Join notes into the description field
    description = "\n".join(body.notes) if body.notes else None

    # Check if this diagnosis already exists, reuse it if so
    existing_diag = db.execute(text("""
                                    SELECT ID FROM MedicalDiagnosis
                                    WHERE DiagnosisName = :name
                                    """), {"name": body.issue}).mappings().first()

    if existing_diag:
        diag_id = existing_diag["ID"]
    else:
        result = db.execute(text("""
                                 INSERT INTO MedicalDiagnosis (DiagnosisName, DiagnosisDescription)
                                 VALUES (:name, :desc)
                                 """), {
                                "name": body.issue,
                                "desc": description
                            })
        db.flush()
        diag_id = result.lastrowid

    # Check this person doesn't already have this diagnosis
    already_assigned = db.execute(text("""
                                       SELECT 1 FROM PersonMedicalDiagnosis
                                       WHERE PersonID = :person_id AND DiagnosisID = :diag_id
                                       """), {"person_id": person_id, "diag_id": diag_id}).first()

    if already_assigned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This condition has already been recorded for this person"
        )

    date_diagnosed = body.dateDiagnosed or datetime.utcnow()

    db.execute(text("""
                    INSERT INTO PersonMedicalDiagnosis (PersonID, DiagnosisID, DateDiagnosed, IsCauseOfDeath)
                    VALUES (:person_id, :diag_id, :date, :cause)
                    """), {
                   "person_id": person_id,
                   "diag_id": diag_id,
                   "date": date_diagnosed,
                   "cause": 1 if body.isCauseOfDeath else 0
               })

    db.commit()
    return AddConditionResponse(success=True)

# Add Medication
@router.post("/medication", response_model=AddMedicationResponse)
def add_medication(
        body: AddMedicationRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = current_user["PersonID"]

    # Build description from dosage, prescriber, reason
    description_parts = []
    if body.dosage:
        description_parts.append(f"Dosage: {body.dosage}")
    if body.prescribedBy:
        description_parts.append(f"Prescribed by: {body.prescribedBy}")
    if body.reason:
        description_parts.append(f"Reason: {body.reason}")
    description = "\n".join(description_parts) if description_parts else None

    # Check if medication already exists by name, reuse if so
    existing_med = db.execute(text("""
                                   SELECT ID FROM Medications
                                   WHERE MedicationName = :name
                                   """), {"name": body.name}).mappings().first()

    if existing_med:
        med_id = existing_med["ID"]
    else:
        result = db.execute(text("""
                                 INSERT INTO Medications (MedicationName, MedicationDescription)
                                 VALUES (:name, :desc)
                                 """), {
                                "name": body.name,
                                "desc": description
                            })
        db.flush()
        med_id = result.lastrowid

    # Check this person isn't already on this medication
    already_assigned = db.execute(text("""
                                       SELECT 1 FROM PersonMedications
                                       WHERE PersonID = :person_id
                                         AND MedicationID = :med_id
                                         AND DateStopped IS NULL
                                       """), {"person_id": person_id, "med_id": med_id}).first()

    if already_assigned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This medication is already active for this person"
        )

    db.execute(text("""
                    INSERT INTO PersonMedications (PersonID, MedicationID, DatePrescribed)
                    VALUES (:person_id, :med_id, :date)
                    """), {
                   "person_id": person_id,
                   "med_id": med_id,
                   "date": datetime.utcnow()
               })

    db.commit()
    return AddMedicationResponse(success=True)


# ── Edit-info endpoints ───────────────────────────────────────────────────────

# GET /medical/conditions-list — all conditions for every family member
@router.get("/conditions-list", response_model=list[MemberConditionsSchema])
def get_conditions_list(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    from routes.family import _all_tree_person_ids
    person_id = current_user["PersonID"]

    # Include the logged-in user plus all tree members
    user_row = db.execute(text("SELECT * FROM Person WHERE ID = :id"), {"id": person_id}).mappings().first()
    members = [{"personId": person_id, "prefixedId": f"u{person_id}",
                "memberName": f"{user_row['FirstName']} {user_row['LastName']}", "memberType": "you"}]

    for entry in _all_tree_person_ids(person_id, db):
        r = entry["row"]
        members.append({
            "personId": r["ID"],
            "prefixedId": f"{entry['prefix']}{r['ID']}",
            "memberName": f"{r['FirstName']} {r['LastName']}",
            "memberType": entry["type"],
        })

    result = []
    for m in members:
        rows = db.execute(text("""
            SELECT md.ID AS diagnosisId, md.DiagnosisName, md.DiagnosisDescription
            FROM PersonMedicalDiagnosis pmd
            JOIN MedicalDiagnosis md ON md.ID = pmd.DiagnosisID
            WHERE pmd.PersonID = :pid AND pmd.IsCauseOfDeath = 0
        """), {"pid": m["personId"]}).mappings().all()

        conditions = [
            ConditionItemSchema(
                diagnosisId=row["diagnosisId"],
                issue=row["DiagnosisName"],
                notes=row["DiagnosisDescription"] or '',
            )
            for row in rows
        ]
        result.append(MemberConditionsSchema(
            personId=m["personId"],
            prefixedId=m["prefixedId"],
            memberName=m["memberName"],
            memberType=m["memberType"],
            conditions=conditions,
        ))
    return result


# DELETE /medical/condition/{person_id}/{diagnosis_id}
@router.delete("/condition/{person_id}/{diagnosis_id}")
def delete_condition(
        person_id: int,
        diagnosis_id: int,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    from routes.family import _all_tree_person_ids
    current_person_id = current_user["PersonID"]

    # Allow deleting from self or any tree member
    allowed_ids = {current_person_id} | {e["row"]["ID"] for e in _all_tree_person_ids(current_person_id, db)}
    if person_id not in allowed_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found in your tree.")

    db.execute(text("""
        DELETE FROM PersonMedicalDiagnosis
        WHERE PersonID = :pid AND DiagnosisID = :did
    """), {"pid": person_id, "did": diagnosis_id})
    db.commit()
    return {"success": True}


# GET /medical/medications-list — current user's active medications
@router.get("/medications-list", response_model=list[MedicationItemSchema])
def get_medications_list(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = current_user["PersonID"]
    rows = db.execute(text("""
        SELECT m.ID AS medicationId, m.MedicationName, m.MedicationDescription
        FROM PersonMedications pm
        JOIN Medications m ON m.ID = pm.MedicationID
        WHERE pm.PersonID = :pid AND pm.DateStopped IS NULL
    """), {"pid": person_id}).mappings().all()

    return [
        MedicationItemSchema(
            medicationId=row["medicationId"],
            name=row["MedicationName"],
            description=row["MedicationDescription"],
        )
        for row in rows
    ]


# DELETE /medical/medication/{medication_id} — stop the user's medication
@router.delete("/medication/{medication_id}")
def delete_medication(
        medication_id: int,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = current_user["PersonID"]
    db.execute(text("""
        UPDATE PersonMedications
        SET DateStopped = NOW()
        WHERE PersonID = :pid AND MedicationID = :mid AND DateStopped IS NULL
    """), {"pid": person_id, "mid": medication_id})
    db.commit()
    return {"success": True}
