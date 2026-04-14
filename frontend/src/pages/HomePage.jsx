import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import {SVG3D} from "3dsvg";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const mySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 588.99 598.22">
  <defs>
    <style>
      .cls-1 {
        fill: #080808;
      }

      .cls-2 {
        fill: #060606;
      }

      .cls-3 {
        fill: #212121;
      }

      .cls-4 {
        fill: #0a0a0a;
      }

      .cls-5 {
        fill: #040404;
      }
    </style>
  </defs>
  <path class="cls-2" d="M276.94.48c137.65-7.84,261.17,81.3,299.77,212.73,44.15,150.35-33.97,312.4-181.24,366.79C211.77,647.84,18.07,518.07,1.15,325.76-13.33,161.12,110.15,9.98,276.94.48ZM282.94,14.48C45.16,26.16-68.3,310.25,90.19,486.73c147.9,164.68,414.9,95.02,471.73-116.26C610.38,190.28,471.83,5.2,282.94,14.48Z"/>
  <path class="cls-5" d="M267.19,134.23c-.05.11-1.28.37-1.79,1.67-1.49,3.74-1.74,7.45-3.67,11.37-4.67,9.49-12.76,12.98-22.98,10.91-10.76-2.19-17.72-12.08-16.55-22.94-6.78,1.02-17.26-2.29-18.81-9.69-1.8-8.6,1.92-22.95,10.78-26.36.69-.55-2.32-5.33-2.74-6.67-3.53-11.31,3.77-25.27,15.71-27.34.09-6.79,4.15-15.94,10.14-19.36,1.53-.87,3.57-.97,4.91-2.09,1.47-1.23,3.44-5.78,4.66-6.54,1.79-1.12,6.75-1.34,8.86-.95,1.71.31,2.61,2.05,3.99,2.06,2.7.01,7.25-6.43,13.82-4.88,5.32,1.26,5.86.23,10.16.84,1.93.28,3.52,2.02,5.04,2.02,1.69,0,2.59-2.07,4.18-2.84,4.76-2.29,9.22-2.97,14.02-.41,2.09,1.12,3.11,3.02,4.91,4.09,2.52,1.49,5.86,1.51,8.01,4.06,1.34.31,3.6-3.19,6.05-3.74,5.84-1.31,16.22,1.5,15.33,8.8,6.76-.89,14.47,3.83,15.04,10.96,14.48.61,20.68,7.03,19.98,21.58-.07,1.54-.88,2.78-1.01,4.05-.46,4.41,4.26,7.89,4.93,12.97.72,5.45-2.02,11.66-1.77,13.8.23,1.9,3.15,5.11,3.63,7.34,2.18,10.16-6.06,18.54-13.34,24.28-.91,4.74,1.26,5.96-1.05,10.95-4.99,10.77-16.94,12.92-26.8,7.13-3.76,4.22-7.43,8.06-12.91,10.15-12.97,4.96-28.15-.19-23.24-16.24.46-1.51,2.17-3.26,2.39-4.62s-3.31-6.37-1.86-9.33c-3.98-.17-9.27-1.34-12.29-3.98-1.3-1.13-3.48-5.63-3.84-5.89-.79-.56-4.36.1-6.19-.32-1.25-.28-2.36-1.56-3.34-1.72-.8-.13-5.56,3.39-8.08,3.74-1.65.23-2.71-.85-4.25-.85-.24,1.13.33,3.2,0,4Z"/>
  <path class="cls-2" d="M364.98,209.03c-1.02,1-12.43,5.46-14.52,5.98-14.51,3.59-32-.02-40.9-12.66-14.07-.72-29.17,1.51-41.75,8.01-4.51,2.33-12.39,9.56-13.44,14.56-.6,2.86-.48,9.64.03,12.6,1.44,8.44,11.79,18.12,19.69,20.81,1.24,8.61,1.25,17.19,1.1,25.9-.98,1-10.56-4.17-12.32-5.17-23.57-13.51-39.42-35.3-29.71-63.36,8.78-25.4,38.7-36.85,63.5-38.5,5.35-.35,11.94.76,17.01,0,3.36-.5,7.81-3.43,12.08-3.91,10.88-1.23,25.54,6.13,32.44,14.43,3.05,3.68,10.72,17.44,6.79,21.3ZM330.78,186.32c-3.18.93-2.63,10.96,4.42,7.42,4.33-2.18,1.48-9.14-4.42-7.42Z"/>
  <path class="cls-2" d="M268.46,395.96c2.09,2.21,11.51,6.06,11.67,6.85l-1.94,18.42c-.44.46-5.33-1.62-6.34-2.15-6.29-3.31-17.44-12.02-20.86-18.14-7.88-14.1-4.41-31.34,8.27-41.14,14.35-11.09,46.89-19.46,55.78-33.22,6.43-9.95-2.84-24.01-11.9-28.95l2.17-21.79c.78-1.81,2.41-1.99,4.22-1.46,1.64.48,9.72,5.98,11.6,7.41,8.08,6.14,18.19,19.27,18.15,29.94-.02,4.89-1.44,14.36-3.05,19.03-9.31,27.13-49.31,28.89-68.07,46.93-5.6,5.38-4.76,12.91.31,18.27Z"/>
  <path class="cls-2" d="M302.19,207.23v41c3.67-3.72,10.15-7.28,13.03-11.47,1.56-2.26,2.66-7.03,3.92-9.93.54-1.24,2.07-.42,3.05-.6-.5,5.65-2.92,10.83-5,15.99,3.31.24,9.23,1.99,7.95,6.44-.99,3.43-11.46-.41-15.29.72-1.88.56-6.54,6.59-7.41,8.59-2.65,6.07-.92,19.47-1.21,26.79-.35,8.78-1.75,18.16-2.06,26.94-.21,5.88,1.2,19.35-.12,23.88-.73,2.49-13.66,8.45-16.85,8.65v-16.5c0-.34-2.51-5.36-2.97-6.03-2.94-4.33-11.7-7.01-14.27-12.73-.83-1.84-2.15-10.75-2.51-13.48-.24-1.76-.4-3.47-.25-5.25,2.63-.51,1.7.59,2.46,1.99,1.91,3.49,4.55,10.45,7.07,12.97,1.39,1.39,3.35,1.76,4.97,3.03,2.32,1.8,3.18,4.5,5.48,6.01-.56-5.57-.89-10.93-1.02-16.53-.48-20.44-.6-42.63.06-62.94.25-7.76-1.58-15.22-2.08-22.94.29-1.89,19.84-3.61,23.05-4.59Z"/>
  <path class="cls-1" d="M300.19,417.73c.14-.5,1.61-1.81,2.45-1.46,3.49,3.19,8.84,4.73,12.52,7.5,11.38,8.58,17.74,22.2,12.23,36.15-3.49,8.83-11.76,14.49-19.87,19.13-11.11,6.36-27.13,8.61-35.85,17.15-4.06,3.97-6.65,10.47-9.97,15.03-.99-1.87-1.42-4.32-1.54-6.45-.27-4.9,1.26-11.76,4.56-15.53,2.87-3.28,12.39-11.48,16.16-13.84,10.1-6.34,28.73-10.81,33.54-22.46,3.94-9.53-7.75-15.71-14.22-20.22.71-4.12-.97-11.4,0-15Z"/>
  <path class="cls-1" d="M323.99,531.42c1.14.89,1.98,4.98-.42,5.69-3.51,1.05-13.66.45-17.07-1.7l-6.32-4.18c.23,5.99,4.97,10.88,4,17l-3.03-.63-8.96-14.37c-.86,7.76-5.92,14.05-10.51,20-.93.28-2.25-.87-2.45-1.55-.62-2.08,4.18-13.68,4.75-17.16.45-2.75.14-5.53.2-8.29-6.52,5.41-14.37,9.59-22.99,10-1.09-7.04,5.83-7.21,10.5-11,3.95-3.2,10.62-11.56,11.45-16.55.38-2.27.96-6.69,1.1-8.94.13-2.12-1.23-5.49-.62-6.51,1.75-2.93,8.76-3.62,12.12-4.95,1.54-.61,2.38-1.86,3.94-2.05,2.55.68,1.25,9,1.48,11.54s.68,6.56,1.09,8.91c2.63,14.9,6.89,17,19.04,24,.86.5,2.21.36,2.7.75Z"/>
  <path class="cls-1" d="M285.19,445.73c-.3-1.08-3.56-2.38-4.01-4.99-1.01-5.83,1.35-8.39,3.81-13.15-2.61-13.35-2.05-26.48-2.77-39.89-.23-4.22-3.38-13.57,1.64-16.3l15.33-5.17-1.99,39c2.06-.23,2.4-5.39,5-3.5-.69,3.68-4.49,8.68-4.98,12.02-1.09,7.39.27,18.07,0,26.01-.06,1.71-.99,3.23-1.06,4.94-.2,4.66.97,14.2-.13,17.87-.88,2.97-10.84,9.44-10.84,5.16v-22Z"/>
  <path class="cls-4" d="M267.19,134.23c3.17-.7,5.46-2.76,8.99-2-.46,3.39,1.54,5.78,2.82,8.71.68,1.56.55,1.92,2.69,1.28,3.08-.92-.14-9.02,3.09-9.91s3.97.37,4.37,3.45.19,7.1-1.16,9.76c-.72,1.42-2.36,2.32-2.69,3.37-.24.77.69,6.03.9,6.34,1.29,1.93,1.82-.75,2.21-1.29,1.5-2.08,4.23-5.05,5.25-6.75,2.57-4.29.64-7.11,8.54-5.97,2.13,7.18-3.81,10.99-4.79,16.72-.49,2.89.59,10.66-1.16,11.84l-17.06,1.45c-.24-5.68-.3-12.45-3.15-17.35-3.64-6.28-10.1-10.7-8.85-19.65Z"/>
  <path class="cls-3" d="M374.37,216.04c1.33,1.35,5.46.48,6.81,2.69-1.23,1.74-2.52,1.72-4.47,1.49-5.09-.61-6.08-7.87-10.52-10.49,1.42-2.45,4.02-1.04,5.54.45,1.9,1.87,1.68,4.89,2.64,5.86Z"/>
</svg>`;

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
          <div style={{ width: '220px', height: '220px', margin: '0 auto 1.5rem' }}>
            <SVG3D
                svg={mySvg}
                smoothness={0.6}
                color="#ffffff"
                material="rubber"
                metalness={0}
                roughness={0.9}
                animate="float"
                cursorOrbit
            />
          </div>
          <p>here</p>
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
