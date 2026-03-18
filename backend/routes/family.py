from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user
from schemas import (
    FamilyTreeResponse, FamilyMemberResponse, PersonInfoSchema,
    MedicalIssueSchema, MedicationSchema, DeathInfoSchema,
    AddFamilyMemberRequest
)
from datetime import datetime

router = APIRouter(prefix="/family", tags=["family"])

# Helpers
def parse_member_id(member_id: str) -> int:
    """Strips the letter prefix from frontend IDs like 'p1', 'g3', 'u1'"""
    try:
        return int(member_id[1:])
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid member ID format: {member_id}"
        )

def get_diagnoses_for_person(person_id: int, db: Session) -> list[MedicalIssueSchema]:
    rows = db.execute(text("""
                           SELECT md.DiagnosisName, md.DiagnosisDescription
                           FROM PersonMedicalDiagnosis pmd
                                    JOIN MedicalDiagnosis md ON md.ID = pmd.DiagnosisID
                           WHERE pmd.PersonID = :person_id
                           """), {"person_id": person_id}).mappings().all()

    return [
        MedicalIssueSchema(
            issue=row["DiagnosisName"],
            notes=[row["DiagnosisDescription"]] if row["DiagnosisDescription"] else []
        )
        for row in rows
    ]

def get_medications_for_person(person_id: int, db: Session) -> list[MedicationSchema]:
    rows = db.execute(text("""
                           SELECT m.MedicationName, m.MedicationDescription
                           FROM PersonMedications pm
                                    JOIN Medications m ON m.ID = pm.MedicationID
                           WHERE pm.PersonID = :person_id
                             AND pm.DateStopped IS NULL
                           """), {"person_id": person_id}).mappings().all()

    return [
        MedicationSchema(
            name=row["MedicationName"],
            dosage=None,
            prescribedBy=None,
            reason=row["MedicationDescription"]
        )
        for row in rows
    ]

def build_family_member(row: dict, member_type: str, db: Session, parent_id: str = None) -> FamilyMemberResponse:
    """Builds a FamilyMemberResponse from a Person row dict"""
    person_id = row["ID"]
    is_deceased = bool(row["IsDeceased"])

    dob_str = row["DateOfBirth"].strftime("%d/%m/%Y") if row["DateOfBirth"] else None

    # Calculate age from DateOfBirth
    age = None
    if row["DateOfBirth"]:
        today = datetime.today()
        dob = row["DateOfBirth"]
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    info = PersonInfoSchema(
        age=age,
        dob=dob_str,
        genderIdentity=row["GenderIdentity"],
        genderAssignedAtBirth=row["GenderAssignedAtBirth"],
        alive=None if member_type == "user" else not is_deceased
    )

    # Death info — stored as a diagnosis marked as cause of death
    death_info = None
    if is_deceased:
        death_row = db.execute(text("""
                                    SELECT md.DiagnosisName, md.DiagnosisDescription, pmd.DateDiagnosed
                                    FROM PersonMedicalDiagnosis pmd
                                             JOIN MedicalDiagnosis md ON md.ID = pmd.DiagnosisID
                                    WHERE pmd.PersonID = :person_id
                                      AND pmd.IsCauseOfDeath = 1
                                    """), {"person_id": person_id}).mappings().first()

        if death_row:
            death_info = DeathInfoSchema(
                date=death_row["DateDiagnosed"].strftime("%d/%m/%Y") if death_row["DateDiagnosed"] else None,
                reason=death_row["DiagnosisName"],
                notes=death_row["DiagnosisDescription"]
            )

    diagnoses = get_diagnoses_for_person(person_id, db)
    medications = get_medications_for_person(person_id, db) if member_type == "user" else []

    return FamilyMemberResponse(
        id=f"{member_type[0]}{person_id}",
        type=member_type,
        name=f"{row['FirstName']} {row['LastName']}",
        info=info,
        medicalIssues=diagnoses,
        medications=medications,
        deathInfo=death_info,
        parentId=parent_id
    )

