import React, { useState, useRef, useEffect, useCallback } from 'react';
import FamilyCard from './FamilyCard';
import './FamilyTree.css';

const FamilyTree = ({ familyData }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [showResetButton, setShowResetButton] = useState(false);
  const [scale, setScale] = useState(1);

  // Mouse/Touch event handlers for dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.family-card')) return;
    setIsDragging(true);
    setStartPos({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newTranslate = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    };
    setTranslate(newTranslate);
    if (Math.abs(newTranslate.x) > 10 || Math.abs(newTranslate.y) > 10) {
      setShowResetButton(true);
    }
  }, [isDragging, startPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e) => {
    if (e.target.closest('.family-card')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({
      x: touch.clientX - translate.x,
      y: touch.clientY - translate.y
    });
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newTranslate = {
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y
    };
    setTranslate(newTranslate);
    if (Math.abs(newTranslate.x) > 10 || Math.abs(newTranslate.y) > 10) {
      setShowResetButton(true);
    }
  }, [isDragging, startPos]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = () => {
    setTranslate({ x: 0, y: 0 });
    setScale(1);
    setShowResetButton(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(prev + delta, 0.5), 2));
      setShowResetButton(true);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Check if we have family data
  if (!familyData) {
    return (
        <div className="tree-empty">
          <p>No family data available. Add family members to build your medical tree.</p>
        </div>
    );
  }

  const { user, parents = [], grandparents = [], greatGrandparents = [] } = familyData;

  // Group grandparents by their parent
  const getGrandparentsByParent = (parentId) => {
    return grandparents.filter(gp => gp.parentId === parentId);
  };

  return (
    <div 
      className={`tree-container ${isDragging ? 'dragging' : ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {showResetButton && (
        <button className="reset-view-btn" onClick={resetView}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset View
        </button>
      )}
      
      <div 
        className="tree-canvas"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        }}
      >
        {/* Great Grandparents Row */}
        {greatGrandparents.length > 0 && (
          <>
            <div className="tree-row great-grandparents-row">
              {greatGrandparents.map((ggp) => (
                <div key={ggp.id} className="tree-node">
                  <FamilyCard member={ggp} />
                </div>
              ))}
            </div>
            <div className="connector-row">
              <svg className="connectors" preserveAspectRatio="none">
                {/* Add connector lines as needed */}
              </svg>
            </div>
          </>
        )}

        {/* Grandparents Row */}
        {grandparents.length > 0 && (
          <>
            <div className="tree-row grandparents-row">
              {grandparents.map((gp) => (
                <div key={gp.id} className="tree-node">
                  <FamilyCard member={gp} />
                  <div className="connector-line vertical-down" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Parents Row */}
        {parents.length > 0 && (
          <>
            <div className="connector-section">
              <svg className="connector-svg" viewBox="0 0 1200 80">
                {/* Left pair connectors */}
                {grandparents.length >= 2 && (
                  <>
                    <line x1="200" y1="0" x2="200" y2="30" stroke="#888" strokeWidth="2" />
                    <line x1="400" y1="0" x2="400" y2="30" stroke="#888" strokeWidth="2" />
                    <line x1="200" y1="30" x2="400" y2="30" stroke="#888" strokeWidth="2" />
                    <line x1="300" y1="30" x2="300" y2="80" stroke="#888" strokeWidth="2" />
                  </>
                )}
                {/* Right pair connectors */}
                {grandparents.length >= 4 && (
                  <>
                    <line x1="800" y1="0" x2="800" y2="30" stroke="#888" strokeWidth="2" />
                    <line x1="1000" y1="0" x2="1000" y2="30" stroke="#888" strokeWidth="2" />
                    <line x1="800" y1="30" x2="1000" y2="30" stroke="#888" strokeWidth="2" />
                    <line x1="900" y1="30" x2="900" y2="80" stroke="#888" strokeWidth="2" />
                  </>
                )}
              </svg>
            </div>
            
            <div className="tree-row parents-row">
              {parents.map((parent) => (
                <div key={parent.id} className="tree-node">
                  <FamilyCard member={parent} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Connector to User */}
        {parents.length > 0 && user && (
          <div className="connector-section user-connector">
            <svg className="connector-svg" viewBox="0 0 1200 80">
              {parents.length === 2 ? (
                <>
                  <line x1="300" y1="0" x2="300" y2="30" stroke="#888" strokeWidth="2" />
                  <line x1="900" y1="0" x2="900" y2="30" stroke="#888" strokeWidth="2" />
                  <line x1="300" y1="30" x2="900" y2="30" stroke="#888" strokeWidth="2" />
                  <line x1="600" y1="30" x2="600" y2="80" stroke="#888" strokeWidth="2" />
                </>
              ) : parents.length === 1 ? (
                <line x1="600" y1="0" x2="600" y2="80" stroke="#888" strokeWidth="2" />
              ) : null}
            </svg>
          </div>
        )}

        {/* User Row */}
        {user && (
          <div className="tree-row user-row">
            <div className="tree-node">
              <FamilyCard member={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyTree;
