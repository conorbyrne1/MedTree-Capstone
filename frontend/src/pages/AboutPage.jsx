import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1>About MedTree</h1>
          <p>Understanding your family's medical history, made simple.</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              MedTree was created to help individuals and families track, visualize, 
              and share their medical history across generations. Understanding your 
              family's health patterns can be crucial for preventive care and making 
              informed medical decisions.
            </p>
          </section>

          <section className="about-section">
            <h2>Why Family Medical History Matters</h2>
            <p>
              Many health conditions have genetic components. By knowing what conditions 
              have affected your parents, grandparents, and other relatives, you and your 
              healthcare providers can:
            </p>
            <ul>
              <li>Identify potential health risks earlier</li>
              <li>Recommend appropriate screening tests</li>
              <li>Make more informed treatment decisions</li>
              <li>Take preventive measures when possible</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-wrapper user">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Interactive Family Tree</h3>
                <p>Visualize your entire family's medical history in an intuitive, draggable tree view.</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper parent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3>Detailed Health Records</h3>
                <p>Track medical conditions, medications, treatments, and important health events.</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper grandparent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>Secure & Private</h3>
                <p>Your sensitive health information is encrypted and stored securely.</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper user">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <h3>Easy to Use</h3>
                <p>Simple, intuitive interface that makes adding and viewing information effortless.</p>
              </div>
            </div>
          </section>

          <section className="about-section contact">
            <h2>Contact Us</h2>
            <p>
              Have questions or suggestions? We'd love to hear from you.
            </p>
            <a href="mailto:support@medtree.com" className="contact-btn">
              Get in Touch
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
