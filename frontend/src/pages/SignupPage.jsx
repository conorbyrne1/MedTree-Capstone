import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';
import PasswordAdditions, { PasswordInput } from "./PasswordAdditions";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    genderIdentity: '',
    genderAssignedAtBirth: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signupOffice } = useAuth();
  const [searchParams] = useSearchParams();
  const [isOffice, setIsOffice] = useState(searchParams.get('office') === 'true');
  const [officeForm, setOfficeForm] = useState({ name: '', username: '', description: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleToggle = (officeMode) => {
    setIsOffice(officeMode);
    setError('');
    setOfficeForm({ name: '', username: '', description: '', password: '', confirmPassword: '' });
    setFormData({
      firstName: '', middleName: '', lastName: '', email: '',
      dobDay: '', dobMonth: '', dobYear: '',
      genderIdentity: '', genderAssignedAtBirth: '',
      password: '', confirmPassword: ''
    });
  };

  const handleOfficeChange = (e) => {
    const { name, value } = e.target;
    setOfficeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfficeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (officeForm.password !== officeForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = await signupOffice({
        name: officeForm.name,
        username: officeForm.username,
        description: officeForm.description,
        password: officeForm.password,
      });
      if (result.success) {
        navigate('/office/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) {
      setError('Date of birth is required');
      return;
    }

    const day = formData.dobDay.padStart(2, '0');
    const month = formData.dobMonth.padStart(2, '0');
    const dob = `${formData.dobYear}-${month}-${day}`;
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      setError('Invalid date of birth');
      return;
    }

    setLoading(true);

    try {
      const day = formData.dobDay.padStart(2, '0');
      const month = formData.dobMonth.padStart(2, '0');
      const dob = `${formData.dobYear}-${month}-${day}`;

      const result = await signup({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dob: dob,
        genderIdentity: formData.genderIdentity,
        genderAssignedAtBirth: formData.genderAssignedAtBirth
      });

      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
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
        <div className="auth-card signup-card">
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
            <h1>{isOffice ? 'Register Your Office' : 'Create Account'}</h1>
            <p>{isOffice ? 'Create an office account to access patient records' : 'Start tracking your family\'s medical history'}</p>
          </div>

          <form onSubmit={isOffice ? handleOfficeSubmit : handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            {isOffice ? (
                <>
                  <div className="form-group">
                    <label htmlFor="officeName">Office Name</label>
                    <input type="text" id="officeName" name="name" value={officeForm.name} onChange={handleOfficeChange} placeholder="e.g., City Medical Center" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="officeUsername">Username</label>
                    <input type="text" id="officeUsername" name="username" value={officeForm.username} onChange={handleOfficeChange} placeholder="e.g., citymedical_office" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="officeDescription">Description <span className="optional">(optional)</span></label>
                    <input type="text" id="officeDescription" name="description" value={officeForm.description} onChange={handleOfficeChange} placeholder="e.g., General practice in Burlington, VT" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="officePassword">Password</label>
                    <PasswordInput id="officePassword" name="password" value={officeForm.password} onChange={handleOfficeChange} placeholder="••••••••" required className={officeForm.password ? 'pw-attached' : ''} />
                    <PasswordAdditions password={officeForm.password} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="officeConfirmPassword">Confirm Password</label>
                    <PasswordInput id="officeConfirmPassword" name="confirmPassword" value={officeForm.confirmPassword} onChange={handleOfficeChange} placeholder="••••••••" required />
                  </div>
                </>
            ) : (
                <>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="middleName">Middle Name</label>
                <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Lee"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group dob-group">
                <label htmlFor="dob">Date of Birth</label>
                <div className="dob-inputs">
                  <input
                    type="text"
                    id="dob-day"
                    name="dobDay"
                    placeholder="DD"
                    maxLength="2"
                    className="dob-input"
                    value={formData.dobDay}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    id="dob-month"
                    name="dobMonth"
                    placeholder="MM"
                    maxLength="2"
                    className="dob-input"
                    value={formData.dobMonth}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    id="dob-year"
                    name="dobYear"
                    placeholder="YYYY"
                    maxLength="4"
                    className="dob-input year"
                    value={formData.dobYear}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="genderIdentity">Gender Identity</label>
              <input
                  type="text"
                  id="genderIdentity"
                  name="genderIdentity"
                  value={formData.genderIdentity}
                  onChange={handleChange}
                  placeholder="The gender you currently identify as"
                  required
              />
            </div>

            <div className="form-group">
              <label htmlFor="genderAssignedAtBirth">Gender Assigned at Birth</label>
              <input
                  type="text"
                  id="genderAssignedAtBirth"
                  name="genderAssignedAtBirth"
                  value={formData.genderAssignedAtBirth}
                  onChange={handleChange}
                  placeholder="The gender you were assigned at birth"
                  required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={formData.password ? 'pw-attached' : ''}
              />
              <PasswordAdditions password={formData.password} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

                </>
            )}

            <button
                type="submit"
                className="auth-btn"
                disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            {isOffice
                ? <p>Already have an office account? <Link to="/login?office=true">Sign in</Link></p>
                : <p>Already have an account? <Link to="/login">Back to Login</Link></p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
