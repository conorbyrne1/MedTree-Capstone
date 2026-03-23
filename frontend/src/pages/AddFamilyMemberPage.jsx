// // import React, { useState } from 'react';
// // import { Navigate, useNavigate } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import './AddMedicalPage.css';
// //
// // const AddFamilyMemberPage = () => {
// //     const { isAuthenticated, user } = useAuth();
// //     const navigate = useNavigate();
// //     const [submitting, setSubmitting] = useState(false);
// //     const [success, setSuccess] = useState(false);
// //     const [error, setError] = useState('');
// //
// //     const [form, setForm] = useState({
// //         firstName: '',
// //         middleName: '',
// //         lastName: '',
// //         relationship: '',
// //         deceased: '',
// //         dateOfBirth: '',
// //         gender: '',
// //     });
// //
// //     if (!isAuthenticated) {
// //         return <Navigate to="/login" />;
// //     }
// //
// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setForm(prev => ({ ...prev, [name]: value }));
// //     };
// //
// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setSubmitting(true);
// //         setError('');
// //
// //         try {
// //             const token = localStorage.getItem('medtree_token');
// //             const res = await fetch('http://localhost:8000/professionals/', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     Authorization: `Bearer ${token}`,
// //                 },
// //                 body: JSON.stringify(form),
// //             });
// //
// //             const data = await res.json();
// //             if (!res.ok) throw new Error(data.detail || 'Failed to add family member.');
// //
// //             setSuccess(true);
// //             setForm({ name: '', specialty: '', phone: '', email: '', address: '' });
// //             setTimeout(() => setSuccess(false), 3000);
// //         } catch (err) {
// //             setError(err.message);
// //         } finally {
// //             setSubmitting(false);
// //         }
// //     };
// //
// //     return (
// //         <div className="add-medical-page">
// //             <div className="page-container">
// //                 <div className="page-header">
// //                     <h1>Add Medical Professional</h1>
// //                     <p>Keep track of your healthcare providers</p>
// //                 </div>
// //
// //                 {success && (
// //                     <div className="success-message">
// //                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
// //                             <polyline points="22 4 12 14.01 9 11.01" />
// //                         </svg>
// //                         Family member added successfully!
// //                     </div>
// //                 )}
// //
// //                 {error && (
// //                     <div className="error-message">{error}</div>
// //                 )}
// //
// //                 <div className="form-card">
// //                     <form onSubmit={handleSubmit} className="medical-form">
// //                         <div className="form-group">
// //                             <label htmlFor="name">First Name</label>
// //                             <input
// //                                 type="text"
// //                                 id="name"
// //                                 name="name"
// //                                 value={form.name}
// //                                 onChange={handleChange}
// //                                 placeholder="John Smith"
// //                                 required
// //                             />
// //                         </div>
// //
// //                         <div className="form-group">
// //                             <label htmlFor="name">Middle Name</label>
// //                             <input
// //                                 type="text"
// //                                 id="name"
// //                                 name="name"
// //                                 value={form.name}
// //                                 onChange={handleChange}
// //                                 placeholder="Samuel"
// //                                 optional
// //                             />
// //                         </div>
// //
// //                         <div className="form-group">
// //                             <label htmlFor="name">Last Name</label>
// //                             <input
// //                                 type="text"
// //                                 id="name"
// //                                 name="name"
// //                                 value={form.name}
// //                                 onChange={handleChange}
// //                                 placeholder="Smith"
// //                                 required
// //                             />
// //                         </div>
// //
// //                         <div className="form-group">
// //                             <label htmlFor="specialty">Relationship</label>
// //                             <input
// //                                 type="text"
// //                                 id="specialty"
// //                                 name="specialty"
// //                                 value={form.specialty}
// //                                 onChange={handleChange}
// //                                 placeholder="Father, Mother, Grandparent, etc."
// //                                 required
// //                             />
// //                         </div>
// //
// //                         <div className="form-group">
// //                             <label htmlFor="phone">Phone Number</label>
// //                             <input
// //                                 type="tel"
// //                                 id="phone"
// //                                 name="phone"
// //                                 value={form.phone}
// //                                 onChange={handleChange}
// //                                 placeholder="e.g., (555) 123-4567"
// //                             />
// //                         </div>
// //
// //                         <div className="form-group">
// //                             <label htmlFor="email">Email</label>
// //                             <input
// //                                 type="email"
// //                                 id="email"
// //                                 name="email"
// //                                 value={form.email}
// //                                 onChange={handleChange}
// //                                 placeholder="e.g., doctor@clinic.com"
// //                             />
// //                         </div>
// //
// //                         <div className="form-group">
// //                             <label htmlFor="address">Office Address</label>
// //                             <input
// //                                 type="text"
// //                                 id="address"
// //                                 name="address"
// //                                 value={form.address}
// //                                 onChange={handleChange}
// //                                 placeholder="e.g., 123 Medical Center Dr, Suite 100"
// //                             />
// //                         </div>
// //
// //                         <button type="submit" className="submit-btn" disabled={submitting}>
// //                             {submitting ? <span className="loading-spinner" /> : 'Add Professional'}
// //                         </button>
// //                     </form>
// //                 </div>
// //
// //                 <button className="back-btn" onClick={() => navigate('/home')}>
// //                     ← Back to Home
// //                 </button>
// //             </div>
// //         </div>
// //     );
// // };
// //
// // export default AddFamilyMemberPage;
//
// import React, { useState, useEffect } from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import './AddMedicalPage.css';
//
// const EMPTY_FORM = {
//     type: 'parent',
//     firstName: '',
//     middleName: '',
//     lastName: '',
//     genderIdentity: '',
//     genderAssignedAtBirth: '',
//     dob: '',
//     isDeceased: false,
//     deathDate: '',
//     deathReason: '',
//     deathNotes: '',
//     parentId: '',
// };
//
// const AddFamilyMemberPage = () => {
//     const { isAuthenticated, user } = useAuth();
//     const navigate = useNavigate();
//     const [form, setForm] = useState(EMPTY_FORM);
//     const [submitting, setSubmitting] = useState(false);
//     const [success, setSuccess] = useState(false);
//     const [error, setError] = useState('');
//     const [parents, setParents] = useState([]);
//     const [grandparents, setGrandparents] = useState([]);
//     const [loadingTree, setLoadingTree] = useState(true);
//
//     useEffect(() => {
//         if (!user) return;
//         const loadTree = async () => {
//             try {
//                 const token = localStorage.getItem('medtree_token');
//                 const res = await fetch('http://localhost:8000/family/tree', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const data = await res.json();
//                 if (!res.ok) throw new Error(data.detail || 'Failed to load family tree.');
//                 setParents(data.parents || []);
//                 setGrandparents(data.grandparents || []);
//             } catch (err) {
//                 console.error('Failed to load family tree:', err);
//             } finally {
//                 setLoadingTree(false);
//             }
//         };
//         loadTree();
//     }, [user]);
//
//     if (!isAuthenticated) {
//         return <Navigate to="/login" />;
//     }
//
//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//             // Reset parentId when type changes
//             ...(name === 'type' ? { parentId: '' } : {}),
//         }));
//     };
//
//     const parentOptions = form.type === 'grandparent' ? parents : grandparents;
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSubmitting(true);
//         setError('');
//
//         const payload = {
//             type: form.type,
//             firstName: form.firstName,
//             lastName: form.lastName,
//             middleName: form.middleName || undefined,
//             genderIdentity: form.genderIdentity || undefined,
//             genderAssignedAtBirth: form.genderAssignedAtBirth || undefined,
//             dob: form.dob || undefined,
//             isDeceased: form.isDeceased,
//             deathDate: form.isDeceased && form.deathDate ? form.deathDate : undefined,
//             deathReason: form.isDeceased && form.deathReason ? form.deathReason : undefined,
//             deathNotes: form.isDeceased && form.deathNotes ? form.deathNotes : undefined,
//             parentId: form.type !== 'parent' ? form.parentId : undefined,
//         };
//
//         try {
//             const token = localStorage.getItem('medtree_token');
//             const res = await fetch('http://localhost:8000/family/member', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(payload),
//             });
//
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.detail || 'Failed to add family member.');
//
//             setSuccess(true);
//             setForm(EMPTY_FORM);
//             setTimeout(() => setSuccess(false), 3000);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setSubmitting(false);
//         }
//     };
//
//     const needsParent = form.type === 'grandparent' || form.type === 'great-grandparent';
//     const parentLabel = form.type === 'grandparent' ? 'Parent' : 'Grandparent';
//
//     return (
//         <div className="add-medical-page">
//             <div className="page-container">
//                 <div className="page-header">
//                     <h1>Add Family Member</h1>
//                     <p>Build your family tree by adding relatives</p>
//                 </div>
//
//                 {success && (
//                     <div className="success-message">
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//                             <polyline points="22 4 12 14.01 9 11.01" />
//                         </svg>
//                         Family member added successfully!
//                     </div>
//                 )}
//
//                 {error && (
//                     <div className="error-message">{error}</div>
//                 )}
//
//                 <div className="form-card">
//                     <form onSubmit={handleSubmit} className="medical-form">
//
//                         <div className="form-group">
//                             <label htmlFor="type">Relationship Type</label>
//                             <select
//                                 id="type"
//                                 name="type"
//                                 value={form.type}
//                                 onChange={handleChange}
//                                 required
//                             >
//                                 <option value="parent">Parent</option>
//                                 <option value="grandparent">Grandparent</option>
//                                 <option value="great-grandparent">Great-Grandparent</option>
//                             </select>
//                         </div>
//
//                         {needsParent && (
//                             <div className="form-group">
//                                 <label htmlFor="parentId">{parentLabel}</label>
//                                 {loadingTree ? (
//                                     <span className="loading-spinner" />
//                                 ) : (
//                                     <select
//                                         id="parentId"
//                                         name="parentId"
//                                         value={form.parentId}
//                                         onChange={handleChange}
//                                         required
//                                     >
//                                         <option value="">Select {parentLabel.toLowerCase()}</option>
//                                         {parentOptions.map(m => (
//                                             <option key={m.id} value={m.id}>{m.name}</option>
//                                         ))}
//                                     </select>
//                                 )}
//                             </div>
//                         )}
//
//                         <div className="form-group">
//                             <label htmlFor="firstName">First Name</label>
//                             <input
//                                 type="text"
//                                 id="firstName"
//                                 name="firstName"
//                                 value={form.firstName}
//                                 onChange={handleChange}
//                                 placeholder="e.g., John"
//                                 required
//                             />
//                         </div>
//
//                         <div className="form-group">
//                             <label htmlFor="middleName">Middle Name <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                             <input
//                                 type="text"
//                                 id="middleName"
//                                 name="middleName"
//                                 value={form.middleName}
//                                 onChange={handleChange}
//                                 placeholder="e.g., Samuel"
//                             />
//                         </div>
//
//                         <div className="form-group">
//                             <label htmlFor="lastName">Last Name</label>
//                             <input
//                                 type="text"
//                                 id="lastName"
//                                 name="lastName"
//                                 value={form.lastName}
//                                 onChange={handleChange}
//                                 placeholder="e.g., Smith"
//                                 required
//                             />
//                         </div>
//
//                         <div className="form-group">
//                             <label htmlFor="dob">Date of Birth <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                             <input
//                                 type="date"
//                                 id="dob"
//                                 name="dob"
//                                 value={form.dob}
//                                 onChange={handleChange}
//                             />
//                         </div>
//
//                         <div className="form-group">
//                             <label htmlFor="genderIdentity">Gender Identity <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                             <input
//                                 type="text"
//                                 id="genderIdentity"
//                                 name="genderIdentity"
//                                 value={form.genderIdentity}
//                                 onChange={handleChange}
//                                 placeholder="e.g., Male, Female, Non-binary"
//                             />
//                         </div>
//
//                         <div className="form-group">
//                             <label htmlFor="genderAssignedAtBirth">Gender Assigned at Birth <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                             <input
//                                 type="text"
//                                 id="genderAssignedAtBirth"
//                                 name="genderAssignedAtBirth"
//                                 value={form.genderAssignedAtBirth}
//                                 onChange={handleChange}
//                                 placeholder="e.g., Male, Female"
//                             />
//                         </div>
//
//                         <div className="form-group" style={{flexDirection:'row', alignItems:'center', gap:'0.5rem'}}>
//                             <input
//                                 type="checkbox"
//                                 id="isDeceased"
//                                 name="isDeceased"
//                                 checked={form.isDeceased}
//                                 onChange={handleChange}
//                                 style={{width:'auto', margin:0}}
//                             />
//                             <label htmlFor="isDeceased" style={{marginBottom:0}}>Deceased</label>
//                         </div>
//
//                         {form.isDeceased && (
//                             <>
//                                 <div className="form-group">
//                                     <label htmlFor="deathDate">Date of Death <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                                     <input
//                                         type="date"
//                                         id="deathDate"
//                                         name="deathDate"
//                                         value={form.deathDate}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//
//                                 <div className="form-group">
//                                     <label htmlFor="deathReason">Cause of Death <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                                     <input
//                                         type="text"
//                                         id="deathReason"
//                                         name="deathReason"
//                                         value={form.deathReason}
//                                         onChange={handleChange}
//                                         placeholder="e.g., Heart Disease"
//                                     />
//                                 </div>
//
//                                 <div className="form-group">
//                                     <label htmlFor="deathNotes">Death Notes <span style={{fontWeight:'normal',opacity:0.6}}>(optional)</span></label>
//                                     <input
//                                         type="text"
//                                         id="deathNotes"
//                                         name="deathNotes"
//                                         value={form.deathNotes}
//                                         onChange={handleChange}
//                                         placeholder="Additional notes"
//                                     />
//                                 </div>
//                             </>
//                         )}
//
//                         <button type="submit" className="submit-btn" disabled={submitting}>
//                             {submitting ? <span className="loading-spinner" /> : 'Add Family Member'}
//                         </button>
//                     </form>
//                 </div>
//
//                 <button className="back-btn" onClick={() => navigate('/home')}>
//                     ← Back to Home
//                 </button>
//             </div>
//         </div>
//     );
// };
//
// export default AddFamilyMemberPage;

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddMedicalPage.css';

