import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const OfficeSignupPage = () => {
    const { signupOffice, isOfficeAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isOfficeAuthenticated) {
        return <Navigate to="/office/dashboard" />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await signupOffice({
            name: form.name,
            username: form.username,
            password: form.password,
            description: form.description,
        });

        if (result.success) {
            navigate('/office/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Register Your Office</h1>
                    <p>Create an account to access connected patient records</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Office Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g., City Medical Center"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="e.g., citymedical_office"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description <span className="optional">(optional)</span></label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="e.g., General practice serving Burlington, VT"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repeat your password"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="loading-spinner" /> : 'Register Office'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an office account? <Link to="/office/login">Sign in</Link></p>
                    <p>Are you a patient? <Link to="/login">Patient login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default OfficeSignupPage;