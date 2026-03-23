from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

# Authorization and Account
class SignupRequest(BaseModel):
    firstName: str
    lastName: str
    middleName: Optional[str] = None
    email: str
    password: str
    dob: Optional[str] = None
    genderIdentity: Optional[str] = None
    genderAssignedAtBirth: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    email: str
    dateOfBirth: Optional[str] = None
    genderIdentity: Optional[str] = None
    genderAssignedAtBirth: Optional[str] = None
    isDeceased: bool = False

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Family Members
class MedicalIssueSchema(BaseModel):
    issue: str
    notes: list[str] = []

class MedicationSchema(BaseModel):
    name: str
    dosage: Optional[str] = None
    prescribedBy: Optional[str] = None
    reason: Optional[str] = None

class DeathInfoSchema(BaseModel):
    date: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class PersonInfoSchema(BaseModel):
    age: Optional[int] = None
    dob: Optional[str] = None
    genderIdentity: Optional[str] = None
    genderAssignedAtBirth: Optional[str] = None
    alive: Optional[bool] = None

class FamilyMemberResponse(BaseModel):
    id: str
    type: str
    name: str
    info: PersonInfoSchema
    medicalIssues: list[MedicalIssueSchema] = []
    medications: list[MedicationSchema] = []
    deathInfo: Optional[DeathInfoSchema] = None
    # used for grandparents to link to parent
    parentId: Optional[str] = None

class FamilyTreeResponse(BaseModel):
    user: FamilyMemberResponse
    parents: list[FamilyMemberResponse] = []
    siblings: list[FamilyMemberResponse] = []
    grandparents: list[FamilyMemberResponse] = []
    auntsUncles: list[FamilyMemberResponse] = []
    greatGrandparents: list[FamilyMemberResponse] = []
    greatGreatGrandparents: list[FamilyMemberResponse] = []

# # Adding Family Members
# class AddFamilyMemberRequest(BaseModel):
#     # 'parent', 'grandparent', 'great-grandparent'
#     type: str
#     firstName: str
#     lastName: str
#     middleName: Optional[str] = None
#     genderIdentity: Optional[str] = None
#     genderAssignedAtBirth: Optional[str] = None
#     dob: Optional[str] = None
#     isDeceased: bool = False
#     deathDate: Optional[str] = None
#     deathReason: Optional[str] = None
#     deathNotes: Optional[str] = None
#     # for grandparents: the 'p{id}' string of their child
#     parentId: Optional[str] = None

class AddFamilyMemberRequest(BaseModel):
    # Human-readable label used as FamilyMemberResponse.type in the response
    # e.g. "parent", "sibling", "grandparent", "aunt/uncle", "great-grandparent"
    relationship: str
    # The TypeName stored in PersonRelationshipTypes: "parent", "sibling", etc.
    relationshipType: str
    # Prefixed person ID (e.g. "p5", "g3") this new member is related to.
    # None means related directly to the logged-in user.
    relatedToId: Optional[str] = None
    firstName: str
    lastName: str
    middleName: Optional[str] = None
    genderIdentity: Optional[str] = None
    genderAssignedAtBirth: Optional[str] = None
    dob: Optional[str] = None
    isDeceased: bool = False
    deathDate: Optional[str] = None
    deathReason: Optional[str] = None
    deathNotes: Optional[str] = None

# Medical Conditions
class AddConditionRequest(BaseModel):
    # the 'u{id}' / 'p{id}' / 'g{id}' string from frontend
    memberId: str
    issue: str
    notes: list[str] = []
    isCauseOfDeath: bool = False
    dateDiagnosed: Optional[datetime] = None

class AddConditionResponse(BaseModel):
    success: bool

# Medications
class AddMedicationRequest(BaseModel):
    name: str
    dosage: Optional[str] = None
    prescribedBy: Optional[str] = None
    reason: Optional[str] = None

class AddMedicationResponse(BaseModel):
    success: bool

# Medical Professionals
class AddProfessionalRequest(BaseModel):
    name: str
    specialty: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class AddProfessionalResponse(BaseModel):
    success: bool
    id: int

    # Account update
class UpdateAccountRequest(BaseModel):
    firstName: str
    middleName: Optional[str] = None
    lastName: str
    email: str
    dateOfBirth: Optional[str] = None
    genderIdentity: Optional[str] = None
    genderAssignedAtBirth: Optional[str] = None
    isDeceased: bool = False
    currentPassword: str

class UpdateAccountResponse(BaseModel):
    success: bool
    user: UserResponse

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str

class ChangePasswordResponse(BaseModel):
    success: bool
