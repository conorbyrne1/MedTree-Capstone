import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import FamilyCard from './FamilyCard';
import './FamilyTree.css';

const FamilyTree = ({ familyData }) => {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const nodeRefs     = useRef({});        // { memberId: DOM element }
  const hasInitialized = useRef(false);   // prevent re-centering on every re-render

  const [isDragging, setIsDragging]       = useState(false);
  const [startPos,   setStartPos]         = useState({ x: 0, y: 0 });
  const [translate,  setTranslate]        = useState({ x: 0, y: 0 });
  const [scale,      setScale]            = useState(1);
  const [showReset,  setShowReset]        = useState(false);
  const [paths,      setPaths]            = useState([]);

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const handleMouseDown = (e) => {
    if (e.target.closest('.family-card')) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const t = { x: e.clientX - startPos.x, y: e.clientY - startPos.y };
    setTranslate(t);
    if (Math.abs(t.x) > 10 || Math.abs(t.y) > 10) setShowReset(true);
  }, [isDragging, startPos]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = (e) => {
    if (e.target.closest('.family-card')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX - translate.x, y: touch.clientY - translate.y });
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const t = { x: touch.clientX - startPos.x, y: touch.clientY - startPos.y };
    setTranslate(t);
    if (Math.abs(t.x) > 10 || Math.abs(t.y) > 10) setShowReset(true);
  }, [isDragging, startPos]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const resetView = () => {
    hasInitialized.current = false;  // allow re-centering on next layout effect
    setTranslate({ x: 0, y: 0 });
    setScale(1);
    setShowReset(false);
  };

  // ── Wheel zoom ────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      setScale(prev => Math.min(Math.max(prev + (e.deltaY > 0 ? -0.1 : 0.1), 0.3), 2));
      setShowReset(true);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove',  handleMouseMove);
    window.addEventListener('mouseup',    handleMouseUp);
    window.addEventListener('touchmove',  handleTouchMove, { passive: false });
    window.addEventListener('touchend',   handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove',  handleMouseMove);
      window.removeEventListener('mouseup',    handleMouseUp);
      window.removeEventListener('touchmove',  handleTouchMove);
      window.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // ── Dynamic connector lines + initial scroll ──────────────────────────────
  //
  // Runs after every layout change. All coordinates are in canvas-local space
  // (screen coords divided by scale), which means they are scale-independent
  // and correct at any zoom level without needing to recompute on pan/zoom.

  useLayoutEffect(() => {
    if (!familyData) return;
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Returns the center-bottom and center-top of a node in canvas-local coords.
    // Uses offsetLeft/offsetTop traversal instead of getBoundingClientRect so that
    // measurements are in the natural (pre-CSS-transform) layout space — completely
    // independent of scale, pan, and any in-progress CSS transitions.
    const getPos = (id) => {
      const el = nodeRefs.current[id];
      if (!el || !canvas) return null;
      let left = 0, top = 0, current = el;
      while (current && current !== canvas) {
        left += current.offsetLeft;
        top  += current.offsetTop;
        current = current.offsetParent;
      }
      return {
        centerX: left + el.offsetWidth  / 2,
        topY:    top,
        bottomY: top + el.offsetHeight,
      };
    };

    // Elbow path: drops vertically from source, goes horizontal at midpoint,
    // then drops to target. Classic family-tree connector.
    const elbow = (src, dst) => {
      const mid = (src.bottomY + dst.topY) / 2;
      return `M ${src.centerX} ${src.bottomY} `
           + `L ${src.centerX} ${mid} `
           + `L ${dst.centerX} ${mid} `
           + `L ${dst.centerX} ${dst.topY}`;
    };

    const {
      user,
      parents           = [],
      grandparents      = [],
      greatGrandparents = [],
      greatGreatGrandparents = [],
    } = familyData;

    const newPaths = [];

    // Parents → user
    if (user) {
      parents.forEach(p => {
        const src = getPos(p.id);
        const dst = getPos(user.id);
        if (src && dst) newPaths.push(elbow(src, dst));
      });
    }

    // Grandparents → their parent (parentId is the parent's prefixed ID)
    grandparents.forEach(gp => {
      const src = getPos(gp.id);
      const dst = gp.parentId ? getPos(gp.parentId) : null;
      if (src && dst) newPaths.push(elbow(src, dst));
    });

    // Great-grandparents → their grandparent
    greatGrandparents.forEach(ggp => {
      const src = getPos(ggp.id);
      const dst = ggp.parentId ? getPos(ggp.parentId) : null;
      if (src && dst) newPaths.push(elbow(src, dst));
    });

    // Great-great-grandparents → their great-grandparent
    greatGreatGrandparents.forEach(gggp => {
      const src = getPos(gggp.id);
      const dst = gggp.parentId ? getPos(gggp.parentId) : null;
      if (src && dst) newPaths.push(elbow(src, dst));
    });

    setPaths(newPaths);

    // ── Initial scroll: show user card near the bottom of the viewport ──────
    // Only runs once per session (or after resetView clears hasInitialized).
    if (!hasInitialized.current && user) {
      const userEl = nodeRefs.current[user.id];
      if (userEl) {
        const cRect    = container.getBoundingClientRect();
        const uRect    = userEl.getBoundingClientRect();
        const uBottom  = uRect.bottom - cRect.top;       // distance from container top
        const target   = cRect.height - 60;              // 60px padding from container bottom
        const neededY  = target - uBottom;
        if (neededY < 0) setTranslate({ x: 0, y: neededY });
        hasInitialized.current = true;
      }
    }
  }, [familyData]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!familyData) {
    return (
      <div className="tree-empty">
        <p>No family data available. Add family members to build your medical tree.</p>
      </div>
    );
  }

  const {
    user,
    parents               = [],
    siblings              = [],
    grandparents          = [],
    greatGrandparents     = [],
    greatGreatGrandparents = [],
  } = familyData;

  // Helper: attach a ref to nodeRefs map by member id
  const nodeRef = (id) => (el) => { if (el) nodeRefs.current[id] = el; };

  const renderRow = (members, extraClass = '') => (
    <div className={`tree-row ${extraClass}`}>
      {members.map(m => (
        <div key={m.id} className="tree-node" ref={nodeRef(m.id)}>
          <FamilyCard member={m} />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`tree-container ${isDragging ? 'dragging' : ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {showReset && (
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
        ref={canvasRef}
        style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})` }}
      >
        {/* SVG overlay — lives inside the canvas so it pans/zooms with it.
            Width/height of 1px with overflow:visible means lines can extend
            anywhere in the canvas without affecting layout. */}
        <svg className="tree-connectors">
          {paths.map((d, i) => (
            <path key={i} d={d} className="connector-path" />
          ))}
        </svg>

        {greatGreatGrandparents.length > 0 && renderRow(greatGreatGrandparents)}
        {greatGrandparents.length      > 0 && renderRow(greatGrandparents)}
        {grandparents.length           > 0 && renderRow(grandparents)}
        {parents.length                > 0 && renderRow(parents)}

        {/* User row — siblings (same generation) sit beside the user card */}
        {user && (
          <div className="tree-row user-row">
            {siblings.map(s => (
              <div key={s.id} className="tree-node" ref={nodeRef(s.id)}>
                <FamilyCard member={s} />
              </div>
            ))}
            <div className="tree-node" ref={nodeRef(user.id)}>
              <FamilyCard member={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyTree;