# Get Family Tree
@router.get("/tree", response_model=FamilyTreeResponse)
def get_family_tree(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = current_user["PersonID"]

    # Fetch the logged-in user
    user_row = db.execute(text("""
                               SELECT * FROM Person WHERE ID = :id
                               """), {"id": person_id}).mappings().first()

    if not user_row:
        raise HTTPException(status_code=404, detail="User person record not found")

    user_member = build_family_member(dict(user_row), "user", db)

    # Fetch relationship type IDs we care about
    rel_types = db.execute(text("""
                                SELECT ID, TypeName FROM PersonRelationshipTypes
                                """)).mappings().all()
    rel_type_map = {row["TypeName"]: row["ID"] for row in rel_types}

    # Helper to get related persons by relationship type name
    def get_relatives(from_person_id: int, type_name: str):
        type_id = rel_type_map.get(type_name)
        if type_id is None:
            return []
        rows = db.execute(text("""
                               SELECT p.* FROM Person p
                                                   JOIN PersonRelationships pr ON pr.PersonTwoID = p.ID
                               WHERE pr.PersonOneID = :person_id
                                 AND pr.RelationshipTypeID = :type_id
                               """), {"person_id": from_person_id, "type_id": type_id}).mappings().all()
        return [dict(row) for row in rows]

    # Fetch parents
    parent_rows = get_relatives(person_id, "parent")
    parents = [build_family_member(row, "parent", db) for row in parent_rows]

    # Fetch grandparents — parents of each parent
    grandparents = []
    for parent in parents:
        parent_db_id = parse_member_id(parent.id)
        gp_rows = get_relatives(parent_db_id, "parent")
        for gp_row in gp_rows:
            grandparents.append(
                build_family_member(gp_row, "grandparent", db, parent_id=parent.id)
            )

    # Fetch great grandparents — parents of each grandparent
    great_grandparents = []
    for gp in grandparents:
        gp_db_id = parse_member_id(gp.id)
        ggp_rows = get_relatives(gp_db_id, "parent")
        for ggp_row in ggp_rows:
            great_grandparents.append(
                build_family_member(ggp_row, "great-grandparent", db, parent_id=gp.id)
            )

    return FamilyTreeResponse(
        user=user_member,
        parents=parents,
        grandparents=grandparents,
        greatGrandparents=great_grandparents
    )

# Add Family Member
@router.post("/member", response_model=FamilyMemberResponse)
def add_family_member(
        body: AddFamilyMemberRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = current_user["PersonID"]

    # Parse DOB
    dob = None
    if body.dob:
        for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                from datetime import datetime
                dob = datetime.strptime(body.dob, fmt).date()
                break
            except ValueError:
                continue
        if dob is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY"
            )

    # Insert new Person
    result = db.execute(text("""
                             INSERT INTO Person (FirstName, MiddleName, LastName, IsDeceased, DateOfBirth, Gender)
                             VALUES (:first, :middle, :last, :deceased, :dob, :gender)
                             """), {
                            "first": body.firstName,
                            "middle": body.middleName,
                            "last": body.lastName,
                            "deceased": 1 if body.isDeceased else 0,
                            "dob": dob,
                            "gender_identity": body.genderIdentity,
                            "gender_assigned": body.genderAssignedAtBirth
                        })
    db.flush()
    new_person_id = result.lastrowid

    # Resolve the relationship — who is this person a parent of?
    # For 'parent': they are a parent of the logged-in user
    # For 'grandparent': they are a parent of the person identified by parentId
    # For 'great-grandparent': same logic, one level up
    if body.type == "parent":
        child_id = person_id
    elif body.type in ("grandparent", "great-grandparent"):
        if not body.parentId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="parentId is required for grandparent and great-grandparent"
            )
        child_id = parse_member_id(body.parentId)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid member type: {body.type}"
        )

    # Get or create the 'parent' relationship type
    rel_type = db.execute(text("""
                               SELECT ID FROM PersonRelationshipTypes WHERE TypeName = 'parent'
                               """)).mappings().first()

    if rel_type is None:
        rel_result = db.execute(text("""
                                     INSERT INTO PersonRelationshipTypes (TypeName) VALUES ('parent')
                                     """))
        db.flush()
        rel_type_id = rel_result.lastrowid
    else:
        rel_type_id = rel_type["ID"]

    # Insert relationship: new_person is a parent of child
    db.execute(text("""
                    INSERT INTO PersonRelationships (PersonOneID, PersonTwoID, RelationshipTypeID)
                    VALUES (:child_id, :new_person_id, :rel_type_id)
                    """), {
                   "child_id": child_id,
                   "new_person_id": new_person_id,
                   "rel_type_id": rel_type_id
               })

    # Handle death info — insert as a cause-of-death diagnosis
    if body.isDeceased and body.deathReason:
        diag_result = db.execute(text("""
                                      INSERT INTO MedicalDiagnosis (DiagnosisName, DiagnosisDescription)
                                      VALUES (:name, :desc)
                                      """), {
                                     "name": body.deathReason,
                                     "desc": body.deathNotes
                                 })
        db.flush()
        diag_id = diag_result.lastrowid

        db.execute(text("""
                        INSERT INTO PersonMedicalDiagnosis (PersonID, DiagnosisID, DateDiagnosed, IsCauseOfDeath)
                        VALUES (:person_id, :diag_id, :date, 1)
                        """), {
                       "person_id": new_person_id,
                       "diag_id": diag_id,
                       "date": body.deathDate
                   })

    db.commit()

    new_row = db.execute(text("""
                              SELECT * FROM Person WHERE ID = :id
                              """), {"id": new_person_id}).mappings().first()

    return build_family_member(
        dict(new_row),
        body.type,
        db,
        parent_id=body.parentId
    )