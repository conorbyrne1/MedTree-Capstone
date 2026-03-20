from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_user, verify_password, hash_password
from schemas import (
    UpdateAccountRequest, UpdateAccountResponse,
    ChangePasswordRequest, ChangePasswordResponse,
    UserResponse
)

router = APIRouter(prefix="/account", tags=["account"])

@router.get("/me", response_model=UserResponse)
def get_me(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    dob_str = current_user["DateOfBirth"].strftime("%Y-%m-%d") if current_user["DateOfBirth"] else None
    return UserResponse(
        id=current_user["account_id"],
        firstName=current_user["FirstName"],
        middleName=current_user["MiddleName"],
        lastName=current_user["LastName"],
        email=current_user["Username"],
        dateOfBirth=dob_str,
        genderIdentity=current_user["GenderIdentity"],
        genderAssignedAtBirth=current_user["GenderAssignedAtBirth"],
        isDeceased=bool(current_user["IsDeceased"])
    )

@router.put("/update", response_model=UpdateAccountResponse)
def update_account(
        body: UpdateAccountRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    account_id = current_user["account_id"]
    person_id = current_user["PersonID"]

    # Verify current password
    row = db.execute(text("""
                          SELECT Password FROM Account WHERE ID = :id
                          """), {"id": account_id}).mappings().first()

    if not row or not verify_password(body.currentPassword, row["Password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    # Parse DOB
    dob = None
    if body.dateOfBirth:
        from datetime import datetime
        for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                dob = datetime.strptime(body.dateOfBirth, fmt).date()
                break
            except ValueError:
                continue
        if dob is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

    # Check if new email is taken by a different account
    if body.email != current_user["Username"]:
        taken = db.execute(text("""
                                SELECT ID FROM Account WHERE Username = :email AND ID != :id
                                """), {"email": body.email, "id": account_id}).first()
        if taken:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )

    # Update Person
    db.execute(text("""
                    UPDATE Person SET
                                      FirstName = :first,
                                      MiddleName = :middle,
                                      LastName = :last,
                                      DateOfBirth = :dob,
                                      GenderIdentity = :gender_identity,
                                      GenderAssignedAtBirth = :gender_assigned,
                                      IsDeceased = :deceased
                    WHERE ID = :person_id
                    """), {
                   "first": body.firstName,
                   "middle": body.middleName,
                   "last": body.lastName,
                   "dob": dob,
                   "gender_identity": body.genderIdentity,
                   "gender_assigned": body.genderAssignedAtBirth,
                   "deceased": 1 if body.isDeceased else 0,
                   "person_id": person_id
               })

    # Update Account email (username)
    db.execute(text("""
                    UPDATE Account SET Username = :email WHERE ID = :id
                    """), {"email": body.email, "id": account_id})

    db.commit()

    updated_row = db.execute(text("""
                              SELECT a.ID as account_id, a.PersonID, a.Username,
                                     p.FirstName, p.MiddleName, p.LastName,
                                     p.DateOfBirth, p.GenderIdentity, p.GenderAssignedAtBirth, p.IsDeceased
                              FROM Account a
                                       JOIN Person p ON p.ID = a.PersonID
                              WHERE a.ID = :id
                              """), {"id": account_id}).mappings().first()

    dob_str = updated_row["DateOfBirth"].strftime("%Y-%m-%d") if updated_row["DateOfBirth"] else None

    return UpdateAccountResponse(
        success=True,
        user=UserResponse(
            id=updated_row["account_id"],
            firstName=updated_row["FirstName"],
            middleName=updated_row["MiddleName"],
            lastName=updated_row["LastName"],
            email=updated_row["Username"],
            dateOfBirth=dob_str,
            genderIdentity=updated_row["GenderIdentity"],
            genderAssignedAtBirth=updated_row["GenderAssignedAtBirth"],
            isDeceased=bool(updated_row["IsDeceased"])
        )
    )


@router.put("/password", response_model=ChangePasswordResponse)
def change_password(
        body: ChangePasswordRequest,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
):
    account_id = current_user["account_id"]

    # Verify current password
    row = db.execute(text("""
                          SELECT Password FROM Account WHERE ID = :id
                          """), {"id": account_id}).mappings().first()

    if not row or not verify_password(body.currentPassword, row["Password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current password"
        )

    # Update to new password
    db.execute(text("""
                    UPDATE Account SET Password = :password WHERE ID = :id
                    """), {"password": hash_password(body.newPassword), "id": account_id})

    db.commit()
    return ChangePasswordResponse(success=True)