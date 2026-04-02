import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';
import { PasswordInput } from './PasswordAdditions';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginOffice } = useAuth();
  const [searchParams] = useSearchParams();
  const [isOffice, setIsOffice] = useState(searchParams.get('office') === 'true');
  const [username, setUsername] = useState('');  const navigate = useNavigate();

  const handleToggle = (officeMode) => {
    setIsOffice(officeMode);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isOffice
          ? await loginOffice(username, password)
          : await login(email, password);
      if (result.success) {
        navigate(isOffice ? '/office/dashboard' : '/home');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-type-toggle">
            <button
                className={`toggle-btn ${!isOffice ? 'active' : ''}`}
                onClick={() => handleToggle(false)}
                type="button"
            >
              Patient
            </button>
            <button
                className={`toggle-btn ${isOffice ? 'active' : ''}`}
                onClick={() => handleToggle(true)}
                type="button"
            >
              Medical Office
            </button>
          </div>

          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>{isOffice ? 'Sign in to your office account' : 'Sign in to access your medical tree'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              {isOffice ? (
                  <>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., citymedical_office"
                        required
                    />
                  </>
              ) : (
                  <>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                    />
                  </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner" />
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            {isOffice
                ? <p>Don't have an office account? <Link to="/signup?office=true">Register your office</Link></p>
                : <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            }
          </div>

          <div className="demo-credentials">
            <p><strong>Demo credentials:</strong></p>
            <p>Email: john@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
