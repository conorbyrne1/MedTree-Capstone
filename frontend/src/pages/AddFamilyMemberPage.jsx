import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddMedicalPage.css';

const EMPTY_FORM = {
    type: 'parent',
    firstName: '',
    middleName: '',
    lastName: '',
    genderIdentity: '',
    genderAssignedAtBirth: '',
    dob: '',
    isDeceased: false,
    deathDate: '',
    deathReason: '',
    deathNotes: '',
    parentId: '',
};

const AddFamilyMemberPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [parents, setParents] = useState([]);
    const [grandparents, setGrandparents] = useState([]);
    const [loadingTree, setLoadingTree] = useState(true);

    useEffect(() => {
        if (!user) return;
        const loadTree = async () => {
            try {
                const token = localStorage.getItem('medtree_token');
                const res = await fetch('http://localhost:8000/family/tree', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Failed to load family tree.');
                if (data.success) {
                    setParents(data.data.parents || []);
                    setGrandparents(data.data.grandparents || []);
                }
            } catch (err) {
                console.error('Failed to load family tree:', err);
            } finally {
                setLoadingTree(false);
            }
        };
        loadTree();
    }, [user]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Reset parentId when type changes
            ...(name === 'type' ? { parentId: '' } : {}),
        }));
    };

    const parentOptions = form.type === 'grandparent' ? parents : grandparents;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const payload = {
            type: form.type,
            firstName: form.firstName,
            lastName: form.lastName,
            middleName: form.middleName || undefined,
            genderIdentity: form.genderIdentity || undefined,
            genderAssignedAtBirth: form.genderAssignedAtBirth || undefined,
            dob: form.dob || undefined,
            isDeceased: form.isDeceased,
            deathDate: form.isDeceased && form.deathDate ? form.deathDate : undefined,
            deathReason: form.isDeceased && form.deathReason ? form.deathReason : undefined,
            deathNotes: form.isDeceased && form.deathNotes ? form.deathNotes : undefined,
            parentId: form.type !== 'parent' ? form.parentId : undefined,
        };

        try {
            const token = localStorage.getItem('medtree_token');
            const res = await fetch('http://localhost:8000/family/member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to add family member.');

            setSuccess(true);
            setForm(EMPTY_FORM);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const needsParent = form.type === 'grandparent' || form.type === 'great-grandparent';
    const parentLabel = form.type === 'grandparent' ? 'Parent' : 'Grandparent';

    return (
        <div className="add-medical-page">
            <div className="page-container">
                <div className="page-header">
                    <h1>Add Family Member</h1>
                    <p>Build your family tree by adding relatives</p>
                </div>

                {success && (
                    <div className="success-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Family member added successfully!
                    </div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <div className="form-card">
                    <form onSubmit={handleSubmit} className="medical-form">

                        <div className="form-group">
                            <label htmlFor="type">Relationship Type</label>
                            <select
                                id="type"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="parent">Parent</option>
                                <option value="grandparent">Grandparent</option>
                                <option value="great-grandparent">Great-Grandparent</option>
                            </select>
                        </div>

                        {needsParent && (
                            <div className="form-group">
                                <label htmlFor="parentId">{parentLabel}</label>
                                {loadingTree ? (
                                    <span className="loading-spinner" />
                                ) : (
                                    <select
                                        id="parentId"
                                        name="parentId"
                                        value={form.parentId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select {parentLabel.toLowerCase()}</option>
                                        {parentOptions.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="e.g., John"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="middleName">Middle Name <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                            <input
                                type="text"
                                id="middleName"
                                name="middleName"
                                value={form.middleName}
                                onChange={handleChange}
                                placeholder="e.g., Samuel"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="e.g., Smith"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={form.dob}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="genderIdentity">Gender Identity <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                            <input
                                type="text"
                                id="genderIdentity"
                                name="genderIdentity"
                                value={form.genderIdentity}
                                onChange={handleChange}
                                placeholder="e.g., Male, Female, Non-binary"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="genderAssignedAtBirth">Gender Assigned at Birth <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                            <input
                                type="text"
                                id="genderAssignedAtBirth"
                                name="genderAssignedAtBirth"
                                value={form.genderAssignedAtBirth}
                                onChange={handleChange}
                                placeholder="e.g., Male, Female"
                            />
                        </div>

                        <div className="form-group" style={{flexDirection:'row', alignItems:'center', gap:'0.5rem'}}>
                            <input
                                type="checkbox"
                                id="isDeceased"
                                name="isDeceased"
                                checked={form.isDeceased}
                                onChange={handleChange}
                                style={{width:'auto', margin:0}}
                            />
                            <label htmlFor="isDeceased" style={{marginBottom:0}}>Deceased</label>
                        </div>

                        {form.isDeceased && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="deathDate">Date of Death <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                                    <input
                                        type="date"
                                        id="deathDate"
                                        name="deathDate"
                                        value={form.deathDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deathReason">Cause of Death <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                                    <input
                                        type="text"
                                        id="deathReason"
                                        name="deathReason"
                                        value={form.deathReason}
                                        onChange={handleChange}
                                        placeholder="e.g., Heart Disease"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deathNotes">Death Notes <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
                                    <input
                                        type="text"
                                        id="deathNotes"
                                        name="deathNotes"
                                        value={form.deathNotes}
                                        onChange={handleChange}
                                        placeholder="Additional notes"
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? <span className="loading-spinner" /> : 'Add Family Member'}
                        </button>
                    </form>
                </div>

                <button className="back-btn" onClick={() => navigate('/home')}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default AddFamilyMemberPage;
