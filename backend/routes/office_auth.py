from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/office/auth", tags=["office-auth"])

@router.post("/signup")
def office_signup(body: dict, db: Session = Depends(get_db)):
    username = body.get("username")
    password = body.get("password")
    name = body.get("name")
    description = body.get("description", "")

    if not username or not password or not name:
        raise HTTPException(status_code=400, detail="Username, password, and name are required.")

    existing = db.execute(
        text("SELECT ID FROM MedicalOffice WHERE Username = :u"), {"u": username}
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken.")

    hashed = hash_password(password)
    result = db.execute(text("""
                             INSERT INTO MedicalOffice (Username, Password, Name, Description)
                             VALUES (:username, :password, :name, :description)
                             """), {"username": username, "password": hashed, "name": name, "description": description})
    db.commit()

    office_id = result.lastrowid
    token = create_access_token({"office_id": office_id})
    return {
        "access_token": token,
        "office": {"office_id": office_id, "username": username, "name": name, "description": description}
    }

@router.post("/login")
def office_login(body: dict, db: Session = Depends(get_db)):
    username = body.get("username")
    password = body.get("password")

    row = db.execute(
        text("SELECT ID, Password, Name, Description FROM MedicalOffice WHERE Username = :u"),
        {"u": username}
    ).mappings().first()

    if not row or not verify_password(password, row["Password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = create_access_token({"office_id": row["ID"]})
    return {
        "access_token": token,
        "office": {"office_id": row["ID"], "username": username, "name": row["Name"], "description": row["Description"]}
    }