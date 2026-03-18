from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import hash_password, verify_password, create_access_token
from schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Signup
@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):

    # Check if email already exists
    existing = db.execute(text("""
                               SELECT a.ID FROM Account a
                               WHERE a.Username = :email
                               """), {"email": body.email}).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Parse date of birth if provided
    dob = None
    if body.dob:
        try:
            from datetime import datetime
            # Accept either YYYY-MM-DD or DD/MM/YYYY
            for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
                try:
                    dob = datetime.strptime(body.dob, fmt).date()
                    break
                except ValueError:
                    continue
            if dob is None:
                raise ValueError
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date of Birth is Required"
        )

    # Insert Person row
    person_result = db.execute(text("""
                                    INSERT INTO Person (FirstName, MiddleName,
                                                        LastName, IsDeceased,
                                                        DateOfBirth,
                                                        GenderIdentity,
                                                        GenderAssignedAtBirth)
                                    VALUES (:first, :middle, :last, 0, :dob,
                                            :gender_identity, :gender_assigned)
                                    """), {
                                   "first": body.firstName,
                                   "middle": body.middleName,
                                   "last": body.lastName,
                                   "dob": dob,
                                   "gender_identity": body.genderIdentity,
                                   "gender_assigned": body.genderAssignedAtBirth
                               })
    db.flush()
    person_id = person_result.lastrowid

    # Insert Account row
    print(f"Password value: '{body.password}', type: {type(body.password)}, length: {len(body.password)}")
    account_result = db.execute(text("""
                                     INSERT INTO Account (Username, Password, PersonID)
                                     VALUES (:username, :password, :person_id)
                                     """), {
                                    "username": body.email,
                                    "password": hash_password(body.password),
                                    "person_id": person_id
                                })
    db.flush()
    account_id = account_result.lastrowid

    db.commit()

    token = create_access_token({"account_id": account_id})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=account_id,
            firstName=body.firstName,
            lastName=body.lastName,
            email=body.email
        )
    )

# Login
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):

    row = db.execute(text("""
                          SELECT a.ID as account_id, a.Password,
                                 p.FirstName, p.LastName, a.Username
                          FROM Account a
                                   JOIN Person p ON p.ID = a.PersonID
                          WHERE a.Username = :email
                          """), {"email": body.email}).mappings().first()

    if row is None or not verify_password(body.password, row["Password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"account_id": row["account_id"]})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=row["account_id"],
            firstName=row["FirstName"],
            lastName=row["LastName"],
            email=row["Username"]
        )
    )
