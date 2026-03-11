import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddMedicalPage.css';

const AddFamilyMemberPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        specialty: '',
        phone: '',
        email: '',
        address: ''
    });

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('medtree_token');
            const res = await fetch('http://localhost:8000/professionals/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to add professional.');

            setSuccess(true);
            setForm({ name: '', specialty: '', phone: '', email: '', address: '' });
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
                    <h1>Add Medical Professional</h1>
                    <p>Keep track of your healthcare providers</p>
                </div>

                {success && (
                    <div className="success-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Medical professional added successfully!
                    </div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <div className="form-card">
                    <form onSubmit={handleSubmit} className="medical-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g., Dr. Sarah Williams"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="specialty">Specialty</label>
                            <input
                                type="text"
                                id="specialty"
                                name="specialty"
                                value={form.specialty}
                                onChange={handleChange}
                                placeholder="e.g., Cardiologist"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="e.g., (555) 123-4567"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="e.g., doctor@clinic.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Office Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="e.g., 123 Medical Center Dr, Suite 100"
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? <span className="loading-spinner" /> : 'Add Professional'}
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
