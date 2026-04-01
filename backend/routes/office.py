from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from auth import get_current_office

router = APIRouter(prefix="/office", tags=["office"])

@router.get("/patients")
def get_connected_patients(office=Depends(get_current_office), db: Session = Depends(get_db)):
    rows = db.execute(text("""
                           SELECT p.ID as person_id, p.FirstName, p.LastName, p.DateOfBirth, p.GenderIdentity
                           FROM MedicalOfficePerson mop
                                    JOIN Person p ON p.ID = mop.PersonID
                           WHERE mop.MedicalOfficeID = :office_id
                           """), {"office_id": office["office_id"]}).mappings().all()
    return [dict(r) for r in rows]

@router.get("/patients/{person_id}/medical")
def get_patient_medical(person_id: int, office=Depends(get_current_office), db: Session = Depends(get_db)):
    # Verify this patient is connected to this office
    link = db.execute(text("""
                           SELECT 1 FROM MedicalOfficePerson
                           WHERE MedicalOfficeID = :office_id AND PersonID = :person_id
                           """), {"office_id": office["office_id"], "person_id": person_id}).first()

    if not link:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Patient not connected to this office.")

    diagnoses = db.execute(text("""
                                SELECT md.DiagnosisName, md.DiagnosisDescription, pmd.DateDiagnosed, pmd.IsCauseOfDeath
                                FROM PersonMedicalDiagnosis pmd
                                         JOIN MedicalDiagnosis md ON md.ID = pmd.DiagnosisID
                                WHERE pmd.PersonID = :pid
                                """), {"pid": person_id}).mappings().all()

    medications = db.execute(text("""
                                  SELECT m.MedicationName, m.MedicationDescription, pm.DatePrescribed, pm.DateStopped
                                  FROM PersonMedications pm
                                           JOIN Medications m ON m.ID = pm.MedicationID
                                  WHERE pm.PersonID = :pid
                                  """), {"pid": person_id}).mappings().all()

    allergies = db.execute(text("""
                                SELECT a.AllergicTo, a.AllergyDescription
                                FROM PersonAllergies pa
                                         JOIN Allergies a ON a.ID = pa.AllergyID
                                WHERE pa.PersonID = :pid
                                """), {"pid": person_id}).mappings().all()

    return {
        "diagnoses": [dict(r) for r in diagnoses],
        "medications": [dict(r) for r in medications],
        "allergies": [dict(r) for r in allergies],
    }