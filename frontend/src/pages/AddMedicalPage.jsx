import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddMedicalPage.css';

const AddMedicalPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('condition');

  const [conditionForm, setConditionForm] = useState({
    memberId: '',
    issue: '',
    notes: ''
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    prescribedBy: '',
    reason: ''
  });

  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('medtree_token');
        const res = await fetch('http://localhost:8000/family/tree', {
          headers: {Authorization: `Bearer ${token}`}
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to load family members.');
        const members = [
          data.user,
          ...(data.parents || []),
          ...(data.siblings || []),
          ...(data.grandparents || []),
          ...(data.auntsUncles || []),
          ...(data.greatGrandparents || []),
          ...(data.greatGreatGrandparents || []),
        ].filter(Boolean);
        setFamilyMembers(members);
      } catch (err) {
        console.error('Failed to load family members:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFamilyMembers();
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleConditionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('medtree_token');
      const res = await fetch('http://localhost:8000/medical/condition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberId: conditionForm.memberId,
          issue: conditionForm.issue,
          notes: conditionForm.notes.split('\n').filter(n => n.trim())
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add condition.');
      setSuccess(true);
      setConditionForm({ memberId: '', issue: '', notes: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add condition:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('medtree_token');
      const res = await fetch('http://localhost:8000/medical/medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(medicationForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add medication');
      setSuccess(true);
      setMedicationForm({ name: '', dosage: '', prescribedBy: '', reason: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add medication:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-medical-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Add Medical Information</h1>
          <p>Record new health conditions or medications</p>
        </div>

        {success && (
          <div className="success-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Information saved successfully!
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'condition' ? 'active' : ''}`}
            onClick={() => setActiveTab('condition')}
          >
            Medical Condition
          </button>
          <button 
            className={`tab ${activeTab === 'medication' ? 'active' : ''}`}
            onClick={() => setActiveTab('medication')}
          >
            Medication
          </button>
        </div>

        <div className="form-card">
          {activeTab === 'condition' ? (
            <form onSubmit={handleConditionSubmit} className="medical-form">
              <div className="form-group">
                <label htmlFor="member">Family Member</label>
                <select
                  id="member"
                  value={conditionForm.memberId}
                  onChange={(e) => setConditionForm(prev => ({ ...prev, memberId: e.target.value }))}
                  required
                >
                  <option value="">Select family member</option>
                  {familyMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition Name</label>
                <input
                  type="text"
                  id="condition"
                  value={conditionForm.issue}
                  onChange={(e) => setConditionForm(prev => ({ ...prev, issue: e.target.value }))}
                  placeholder="e.g., Type 2 Diabetes"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (one per line)</label>
                <textarea
                  id="notes"
                  value={conditionForm.notes}
                  onChange={(e) => setConditionForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Diagnosed in 2020&#10;Controlled with medication"
                  rows="4"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <span className="loading-spinner" /> : 'Add Condition'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMedicationSubmit} className="medical-form">
              <div className="form-group">
                <label htmlFor="medName">Medication Name</label>
                <input
                  type="text"
                  id="medName"
                  value={medicationForm.name}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Metformin"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dosage">Dosage</label>
                <input
                  type="text"
                  id="dosage"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 500mg twice daily"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prescribedBy">Prescribed By</label>
                <input
                  type="text"
                  id="prescribedBy"
                  value={medicationForm.prescribedBy}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, prescribedBy: e.target.value }))}
                  placeholder="e.g., Dr. Smith"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <input
                  type="text"
                  id="reason"
                  value={medicationForm.reason}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Blood sugar control"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <span className="loading-spinner" /> : 'Add Medication'}
              </button>
            </form>
          )}
        </div>

        <button className="back-btn" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AddMedicalPage;
