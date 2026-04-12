from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user
from schemas import (
    AddProfessionalRequest, AddProfessionalResponse,
    ProfessionalResponse, EditProfessionalRequest,
)

router = APIRouter(prefix="/professionals", tags=["professionals"])


@router.post("/", response_model=AddProfessionalResponse)
def add_professional(
        body: AddProfessionalRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    account_id = current_user["account_id"]

    result = db.execute(text("""
        INSERT INTO MedicalProfessionals (AccountID, Name, Specialty, Phone, Email, Address)
        VALUES (:account_id, :name, :specialty, :phone, :email, :address)
    """), {
        "account_id": account_id,
        "name": body.name,
        "specialty": body.specialty,
        "phone": body.phone,
        "email": body.email,
        "address": body.address,
    })

    db.commit()
    return AddProfessionalResponse(success=True, id=result.lastrowid)


# GET /professionals/ — list all for the current account
@router.get("/", response_model=list[ProfessionalResponse])
def list_professionals(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    account_id = current_user["account_id"]
    rows = db.execute(text("""
        SELECT ID, Name, Specialty, Phone, Email, Address
        FROM MedicalProfessionals
        WHERE AccountID = :account_id
    """), {"account_id": account_id}).mappings().all()

    return [
        ProfessionalResponse(
            id=row["ID"],
            name=row["Name"],
            specialty=row["Specialty"],
            phone=row["Phone"],
            email=row["Email"],
            address=row["Address"],
        )
        for row in rows
    ]


# PUT /professionals/{prof_id} — update a professional
@router.put("/{prof_id}")
def update_professional(
        prof_id: int,
        body: EditProfessionalRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    account_id = current_user["account_id"]
    result = db.execute(text("""
        UPDATE MedicalProfessionals
        SET Name = :name, Specialty = :specialty, Phone = :phone,
            Email = :email, Address = :address
        WHERE ID = :id AND AccountID = :account_id
    """), {
        "name": body.name,
        "specialty": body.specialty,
        "phone": body.phone,
        "email": body.email,
        "address": body.address,
        "id": prof_id,
        "account_id": account_id,
    })
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Professional not found.")
    return {"success": True}


# DELETE /professionals/{prof_id} — remove a professional
@router.delete("/{prof_id}")
def delete_professional(
        prof_id: int,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    account_id = current_user["account_id"]
    result = db.execute(text("""
        DELETE FROM MedicalProfessionals
        WHERE ID = :id AND AccountID = :account_id
    """), {"id": prof_id, "account_id": account_id})
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Professional not found.")
    return {"success": True}
