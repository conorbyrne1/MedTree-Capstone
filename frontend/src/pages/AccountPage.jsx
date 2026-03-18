import React, {useState} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AccountPage.css';
import PasswordAdditions, { PasswordInput } from './PasswordAdditions';

const AccountPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [editMode,setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [pwForm, setPwForm] = useState({});
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditOpen = () => {
    setEditForm({
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth || '',
      genderIdentity: user?.genderIdentity || '',
      genderAssignedAtBirth: user?.genderAssignedAtBirth || '',
      isDeceased: user?.isDeceased || false,
    });
    setEditPassword('');
    setEditError('');
    setEditSuccess('');
    setEditMode(true);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditForm('');
    setEditSuccess('');
  };

  const handleEditSave = async () => {
    if (!editPassword) {
      setEditError('Password is required to save changes.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const token = localStorage.getItem('medtree_token');
      const res = await fetch(`http://localhost:8000/account/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...editForm, currentPassword: editPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.detail || 'Failed to save changes.');
      } else {
        const updatedUser = { ...user, ...editForm };
        localStorage.setItem('medtree_token', JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch {
      setEditError('Could not connect to server.');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePwOpen = () => {
    setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPwError('');
    setPwMode(true);
  };

  const handlePwCancel = () => {
    setPwMode(false);
    setPwError('');
  };

  const handlePwSave = async () => {
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('All fields are required.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwLoading(true);
    setPwError('');
    try {
      const token = localstorage.getItem('medtree_token');
      const res = await fetch(`http://localhost:8000/account/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: pwForm.oldPassword,
          newPassword: pwForm.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.detail || 'Failed to change password.');
      } else {
        setPwMode(false);
      }
    } catch {
      setPwError('Could not connect to server.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="page-header">
          <h1>My Account</h1>
          <p>Manage your profile and settings</p>
        </div>

        <div className="account-card">
          {pwMode ? (
              <>
                <div className="edit-header">
                  <h2>Change Password</h2>
                  <p>Enter your current password and choose a new one.</p>
                </div>

                {pwError && <div className="edit-error">{pwError}</div>}

                <div className="detail-row edit-row">
                  <span className="label">Current Password</span>
                  <div className="pw-input-wrap">
                    <PasswordInput
                        className="edit-input"
                        placeholder="Current password"
                        value={pwForm.oldPassword}
                        onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="detail-row edit-row pw-row">
                  <span className="label">New Password</span>
                  <div className="pw-input-wrap">
                    <PasswordInput
                        className="edit-input pw-attached"
                        placeholder="New password"
                        value={pwForm.newPassword}
                        onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    />
                    <PasswordAdditions password={pwForm.newPassword} />
                  </div>
                </div>
                <div className="detail-row edit-row">
                  <span className="label">Confirm New</span>
                  <div className="pw-input-wrap">
                    <PasswordInput
                        className="edit-input"
                        placeholder="Confirm new password"
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="edit-actions">
                  <button className="action-btn primary-save" onClick={handlePwSave} disabled={pwLoading}>
                    {pwLoading ? <span className="loading-spinner small" /> : 'Update Password'}
                  </button>
                  <button className="action-btn secondary" onClick={handlePwCancel}>
                    ← Back
                  </button>
                </div>
              </>
          ) : editMode ? (
              <>
                <div className="edit-header">
                  <h2>Edit Profile</h2>
                  <p>Update your account information below.</p>
                </div>

                {editError && <div className="edit-error">{editError}</div>}
                {editSuccess && <div className="edit-success">{editSuccess}</div>}

                <div className="edit-form">
                  <div className="detail-row edit-row">
                    <span className="label">First Name</span>
                    <input
                        className="edit-input"
                        value={editForm.firstName}
                        onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Middle Name</span>
                    <input
                        className="edit-input"
                        value={editForm.middleName}
                        onChange={e => setEditForm(f => ({ ...f, middleName: e.target.value }))}
                        placeholder="Optional"
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Last Name</span>
                    <input
                        className="edit-input"
                        value={editForm.lastName}
                        onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Email</span>
                    <input
                        className="edit-input"
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Date of Birth</span>
                    <input
                        className="edit-input"
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Gender Identity</span>
                    <input
                        className="edit-input"
                        value={editForm.genderIdentity}
                        onChange={e => setEditForm(f => ({ ...f, genderIdentity: e.target.value }))}
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Assigned at Birth</span>
                    <input
                        className="edit-input"
                        value={editForm.genderAssignedAtBirth}
                        onChange={e => setEditForm(f => ({ ...f, genderAssignedAtBirth: e.target.value }))}
                    />
                  </div>
                  <div className="detail-row edit-row">
                    <span className="label">Deceased</span>
                    <label className="toggle-label">
                      <input
                          type="checkbox"
                          className="toggle-checkbox"
                          checked={editForm.isDeceased}
                          onChange={e => setEditForm(f => ({ ...f, isDeceased: e.target.checked }))}
                      />
                      <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
                    </label>
                  </div>

                  <div className="edit-password-section">
                    <label className="edit-password-label">
                      Confirm with your current password to save
                    </label>
                    <div className="pw-input-wrap" style={{ width: '100%' }}>
                      <PasswordInput
                          className="edit-input"
                          placeholder="Current password"
                          value={editPassword}
                          onChange={e => setEditPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="edit-actions">
                    <button className="action-btn primary-save" onClick={handleEditSave} disabled={editLoading}>
                      {editLoading ? <span className="loading-spinner small" /> : 'Save Changes'}
                    </button>
                    <button className="action-btn secondary" onClick={handleEditCancel}>
                      Cancel
                    </button>
                  </div>
                </div>
              </>
          ) : (
              <>
                <div className="profile-section">
                  <div className="avatar">
                    <span>{user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}</span>
                  </div>
                  <div className="profile-info">
                    <h2>{user?.firstName} {user?.lastName}</h2>
                    <p>{user?.email}</p>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Account Details</h3>
                  <div className="detail-row">
                    <span className="label">Full Name</span>
                    <span className="value">
            {[user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' ') || '-'}
          </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email</span>
                    <span className="value">{user?.email || '-'}</span>
                  </div>
                </div>

                <div className="actions-section">
                  <button className="action-btn secondary" onClick={handleEditOpen}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button className="action-btn secondary" onClick={handlePwOpen}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Change Password
                  </button>
                  <button className="action-btn danger" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