// The two structural types stored in PersonRelationshipTypes.
// These are what the tree traversal queries — keep this list small and semantic.
// Display labels ("grandparent", "aunt/uncle", etc.) are derived automatically
// by the tree GET endpoint based on traversal depth, not stored here.
const STRUCTURAL_TYPES = [
    { value: 'parent',  label: 'Parent of' },
    { value: 'sibling', label: 'Sibling of' },
];

// Order in which tree sections are flattened into the "Related To" dropdown.
// Each entry maps a tree response key to the label shown in the dropdown.
const TREE_SECTIONS = [
    { key: 'parents',               label: 'parent' },
    { key: 'siblings',              label: 'sibling' },
    { key: 'grandparents',          label: 'grandparent' },
    { key: 'auntsUncles',           label: 'aunt/uncle' },
    { key: 'greatGrandparents',     label: 'great-grandparent' },
    { key: 'greatGreatGrandparents',label: 'great-great-grandparent' },
];

const EMPTY_FORM = {
    structuralType: 'parent',
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
    // Flat list of every person already in the tree, used for "Related To" dropdown.
    const [relatedToOptions, setRelatedToOptions] = useState([]);
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

                // Flatten every section into one list so any person can be selected,
                // regardless of how deep in the tree they are.
                const flat = TREE_SECTIONS.flatMap(({ key, label }) =>
                    (data[key] ?? []).map(m => ({
                        id: m.id,
                        name: `${m.name} (your ${label})`,
                    }))
                );
                setRelatedToOptions(flat);
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
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const payload = {
            // Both fields use the structural type; the tree GET endpoint derives
            // the display label (grandparent, aunt/uncle, etc.) from traversal depth.
            relationship: form.structuralType,
            relationshipType: form.structuralType,
            // Empty string → backend uses the logged-in user as PersonOneID.
            relatedToId: form.relatedToId || undefined,
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
                            <label htmlFor="structuralType">This person is a</label>
                            <select
                                id="structuralType"
                                name="structuralType"
                                value={form.structuralType}
                                onChange={handleChange}
                                required
                            >
                                {STRUCTURAL_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="relatedToId">Related to</label>
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
                                    <option value="">Myself (you)</option>
                                    {relatedToOptions.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

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