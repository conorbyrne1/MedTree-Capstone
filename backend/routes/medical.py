from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user
from schemas import (
    AddConditionRequest, AddConditionResponse,
    AddMedicationRequest, AddMedicationResponse,
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
