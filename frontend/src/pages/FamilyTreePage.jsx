import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FamilyTree from '../components/FamilyTree';
import './FamilyTreePage.css';

const FamilyTreePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFamilyTree = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('medtree_token');
        const res = await fetch('http://localhost:8000/family/tree', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to load family tree.');
        setFamilyData(data);
      } catch (err) {
        setError('Failed to load family tree');
      } finally {
        setLoading(false);
      }
    };
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="tree-page">
        <div className="loading-state">
          <div className="loading-spinner large" />
          <p>Loading your family tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tree-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-page">
      <div className="tree-header">
        <h1>Your Medical Family Tree</h1>
        <p>Click on cards to expand details • Drag to pan • Scroll to zoom</p>
      </div>
      <FamilyTree familyData={familyData} />
    </div>
  );
};

export default FamilyTreePage;
