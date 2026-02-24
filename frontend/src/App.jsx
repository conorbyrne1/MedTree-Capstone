import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FamilyTreePage from './pages/FamilyTreePage';
import AboutPage from './pages/AboutPage';
import AccountPage from './pages/AccountPage';
import AddMedicalPage from './pages/AddMedicalPage';
import AddProfessionalPage from './pages/AddProfessionalPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Protected routes */}
              <Route path="/tree" element={<FamilyTreePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/add-medical" element={<AddMedicalPage />} />
              <Route path="/add-professional" element={<AddProfessionalPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
