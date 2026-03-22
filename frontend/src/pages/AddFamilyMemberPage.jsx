import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddMedicalPage.css';

// Defines every supported relationship type.
// To add a new one, add an entry here — no other changes needed.
//
// relationship:    human-readable label, sent to the API and used as FamilyMemberResponse.type
// relationshipType: the TypeName stored in PersonRelationshipTypes ("parent" or "sibling")
// relatedToPool:  which array from the tree response to use for the "Related To" dropdown;
//                 null means the new person is related directly to the logged-in user
// relatedToLabel: helper text shown above the "Related To" dropdown
const RELATIONSHIP_CONFIG = [
    {
        relationship: 'parent',
        relationshipType: 'parent',
        relatedToPool: null,
        label: 'Parent',
    },
    {
        relationship: 'sibling',
        relationshipType: 'sibling',
        relatedToPool: null,
        label: 'Sibling',
    },
    {
        relationship: 'grandparent',
        relationshipType: 'parent',
        relatedToPool: 'parents',
        label: 'Grandparent',
        relatedToLabel: 'Their child (your parent)',
    },
    {
        relationship: 'aunt/uncle',
        relationshipType: 'sibling',
        relatedToPool: 'parents',
        label: 'Aunt / Uncle',
        relatedToLabel: 'Their sibling (your parent)',
    },
    {
        relationship: 'great-grandparent',
        relationshipType: 'parent',
        relatedToPool: 'grandparents',
        label: 'Great-Grandparent',
        relatedToLabel: 'Their child (your grandparent)',
    },
    {
        relationship: 'great-aunt/uncle',
        relationshipType: 'sibling',
        relatedToPool: 'grandparents',
        label: 'Great-Aunt / Uncle',
        relatedToLabel: 'Their sibling (your grandparent)',
    },
    {
        relationship: 'great-great-grandparent',
        relationshipType: 'parent',
        relatedToPool: 'greatGrandparents',
        label: 'Great-Great-Grandparent',
        relatedToLabel: 'Their child (your great-grandparent)',
    },
];

const EMPTY_FORM = {
    relationship: 'parent',
    relatedToId: '',
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
};

const AddFamilyMemberPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [treeData, setTreeData] = useState({ parents: [], grandparents: [], greatGrandparents: [] });
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
                setTreeData({
                    parents: data.parents || [],
                    grandparents: data.grandparents || [],
                    greatGrandparents: data.greatGrandparents || [],
                });
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
            // Reset relatedToId whenever the relationship type changes
            ...(name === 'relationship' ? { relatedToId: '' } : {}),
        }));
    };

    const activeConfig = RELATIONSHIP_CONFIG.find(c => c.relationship === form.relationship);
    const relatedToOptions = activeConfig?.relatedToPool
        ? treeData[activeConfig.relatedToPool] ?? []
        : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const payload = {
            relationship: activeConfig.relationship,
            relationshipType: activeConfig.relationshipType,
            relatedToId: activeConfig.relatedToPool ? form.relatedToId : undefined,
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
                            <label htmlFor="relationship">Relationship</label>
                            <select
                                id="relationship"
                                name="relationship"
                                value={form.relationship}
                                onChange={handleChange}
                                required
                            >
                                {RELATIONSHIP_CONFIG.map(c => (
                                    <option key={c.relationship} value={c.relationship}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {activeConfig?.relatedToPool && (
                            <div className="form-group">
                                <label htmlFor="relatedToId">{activeConfig.relatedToLabel}</label>
                                {loadingTree ? (
                                    <span className="loading-spinner" />
                                ) : (
                                    <select
                                        id="relatedToId"
                                        name="relatedToId"
                                        value={form.relatedToId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select person</option>
                                        {relatedToOptions.map(m => (
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
                            <label htmlFor="middleName">
                                Middle Name <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                            </label>
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
                            <label htmlFor="dob">
                                Date of Birth <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                            </label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={form.dob}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="genderIdentity">
                                Gender Identity <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                            </label>
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
                            <label htmlFor="genderAssignedAtBirth">
                                Gender Assigned at Birth <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="genderAssignedAtBirth"
                                name="genderAssignedAtBirth"
                                value={form.genderAssignedAtBirth}
                                onChange={handleChange}
                                placeholder="e.g., Male, Female"
                            />
                        </div>

                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="isDeceased"
                                name="isDeceased"
                                checked={form.isDeceased}
                                onChange={handleChange}
                                style={{ width: 'auto', margin: 0 }}
                            />
                            <label htmlFor="isDeceased" style={{ marginBottom: 0 }}>Deceased</label>
                        </div>

                        {form.isDeceased && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="deathDate">
                                        Date of Death <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="deathDate"
                                        name="deathDate"
                                        value={form.deathDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deathReason">
                                        Cause of Death <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                                    </label>
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
                                    <label htmlFor="deathNotes">
                                        Death Notes <span style={{ fontWeight: 'normal', opacity: 0.6 }}>(optional)</span>
                                    </label>
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
