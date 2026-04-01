import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OfficeDashboardPage.css';

const OfficeDashboardPage = () => {
    const { isOfficeAuthenticated, office, logoutOffice, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [medicalData, setMedicalData] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingMedical, setLoadingMedical] = useState(false);
    const [error, setError] = useState(null);

    const loadPatients = useCallback(async () => {
        if (!office) return;
        setLoadingPatients(true);
        setError(null);
        try {
            const token = localStorage.getItem('medtree_office_token');
            const res = await fetch('http://localhost:8000/office/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) { logoutOffice(); navigate('/office/login'); return; }
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to load patients.');
            setPatients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingPatients(false);
        }
    }, [office, logoutOffice, navigate]);

    const loadMedicalData = async (patient) => {
        setSelectedPatient(patient);
        setMedicalData(null);
        setLoadingMedical(true);
        try {
            const token = localStorage.getItem('medtree_office_token');
            const res = await fetch(`http://localhost:8000/office/patients/${patient.person_id}/medical`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to load medical data.');
            setMedicalData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMedical(false);
        }
    };

    useEffect(() => {
        if (!authLoading) loadPatients();
    }, [authLoading, loadPatients]);

    if (!authLoading && !isOfficeAuthenticated) {
        return <Navigate to="/office/login" />;
    }

    if (authLoading || loadingPatients) {
        return (
            <div className="office-dashboard">
                <div className="loading-state">
                    <div className="loading-spinner large" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="office-dashboard">
            <div className="dashboard-container">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>{office?.name}</h1>
                        <p>Connected patient records</p>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="dashboard-layout">

                    {/* Patient list */}
                    <div className="patient-list-panel">
                        <h2>Connected Patients</h2>
                        {patients.length === 0 ? (
                            <div className="empty-state">
                                <p>No patients connected yet.</p>
                                <p>Patients connect to your office from their account page.</p>
                            </div>
                        ) : (
                            <ul className="patient-list">
                                {patients.map(p => (
                                    <li
                                        key={p.person_id}
                                        className={`patient-item ${selectedPatient?.person_id === p.person_id ? 'active' : ''}`}
                                        onClick={() => loadMedicalData(p)}
                                    >
                                        <div className="patient-avatar">
                                            {p.FirstName[0]}{p.LastName[0]}
                                        </div>
                                        <div className="patient-info">
                                            <span className="patient-name">{p.FirstName} {p.LastName}</span>
                                            <span className="patient-dob">DOB: {new Date(p.DateOfBirth).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Medical detail panel */}
                    <div className="medical-panel">
                        {!selectedPatient && (
                            <div className="empty-state centered">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>Select a patient to view their medical history</p>
                            </div>
                        )}

                        {selectedPatient && loadingMedical && (
                            <div className="loading-state">
                                <div className="loading-spinner large" />
                                <p>Loading medical history...</p>
                            </div>
                        )}

                        {selectedPatient && medicalData && (
                            <>
                                <div className="medical-panel-header">
                                    <h2>{selectedPatient.FirstName} {selectedPatient.LastName}</h2>
                                    <span className="dob-badge">DOB: {new Date(selectedPatient.DateOfBirth).toLocaleDateString()}</span>
                                </div>

                                {/* Diagnoses */}
                                <div className="medical-section">
                                    <h3>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Diagnoses
                                    </h3>
                                    {medicalData.diagnoses.length === 0 ? (
                                        <p className="none-recorded">None recorded</p>
                                    ) : (
                                        <div className="record-list">
                                            {medicalData.diagnoses.map((d, i) => (
                                                <div key={i} className="record-card">
                                                    <div className="record-title">{d.DiagnosisName}</div>
                                                    {d.DiagnosisDescription && <div className="record-desc">{d.DiagnosisDescription}</div>}
                                                    <div className="record-meta">
                                                        {d.DateDiagnosed && <>Diagnosed: {new Date(d.DateDiagnosed).toLocaleDateString()}</>}
                                                        {d.IsCauseOfDeath ? <span className="cause-of-death-badge">Cause of Death</span> : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Medications */}
                                <div className="medical-section">
                                    <h3>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        Medications
                                    </h3>
                                    {medicalData.medications.length === 0 ? (
                                        <p className="none-recorded">None recorded</p>
                                    ) : (
                                        <div className="record-list">
                                            {medicalData.medications.map((m, i) => (
                                                <div key={i} className="record-card">
                                                    <div className="record-title">{m.MedicationName}</div>
                                                    {m.MedicationDescription && <div className="record-desc">{m.MedicationDescription}</div>}
                                                    <div className="record-meta">
                                                        {m.DatePrescribed && <>Prescribed: {new Date(m.DatePrescribed).toLocaleDateString()}</>}
                                                        {m.DateStopped && <> · Stopped: {new Date(m.DateStopped).toLocaleDateString()}</>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Allergies */}
                                <div className="medical-section">
                                    <h3>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Allergies
                                    </h3>
                                    {medicalData.allergies.length === 0 ? (
                                        <p className="none-recorded">None recorded</p>
                                    ) : (
                                        <div className="record-list">
                                            {medicalData.allergies.map((a, i) => (
                                                <div key={i} className="record-card">
                                                    <div className="record-title">{a.AllergicTo}</div>
                                                    {a.AllergyDescription && <div className="record-desc">{a.AllergyDescription}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficeDashboardPage;