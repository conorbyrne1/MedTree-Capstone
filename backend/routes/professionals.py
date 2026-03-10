from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user
from schemas import AddProfessionalRequest, AddProfessionalResponse

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
