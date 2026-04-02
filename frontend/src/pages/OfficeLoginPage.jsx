import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const OfficeLoginPage = () => {
    const { loginOffice, isOfficeAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
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
        setLoading(true);
        const result = await loginOffice(form.username, form.password);
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
                    <h1>Medical Office Login</h1>
                    <p>Sign in to view your connected patients</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Office Username</label>
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
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Your password"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="loading-spinner" /> : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an office account? <Link to="/office/signup">Register your office</Link></p>
                    <p>Are you a patient? <Link to="/login">Patient login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default OfficeLoginPage;