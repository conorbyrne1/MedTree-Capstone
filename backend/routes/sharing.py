from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/sharing", tags=["sharing"])

@router.get("/offices")
def get_my_connected_offices(user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(text("""
                           SELECT mo.ID as office_id, mo.Name, mo.Description, mo.Username
                           FROM MedicalOfficePerson mop
                                    JOIN MedicalOffice mo ON mo.ID = mop.MedicalOfficeID
                           WHERE mop.PersonID = :person_id
                           """), {"person_id": user["PersonID"]}).mappings().all()
    return [dict(r) for r in rows]

@router.post("/offices/{office_id}")
def connect_office(office_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    office = db.execute(
        text("SELECT ID, Name FROM MedicalOffice WHERE ID = :id"), {"id": office_id}
    ).first()
    if not office:
        raise HTTPException(status_code=404, detail="Office not found.")

    existing = db.execute(text("""
                               SELECT 1 FROM MedicalOfficePerson
                               WHERE MedicalOfficeID = :oid AND PersonID = :pid
                               """), {"oid": office_id, "pid": user["PersonID"]}).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already connected.")

    db.execute(text("""
                    INSERT INTO MedicalOfficePerson (MedicalOfficeID, PersonID)
                    VALUES (:oid, :pid)
                    """), {"oid": office_id, "pid": user["PersonID"]})
    db.commit()
    return {"message": "Office connected successfully."}

@router.delete("/offices/{office_id}")
def disconnect_office(office_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    db.execute(text("""
                    DELETE FROM MedicalOfficePerson
                    WHERE MedicalOfficeID = :oid AND PersonID = :pid
                    """), {"oid": office_id, "pid": user["PersonID"]})
    db.commit()
    return {"message": "Office disconnected."}

@router.get("/offices/search")
def search_offices(q: str = "", db: Session = Depends(get_db)):
    rows = db.execute(text("""
                           SELECT ID as office_id, Name, Description, Username
                           FROM MedicalOffice
                           WHERE Name LIKE :q OR Username LIKE :q
                           LIMIT 20
                           """), {"q": f"%{q}%"}).mappings().all()
    return [dict(r) for r in rows]