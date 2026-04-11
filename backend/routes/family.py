from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user
from schemas import (
    FamilyTreeResponse, FamilyMemberResponse, PersonInfoSchema,
    MedicalIssueSchema, MedicationSchema, DeathInfoSchema,
    AddFamilyMemberRequest, EditFamilyMemberRequest, EditableFamilyMemberSchema,
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

    # # Fetch grandparents — parents of each parent
    # grandparents = []
    # for parent in parents:
    #     parent_db_id = parse_member_id(parent.id)
    #     gp_rows = get_relatives(parent_db_id, "parent")
    #     for gp_row in gp_rows:
    #         grandparents.append(
    #             build_family_member(gp_row, "grandparent", db, parent_id=parent.id)
    #         )
    #
    # # Fetch great grandparents — parents of each grandparent
    # great_grandparents = []
    # for gp in grandparents:
    #     gp_db_id = parse_member_id(gp.id)
    #     ggp_rows = get_relatives(gp_db_id, "parent")
    #     for ggp_row in ggp_rows:
    #         great_grandparents.append(
    #             build_family_member(ggp_row, "great-grandparent", db, parent_id=gp.id)
    #         )
    #
    # return FamilyTreeResponse(
    #     user=user_member,
    #     parents=parents,
    #     grandparents=grandparents,
    #     greatGrandparents=great_grandparents
    # )

    # Fetch siblings
    sibling_rows = get_relatives(person_id, "sibling")
    siblings = [build_family_member(row, "sibling", db) for row in sibling_rows]

    # Fetch grandparents — parents of each parent
    grandparents = []
    for parent in parents:
        parent_db_id = parse_member_id(parent.id)
        gp_rows = get_relatives(parent_db_id, "parent")
        for gp_row in gp_rows:
            grandparents.append(
                build_family_member(gp_row, "grandparent", db, parent_id=parent.id)
            )

    # Fetch aunts/uncles — siblings of each parent
    aunts_uncles = []
    for parent in parents:
        parent_db_id = parse_member_id(parent.id)
        au_rows = get_relatives(parent_db_id, "sibling")
        for au_row in au_rows:
            aunts_uncles.append(
                build_family_member(au_row, "aunt/uncle", db, parent_id=parent.id)
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

    # Fetch great-great-grandparents — parents of each great-grandparent
    great_great_grandparents = []
    for ggp in great_grandparents:
        ggp_db_id = parse_member_id(ggp.id)
        gggp_rows = get_relatives(ggp_db_id, "parent")
        for gggp_row in gggp_rows:
            great_great_grandparents.append(
                build_family_member(gggp_row, "great-great-grandparent", db, parent_id=ggp.id)
            )

    return FamilyTreeResponse(
        user=user_member,
        parents=parents,
        siblings=siblings,
        grandparents=grandparents,
        auntsUncles=aunts_uncles,
        greatGrandparents=great_grandparents,
        greatGreatGrandparents=great_great_grandparents
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
                             INSERT INTO Person (FirstName, MiddleName, LastName, IsDeceased, DateOfBirth, GenderIdentity, GenderAssignedAtBirth)
                             VALUES (:first, :middle, :last, :deceased, :dob, :gender_identity, :gender_assigned)
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

    # # Resolve the relationship — who is this person a parent of?
    # # For 'parent': they are a parent of the logged-in user
    # # For 'grandparent': they are a parent of the person identified by parentId
    # # For 'great-grandparent': same logic, one level up
    # if body.type == "parent":
    #     child_id = person_id
    # elif body.type in ("grandparent", "great-grandparent"):
    #     if not body.parentId:
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST,
    #             detail="parentId is required for grandparent and great-grandparent"
    #         )
    #     child_id = parse_member_id(body.parentId)
    # else:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"Invalid member type: {body.type}"
    #     )
    #
    # # Get or create the 'parent' relationship type
    # rel_type = db.execute(text("""
    #                            SELECT ID FROM PersonRelationshipTypes WHERE TypeName = 'parent'
    #                            """)).mappings().first()
    #
    # if rel_type is None:
    #     rel_result = db.execute(text("""
    #                                  INSERT INTO PersonRelationshipTypes (TypeName) VALUES ('parent')
    #                                  """))
    #     db.flush()
    #     rel_type_id = rel_result.lastrowid
    # else:
    #     rel_type_id = rel_type["ID"]
    #
    # # Insert relationship: new_person is a parent of child
    # db.execute(text("""
    #                 INSERT INTO PersonRelationships (PersonOneID, PersonTwoID, RelationshipTypeID)
    #                 VALUES (:child_id, :new_person_id, :rel_type_id)
    #                 """), {
    #                "child_id": child_id,
    #                "new_person_id": new_person_id,
    #                "rel_type_id": rel_type_id
    #            })
    #
    # # Handle death info — insert as a cause-of-death diagnosis
    # if body.isDeceased and body.deathReason:
    #     diag_result = db.execute(text("""
    #                                   INSERT INTO MedicalDiagnosis (DiagnosisName, DiagnosisDescription)
    #                                   VALUES (:name, :desc)
    #                                   """), {
    #                                  "name": body.deathReason,
    #                                  "desc": body.deathNotes
    #                              })
    #     db.flush()
    #     diag_id = diag_result.lastrowid
    #
    #     db.execute(text("""
    #                     INSERT INTO PersonMedicalDiagnosis (PersonID, DiagnosisID, DateDiagnosed, IsCauseOfDeath)
    #                     VALUES (:person_id, :diag_id, :date, 1)
    #                     """), {
    #                    "person_id": new_person_id,
    #                    "diag_id": diag_id,
    #                    "date": body.deathDate
    #                })
    #
    # db.commit()
    #
    # new_row = db.execute(text("""
    #                           SELECT * FROM Person WHERE ID = :id
    #                           """), {"id": new_person_id}).mappings().first()
    #
    # return build_family_member(
    #     dict(new_row),
    #     body.type,
    #     db,
    #     parent_id=body.parentId
    # )

    # Resolve PersonOneID: who is this new person related to?
    # None / missing relatedToId means the logged-in user.
    if body.relatedToId:
        person_one_id = parse_member_id(body.relatedToId)
    else:
        person_one_id = person_id

    # Get or create the relationship type by name
    rel_type = db.execute(text("""
                               SELECT ID FROM PersonRelationshipTypes WHERE TypeName = :type_name
                               """), {"type_name": body.relationshipType}).mappings().first()

    if rel_type is None:
        rel_result = db.execute(text("""
                                     INSERT INTO PersonRelationshipTypes (TypeName) VALUES (:type_name)
                                     """), {"type_name": body.relationshipType})
        db.flush()
        rel_type_id = rel_result.lastrowid
    else:
        rel_type_id = rel_type["ID"]

    # Insert relationship: person_one HAS [relationshipType] new_person
    db.execute(text("""
                    INSERT INTO PersonRelationships (PersonOneID, PersonTwoID, RelationshipTypeID)
                    VALUES (:person_one_id, :new_person_id, :rel_type_id)
                    """), {
                   "person_one_id": person_one_id,
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
        body.relationship,
        db,
        parent_id=body.relatedToId
    )


# ── Edit-info helpers ─────────────────────────────────────────────────────────

def _all_tree_person_ids(person_id: int, db: Session) -> list[dict]:
    """
    Returns a flat list of {person_id, prefixed_id, member_type} dicts for every
    person in the user's family tree (excluding the user themselves).
    """
    rel_types = db.execute(text("SELECT ID, TypeName FROM PersonRelationshipTypes")).mappings().all()
    rel_type_map = {row["TypeName"]: row["ID"] for row in rel_types}

    def get_relatives(from_id: int, type_name: str):
        type_id = rel_type_map.get(type_name)
        if type_id is None:
            return []
        rows = db.execute(text("""
            SELECT p.* FROM Person p
            JOIN PersonRelationships pr ON pr.PersonTwoID = p.ID
            WHERE pr.PersonOneID = :pid AND pr.RelationshipTypeID = :tid
        """), {"pid": from_id, "tid": type_id}).mappings().all()
        return [dict(r) for r in rows]

    results = []

    parent_rows = get_relatives(person_id, "parent")
    for r in parent_rows:
        results.append({"row": r, "type": "parent", "prefix": "p"})

    sibling_rows = get_relatives(person_id, "sibling")
    for r in sibling_rows:
        results.append({"row": r, "type": "sibling", "prefix": "s"})

    grandparent_rows = []
    for pr in parent_rows:
        for r in get_relatives(pr["ID"], "parent"):
            results.append({"row": r, "type": "grandparent", "prefix": "g"})
            grandparent_rows.append(r)

    for pr in parent_rows:
        for r in get_relatives(pr["ID"], "sibling"):
            results.append({"row": r, "type": "aunt/uncle", "prefix": "a"})

    great_gp_rows = []
    for gr in grandparent_rows:
        for r in get_relatives(gr["ID"], "parent"):
            results.append({"row": r, "type": "great-grandparent", "prefix": "gg"})
            great_gp_rows.append(r)

    for gr in great_gp_rows:
        for r in get_relatives(gr["ID"], "parent"):
            results.append({"row": r, "type": "great-great-grandparent", "prefix": "ggg"})

    return results


# GET /family/members — flat editable list
@router.get("/members", response_model=list[EditableFamilyMemberSchema])
def get_family_members_list(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    person_id = current_user["PersonID"]
    entries = _all_tree_person_ids(person_id, db)

    result = []
    for entry in entries:
        row = entry["row"]
        dob_str = row["DateOfBirth"].strftime("%Y-%m-%d") if row["DateOfBirth"] else None
        result.append(EditableFamilyMemberSchema(
            personId=row["ID"],
            prefixedId=f"{entry['prefix']}{row['ID']}",
            name=f"{row['FirstName']} {row['LastName']}",
            memberType=entry["type"],
            firstName=row["FirstName"],
            lastName=row["LastName"],
            middleName=row["MiddleName"],
            dob=dob_str,
            genderIdentity=row["GenderIdentity"],
            genderAssignedAtBirth=row["GenderAssignedAtBirth"],
            isDeceased=bool(row["IsDeceased"]),
        ))
    return result


# PUT /family/member/{person_id} — update details
@router.put("/member/{person_id}")
def update_family_member(
        person_id: int,
        body: EditFamilyMemberRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    current_person_id = current_user["PersonID"]
    if person_id == current_person_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Use the account page to edit your own profile.")

    # Verify this person is in the user's tree
    tree_ids = {e["row"]["ID"] for e in _all_tree_person_ids(current_person_id, db)}
    if person_id not in tree_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Family member not found in your tree.")

    dob = None
    if body.dob:
        for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                dob = datetime.strptime(body.dob, fmt).date()
                break
            except ValueError:
                continue

    db.execute(text("""
        UPDATE Person
        SET FirstName = :first, MiddleName = :middle, LastName = :last,
            IsDeceased = :deceased, DateOfBirth = :dob,
            GenderIdentity = :gender_identity,
            GenderAssignedAtBirth = :gender_assigned
        WHERE ID = :id
    """), {
        "first": body.firstName,
        "middle": body.middleName,
        "last": body.lastName,
        "deceased": 1 if body.isDeceased else 0,
        "dob": dob,
        "gender_identity": body.genderIdentity,
        "gender_assigned": body.genderAssignedAtBirth,
        "id": person_id,
    })
    db.commit()
    return {"success": True}


# DELETE /family/member/{person_id} — remove from tree
@router.delete("/member/{person_id}")
def delete_family_member(
        person_id: int,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    current_person_id = current_user["PersonID"]
    if person_id == current_person_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="You cannot remove yourself.")

    # Verify this person is in the user's tree
    tree_ids = {e["row"]["ID"] for e in _all_tree_person_ids(current_person_id, db)}
    if person_id not in tree_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Family member not found in your tree.")

    db.execute(text("DELETE FROM PersonMedicalDiagnosis WHERE PersonID = :id"), {"id": person_id})
    db.execute(text("DELETE FROM PersonMedications WHERE PersonID = :id"), {"id": person_id})
    db.execute(text("""
        DELETE FROM PersonRelationships
        WHERE PersonOneID = :id OR PersonTwoID = :id
    """), {"id": person_id})
    db.execute(text("DELETE FROM Person WHERE ID = :id"), {"id": person_id})
    db.commit()
    return {"success": True}