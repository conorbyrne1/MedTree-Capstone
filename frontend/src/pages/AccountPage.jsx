import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AccountPage.css';

const AccountPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="page-header">
          <h1>My Account</h1>
          <p>Manage your profile and settings</p>
        </div>

        <div className="account-card">
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
              <span className="label">First Name</span>
              <span className="value">{user?.firstName || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Last Name</span>
              <span className="value">{user?.lastName || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email</span>
              <span className="value">{user?.email || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Member Since</span>
              <span className="value">January 2024</span>
            </div>
          </div>

          <div className="actions-section">
            <button className="action-btn secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
            <button className="action-btn secondary">
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
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
