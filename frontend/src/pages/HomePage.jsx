import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  // If authenticated, show the logged-in homepage
  if (isAuthenticated) {
    return (
      <div className="home-page authenticated">
        <div className="home-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.firstName || 'User'}!</h1>
            <p>Manage your family medical history and track important health information.</p>
          </div>

          <div className="action-cards">
            <Link to="/tree" className="action-card tree">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {/*
                      currently using svg instead of react icons because when the website was generated from the
                      figma it decided to use SVG's. Will replace with react icons.
                  */}
                  {/* Canopy */}
                  {/*<path d="M 12 2.5 Q 13 1.5 14.5 2.2 Q 15.5 1.2 17 2 Q 18.5 1 19.5 2.3 Q 21 1.8 20.8 3.2 Q 22 4 21.5 5.3 Q 22.5 6.3 21.8 7.5 Q 22.5 8.8 21.5 9.5 Q 22 10.8 20.8 11.2 Q 20.5 12.5 19.2 12.2 Q 18.5 13.2 17 12.8 Q 15.8 13.8 14.5 13.2 Q 13.5 14 12.5 13.2 Q 11.5 14 10.5 13.2 Q 9.2 13.8 8 12.8 Q 6.5 13.2 5.8 12.2 Q 4.5 11.8 4 10.5 Q 2.8 9.8 3.5 8.5 Q 2.5 7.3 3.2 6 Q 2.5 4.8 3.5 3.8 Q 3.2 2.3 4.8 2.2 Q 5.8 1 7.2 2 Q 8.5 1.2 9.5 2.2 Q 10.5 1.5 12 2.5 Z" />*/}
                  <path d="
                  M 12 2
                  Q 14 0.5, 16.5 2
                  Q 19 0.5, 21 3
                  Q 23.5 5, 21.5 8
                  Q 23 11, 20 13
                  Q 18 15, 15 13.5
                  Q 13 15, 11 13.5
                  Q 8 15, 6 13
                  Q 3 11, 4.5 8
                  Q 2.5 5, 5 3
                  Q 7 0.5, 9.5 2
                  Q 10.5 0.5, 12 2 Z" />
                  {/* Left trunk */}
                  <path d="M 10 13 Q 10.5 16 10.2 19 Q 10 21 9.8 23" />
                  {/* Right trunk */}
                  <path d="M 15 13 Q 13.5 16 13.8 19 Q 14 21 14.2 23" />
                </svg>
              </div>
              <h3>View Medical Tree</h3>
              <p>Explore your family's medical history in an interactive tree view</p>
            </Link>

            <Link to="/add-family" className="action-card primary">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Add Family Members</h3>
              <p>Add a family member and their medical information to your family tree</p>
            </Link>

            <Link to="/add-medical" className="action-card secondary">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Add Medical Info</h3>
              <p>Record new medical conditions, medications, or health updates</p>
            </Link>

            <Link to="/add-professional" className="action-card tertiary">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Add Medical Professional</h3>
              <p>Keep track of your healthcare providers and specialists</p>
            </Link>

            <Link to="/edit-info" className="action-card quaternary">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <h3>Edit Info</h3>
              <p>Update or remove existing family members, medical records, and professionals</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="home-page landing">
      <div className="landing-content">
        <div className="hero-section">
          <h1>Track Your Family's<br /><span>Medical History</span></h1>
          <p>
            MedTree helps you visualize and manage your family's medical history, 
            making it easier to understand genetic health patterns and share important 
            information with healthcare providers.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="features-section">
          <div className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h3>Interactive Family Tree</h3>
            <p>Visualize medical conditions across generations</p>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Secure & Private</h3>
            <p>Your health data is encrypted and protected</p>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <h3>Easy to Share</h3>
            <p>Export reports for your healthcare providers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
