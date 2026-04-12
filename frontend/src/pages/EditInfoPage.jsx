import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddMedicalPage.css';
import './EditInfoPage.css';

const API = 'http://localhost:8000';

// ── helpers ──────────────────────────────────────────────────────────────────

const token = () => localStorage.getItem('medtree_token');

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

// ── sub-components ────────────────────────────────────────────────────────────

function ConfirmButton({ onConfirm, label = 'Remove', className = 'remove-btn' }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <span className="confirm-inline">
        <span className="confirm-text">Are you sure?</span>
        <button className="confirm-yes" onClick={() => { setConfirming(false); onConfirm(); }}>Yes</button>
        <button className="confirm-no" onClick={() => setConfirming(false)}>No</button>
      </span>
    );
  }
  return (
    <button className={className} onClick={() => setConfirming(true)}>{label}</button>
  );
}

// ── Family Members tab ────────────────────────────────────────────────────────

function FamilyMembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/family/members');
      setMembers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (m) => {
    setEditingId(m.personId);
    setEditForm({
      firstName: m.firstName,
      middleName: m.middleName || '',
      lastName: m.lastName,
      dob: m.dob || '',
      genderIdentity: m.genderIdentity || '',
      genderAssignedAtBirth: m.genderAssignedAtBirth || '',
      isDeceased: m.isDeceased,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveEdit = async (personId) => {
    setSaving(true);
    try {
      await apiFetch(`/family/member/${personId}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          middleName: editForm.middleName || undefined,
          genderIdentity: editForm.genderIdentity || undefined,
          genderAssignedAtBirth: editForm.genderAssignedAtBirth || undefined,
          dob: editForm.dob || undefined,
          isDeceased: editForm.isDeceased,
        }),
      });
      setEditingId(null);
      setSuccessMsg('Family member updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (personId) => {
    try {
      await apiFetch(`/family/member/${personId}`, { method: 'DELETE' });
      setSuccessMsg('Family member removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setMembers(prev => prev.filter(m => m.personId !== personId));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="edit-loading">Loading family members…</div>;

  return (
    <div className="edit-tab-content">
      {successMsg && <div className="success-message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {members.length === 0 ? (
        <p className="edit-empty">No family members added yet.</p>
      ) : (
        <div className="edit-list">
          {members.map(m => (
            <div key={m.personId} className="edit-item">
              {editingId === m.personId ? (
                <div className="edit-inline-form">
                  <div className="edit-item-header">
                    <span className="edit-item-type">{m.memberType}</span>
                    <span className="edit-item-editing-label">Editing</span>
                  </div>
                  <div className="inline-fields">
                    <div className="form-group">
                      <label>First Name</label>
                      <input name="firstName" value={editForm.firstName} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label>Middle Name <span className="optional">(optional)</span></label>
                      <input name="middleName" value={editForm.middleName} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input name="lastName" value={editForm.lastName} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth <span className="optional">(optional)</span></label>
                      <input type="date" name="dob" value={editForm.dob} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Gender Identity <span className="optional">(optional)</span></label>
                      <input name="genderIdentity" value={editForm.genderIdentity} onChange={handleEditChange} placeholder="e.g., Male, Female, Non-binary" />
                    </div>
                    <div className="form-group">
                      <label>Gender Assigned at Birth <span className="optional">(optional)</span></label>
                      <input name="genderAssignedAtBirth" value={editForm.genderAssignedAtBirth} onChange={handleEditChange} placeholder="e.g., Male, Female" />
                    </div>
                    <div className="form-group checkbox-group">
                      <input type="checkbox" id={`dec-${m.personId}`} name="isDeceased" checked={editForm.isDeceased} onChange={handleEditChange} />
                      <label htmlFor={`dec-${m.personId}`}>Deceased</label>
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button className="save-btn" onClick={() => saveEdit(m.personId)} disabled={saving}>
                      {saving ? <span className="loading-spinner" /> : 'Save Changes'}
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="edit-item-row">
                  <div className="edit-item-info">
                    <span className="edit-item-name">{m.name}</span>
                    <span className="edit-item-type">{m.memberType}</span>
                    {m.dob && <span className="edit-item-detail">DOB: {m.dob}</span>}
                    {m.isDeceased && <span className="edit-item-deceased">Deceased</span>}
                  </div>
                  <div className="edit-item-btns">
                    <button className="edit-btn" onClick={() => startEdit(m)}>Edit</button>
                    <ConfirmButton onConfirm={() => removeMember(m.personId)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Medical Info tab ──────────────────────────────────────────────────────────

function MedicalInfoTab() {
  const [conditionGroups, setConditionGroups] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [conds, meds] = await Promise.all([
        apiFetch('/medical/conditions-list'),
        apiFetch('/medical/medications-list'),
      ]);
      setConditionGroups(conds.filter(g => g.conditions.length > 0));
      setMedications(meds);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeCondition = async (personId, diagnosisId) => {
    try {
      await apiFetch(`/medical/condition/${personId}/${diagnosisId}`, { method: 'DELETE' });
      setSuccessMsg('Condition removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setConditionGroups(prev =>
        prev.map(g =>
          g.personId === personId
            ? { ...g, conditions: g.conditions.filter(c => c.diagnosisId !== diagnosisId) }
            : g
        ).filter(g => g.conditions.length > 0)
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const removeMedication = async (medicationId) => {
    try {
      await apiFetch(`/medical/medication/${medicationId}`, { method: 'DELETE' });
      setSuccessMsg('Medication removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setMedications(prev => prev.filter(m => m.medicationId !== medicationId));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="edit-loading">Loading medical info…</div>;

  const noData = conditionGroups.length === 0 && medications.length === 0;

  return (
    <div className="edit-tab-content">
      {successMsg && <div className="success-message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {noData ? (
        <p className="edit-empty">No medical information recorded yet.</p>
      ) : (
        <>
          {conditionGroups.length > 0 && (
            <section className="edit-section">
              <h3 className="edit-section-title">Medical Conditions</h3>
              {conditionGroups.map(group => (
                <div key={group.personId} className="edit-group">
                  <div className="edit-group-header">
                    <span className="edit-item-name">{group.memberName}</span>
                    <span className="edit-item-type">{group.memberType}</span>
                  </div>
                  <div className="edit-list">
                    {group.conditions.map(c => (
                      <div key={c.diagnosisId} className="edit-item edit-item-row">
                        <div className="edit-item-info">
                          <span className="edit-item-name">{c.issue}</span>
                          {c.notes && <span className="edit-item-detail">{c.notes}</span>}
                        </div>
                        <div className="edit-item-btns">
                          <ConfirmButton onConfirm={() => removeCondition(group.personId, c.diagnosisId)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {medications.length > 0 && (
            <section className="edit-section">
              <h3 className="edit-section-title">Your Medications</h3>
              <div className="edit-list">
                {medications.map(m => (
                  <div key={m.medicationId} className="edit-item edit-item-row">
                    <div className="edit-item-info">
                      <span className="edit-item-name">{m.name}</span>
                      {m.description && <span className="edit-item-detail">{m.description}</span>}
                    </div>
                    <div className="edit-item-btns">
                      <ConfirmButton onConfirm={() => removeMedication(m.medicationId)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ── Professionals tab ─────────────────────────────────────────────────────────

function ProfessionalsTab() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/professionals/');
      setProfessionals(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      specialty: p.specialty,
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (profId) => {
    setSaving(true);
    try {
      await apiFetch(`/professionals/${profId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name,
          specialty: editForm.specialty,
          phone: editForm.phone || undefined,
          email: editForm.email || undefined,
          address: editForm.address || undefined,
        }),
      });
      setEditingId(null);
      setSuccessMsg('Professional updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeProfessional = async (profId) => {
    try {
      await apiFetch(`/professionals/${profId}`, { method: 'DELETE' });
      setSuccessMsg('Professional removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setProfessionals(prev => prev.filter(p => p.id !== profId));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="edit-loading">Loading professionals…</div>;

  return (
    <div className="edit-tab-content">
      {successMsg && <div className="success-message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {professionals.length === 0 ? (
        <p className="edit-empty">No medical professionals added yet.</p>
      ) : (
        <div className="edit-list">
          {professionals.map(p => (
            <div key={p.id} className="edit-item">
              {editingId === p.id ? (
                <div className="edit-inline-form">
                  <div className="edit-item-header">
                    <span className="edit-item-type">Medical Professional</span>
                    <span className="edit-item-editing-label">Editing</span>
                  </div>
                  <div className="inline-fields">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input name="name" value={editForm.name} onChange={handleEditChange} placeholder="e.g., Dr. Sarah Williams" required />
                    </div>
                    <div className="form-group">
                      <label>Specialty</label>
                      <input name="specialty" value={editForm.specialty} onChange={handleEditChange} placeholder="e.g., Cardiologist" required />
                    </div>
                    <div className="form-group">
                      <label>Phone <span className="optional">(optional)</span></label>
                      <input name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="e.g., (555) 123-4567" />
                    </div>
                    <div className="form-group">
                      <label>Email <span className="optional">(optional)</span></label>
                      <input type="email" name="email" value={editForm.email} onChange={handleEditChange} placeholder="e.g., doctor@clinic.com" />
                    </div>
                    <div className="form-group">
                      <label>Office Address <span className="optional">(optional)</span></label>
                      <input name="address" value={editForm.address} onChange={handleEditChange} placeholder="e.g., 123 Medical Center Dr" />
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button className="save-btn" onClick={() => saveEdit(p.id)} disabled={saving}>
                      {saving ? <span className="loading-spinner" /> : 'Save Changes'}
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="edit-item-row">
                  <div className="edit-item-info">
                    <span className="edit-item-name">{p.name}</span>
                    <span className="edit-item-type">{p.specialty}</span>
                    {p.phone && <span className="edit-item-detail">{p.phone}</span>}
                    {p.email && <span className="edit-item-detail">{p.email}</span>}
                    {p.address && <span className="edit-item-detail">{p.address}</span>}
                  </div>
                  <div className="edit-item-btns">
                    <button className="edit-btn" onClick={() => startEdit(p)}>Edit</button>
                    <ConfirmButton onConfirm={() => removeProfessional(p.id)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const EditInfoPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('family');

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="add-medical-page">
      <div className="page-container edit-info-container">
        <div className="page-header">
          <h1>Edit Info</h1>
          <p>Update or remove existing family members, medical records, and professionals</p>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'family' ? 'active' : ''}`} onClick={() => setActiveTab('family')}>
            Family Members
          </button>
          <button className={`tab ${activeTab === 'medical' ? 'active' : ''}`} onClick={() => setActiveTab('medical')}>
            Medical Info
          </button>
          <button className={`tab ${activeTab === 'professionals' ? 'active' : ''}`} onClick={() => setActiveTab('professionals')}>
            Professionals
          </button>
        </div>

        <div className="form-card edit-info-card">
          {activeTab === 'family' && <FamilyMembersTab />}
          {activeTab === 'medical' && <MedicalInfoTab />}
          {activeTab === 'professionals' && <ProfessionalsTab />}
        </div>

        <button className="back-btn" onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default EditInfoPage;
