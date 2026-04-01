import React, { useState } from 'react';
import './FamilyCard.css';

const FamilyCard = ({ member, onUpdate }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  const getTypeClass = () => {
    switch (member.type) {
      case 'user': return 'card-user';
      case 'parent':
      case 'sibling': return 'card-parent';
      case 'grandparent':
      case 'aunt/uncle':
      case 'great-grandparent':
      case 'great-aunt/uncle':
      case 'great-great-grandparent': return 'card-grandparent';
      default: return 'card-parent';
    }
  };

  const TYPE_LABELS = {
    user: 'User Info:',
    parent: 'Parent Info:',
    sibling: 'Sibling Info:',
    grandparent: 'Grandparent Info:',
    'aunt/uncle': 'Aunt / Uncle Info:',
    'great-grandparent': 'Great-Grandparent Info:',
    'great-aunt/uncle': 'Great-Aunt / Uncle Info:',
    'great-great-grandparent': 'Great-Great-Grandparent Info:',
  };

  const getTypeLabel = () => TYPE_LABELS[member.type] ?? `${member.type} Info:`;

  const getSections = () => {
    const sections = [
      { id: 'info', label: getTypeLabel() }
    ];
    
    if (member.medicalIssues && member.medicalIssues.length > 0) {
      sections.push({ id: 'medical', label: 'Medical Issues' });
    }
    
    if (member.type === 'user' && member.medications) {
      sections.push({ id: 'medications', label: 'Medications' });
    }
    
    if (member.type !== 'user' && member.deathInfo) {
      sections.push({ id: 'death', label: 'Death Information' });
    }
    
    return sections;
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderInfoSection = () => (
    <div className="card-content">
      {member.info.age && <p><strong>Age:</strong> {member.info.age}</p>}
      {member.info.dob && <p><strong>DOB:</strong> {member.info.dob}</p>}
      {member.info.genderIdentity && <p><strong>Gender Identity:</strong> {member.info.genderIdentity}</p>}
      {member.info.genderAssignedAtBirth && <p><strong>Assigned at Birth:</strong> {member.info.genderAssignedAtBirth}</p>}
      {member.type !== 'user' && member.info.alive !== undefined && (
        <p>
          <strong>Alive:</strong> {member.info.alive ? 'Yes' : 
            `No${member.deathInfo?.date ? `, died ${member.deathInfo.date}` : ''}`}
        </p>
      )}
    </div>
  );

  const renderMedicalSection = () => (
    <div className="card-content">
      {member.medicalIssues && member.medicalIssues.length > 0 ? (
        <ol className="medical-list">
          {member.medicalIssues.map((issue, index) => (
            <li key={index}>
              <span className="issue-name">{issue.issue}</span>
              {issue.notes && issue.notes.length > 0 && (
                <ol type="a" className="notes-list">
                  {issue.notes.map((note, noteIndex) => (
                    <li key={noteIndex}>{note}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="no-data">No medical issues recorded</p>
      )}
    </div>
  );

  const renderMedicationsSection = () => (
    <div className="card-content">
      {member.medications && member.medications.length > 0 ? (
        <div className="medications-list">
          {member.medications.map((med, index) => (
            <div key={index} className="medication-item">
              <p><strong>{med.name}</strong> ({med.dosage})</p>
              <p className="med-detail">Prescribed by: {med.prescribedBy}</p>
              <p className="med-detail">For: {med.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No medications recorded</p>
      )}
    </div>
  );

  const renderDeathSection = () => (
    <div className="card-content">
      {member.deathInfo ? (
        <>
          <p><strong>Date of Death:</strong> {member.deathInfo.date}</p>
          <p><strong>Reason of Death:</strong> {member.deathInfo.reason}</p>
          {member.deathInfo.notes && (
            <p><strong>Other notes:</strong> {member.deathInfo.notes}</p>
          )}
        </>
      ) : (
        <p className="no-data">No death information</p>
      )}
    </div>
  );

  const renderSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'info': return renderInfoSection();
      case 'medical': return renderMedicalSection();
      case 'medications': return renderMedicationsSection();
      case 'death': return renderDeathSection();
      default: return null;
    }
  };

  const sections = getSections();

  return (
    <div className={`family-card ${getTypeClass()}`}>
      <div className="card-header">
        <h3 className="card-name">{member.name}</h3>
      </div>
      
      <div className="card-sections">
        {sections.map((section) => (
          <div key={section.id} className="section">
            <button 
              className={`section-toggle ${expandedSection === section.id ? 'expanded' : ''}`}
              onClick={() => toggleSection(section.id)}
            >
              <span>{section.label}</span>
              <svg 
                className="toggle-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            <div className={`section-content ${expandedSection === section.id ? 'expanded' : ''}`}>
              {renderSectionContent(section.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyCard;
