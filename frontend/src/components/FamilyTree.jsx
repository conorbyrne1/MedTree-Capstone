// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import FamilyCard from './FamilyCard';
// import './FamilyTree.css';
//
// const FamilyTree = ({ familyData }) => {
//   const containerRef = useRef(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 });
//   const [translate, setTranslate] = useState({ x: 0, y: 0 });
//   const [showResetButton, setShowResetButton] = useState(false);
//   const [scale, setScale] = useState(1);
//
//   // Mouse/Touch event handlers for dragging
//   const handleMouseDown = (e) => {
//     if (e.target.closest('.family-card')) return;
//     setIsDragging(true);
//     setStartPos({
//       x: e.clientX - translate.x,
//       y: e.clientY - translate.y
//     });
//   };
//
//   const handleMouseMove = useCallback((e) => {
//     if (!isDragging) return;
//     const newTranslate = {
//       x: e.clientX - startPos.x,
//       y: e.clientY - startPos.y
//     };
//     setTranslate(newTranslate);
//     if (Math.abs(newTranslate.x) > 10 || Math.abs(newTranslate.y) > 10) {
//       setShowResetButton(true);
//     }
//   }, [isDragging, startPos]);
//
//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false);
//   }, []);
//
//   const handleTouchStart = (e) => {
//     if (e.target.closest('.family-card')) return;
//     const touch = e.touches[0];
//     setIsDragging(true);
//     setStartPos({
//       x: touch.clientX - translate.x,
//       y: touch.clientY - translate.y
//     });
//   };
//
//   const handleTouchMove = useCallback((e) => {
//     if (!isDragging) return;
//     const touch = e.touches[0];
//     const newTranslate = {
//       x: touch.clientX - startPos.x,
//       y: touch.clientY - startPos.y
//     };
//     setTranslate(newTranslate);
//     if (Math.abs(newTranslate.x) > 10 || Math.abs(newTranslate.y) > 10) {
//       setShowResetButton(true);
//     }
//   }, [isDragging, startPos]);
//
//   const handleTouchEnd = useCallback(() => {
//     setIsDragging(false);
//   }, []);
//
//   // Reset view
//   const resetView = () => {
//     setTranslate({ x: 0, y: 0 });
//     setScale(1);
//     setShowResetButton(false);
//   };
//
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;
//
//     const handleWheel = (e) => {
//       e.preventDefault();
//       const delta = e.deltaY > 0 ? -0.1 : 0.1;
//       setScale(prev => Math.min(Math.max(prev + delta, 0.5), 2));
//       setShowResetButton(true);
//     };
//
//     container.addEventListener('wheel', handleWheel, { passive: false });
//     window.addEventListener('mousemove', handleMouseMove);
//     window.addEventListener('mouseup', handleMouseUp);
//     window.addEventListener('touchmove', handleTouchMove);
//     window.addEventListener('touchend', handleTouchEnd);
//
//     return () => {
//       container.removeEventListener('wheel', handleWheel);
//       window.removeEventListener('mousemove', handleMouseMove);
//       window.removeEventListener('mouseup', handleMouseUp);
//       window.removeEventListener('touchmove', handleTouchMove);
//       window.removeEventListener('touchend', handleTouchEnd);
//     };
//   }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
//
//   // Check if we have family data
//   if (!familyData) {
//     return (
//         <div className="tree-empty">
//           <p>No family data available. Add family members to build your medical tree.</p>
//         </div>
//     );
//   }
//
//   const { user, parents = [], grandparents = [], greatGrandparents = [] } = familyData;
//
//   // Group grandparents by their parent
//   const getGrandparentsByParent = (parentId) => {
//     return grandparents.filter(gp => gp.parentId === parentId);
//   };
//
//   return (
//     <div
//       className={`tree-container ${isDragging ? 'dragging' : ''}`}
//       ref={containerRef}
//       onMouseDown={handleMouseDown}
//       onTouchStart={handleTouchStart}
//     >
//       {showResetButton && (
//         <button className="reset-view-btn" onClick={resetView}>
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
//             <path d="M3 3v5h5" />
//           </svg>
//           Reset View
//         </button>
//       )}
//
//       <div
//         className="tree-canvas"
//         style={{
//           transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
//         }}
//       >
//         {/* Great Grandparents Row */}
//         {greatGrandparents.length > 0 && (
//           <>
//             <div className="tree-row great-grandparents-row">
//               {greatGrandparents.map((ggp) => (
//                 <div key={ggp.id} className="tree-node">
//                   <FamilyCard member={ggp} />
//                 </div>
//               ))}
//             </div>
//             <div className="connector-row">
//               <svg className="connectors" preserveAspectRatio="none">
//                 {/* Add connector lines as needed */}
//               </svg>
//             </div>
//           </>
//         )}
//
//         {/* Grandparents Row */}
//         {grandparents.length > 0 && (
//           <>
//             <div className="tree-row grandparents-row">
//               {grandparents.map((gp) => (
//                 <div key={gp.id} className="tree-node">
//                   <FamilyCard member={gp} />
//                   <div className="connector-line vertical-down" />
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//
//         {/* Parents Row */}
//         {parents.length > 0 && (
//           <>
//             <div className="connector-section">
//               <svg className="connector-svg" viewBox="0 0 1200 80">
//                 {/* Left pair connectors */}
//                 {grandparents.length >= 2 && (
//                   <>
//                     <line x1="200" y1="0" x2="200" y2="30" stroke="#888" strokeWidth="2" />
//                     <line x1="400" y1="0" x2="400" y2="30" stroke="#888" strokeWidth="2" />
//                     <line x1="200" y1="30" x2="400" y2="30" stroke="#888" strokeWidth="2" />
//                     <line x1="300" y1="30" x2="300" y2="80" stroke="#888" strokeWidth="2" />
//                   </>
//                 )}
//                 {/* Right pair connectors */}
//                 {grandparents.length >= 4 && (
//                   <>
//                     <line x1="800" y1="0" x2="800" y2="30" stroke="#888" strokeWidth="2" />
//                     <line x1="1000" y1="0" x2="1000" y2="30" stroke="#888" strokeWidth="2" />
//                     <line x1="800" y1="30" x2="1000" y2="30" stroke="#888" strokeWidth="2" />
//                     <line x1="900" y1="30" x2="900" y2="80" stroke="#888" strokeWidth="2" />
//                   </>
//                 )}
//               </svg>
//             </div>
//
//             <div className="tree-row parents-row">
//               {parents.map((parent) => (
//                 <div key={parent.id} className="tree-node">
//                   <FamilyCard member={parent} />
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//
//         {/* Connector to User */}
//         {parents.length > 0 && user && (
//           <div className="connector-section user-connector">
//             <svg className="connector-svg" viewBox="0 0 1200 80">
//               {parents.length === 2 ? (
//                 <>
//                   <line x1="300" y1="0" x2="300" y2="30" stroke="#888" strokeWidth="2" />
//                   <line x1="900" y1="0" x2="900" y2="30" stroke="#888" strokeWidth="2" />
//                   <line x1="300" y1="30" x2="900" y2="30" stroke="#888" strokeWidth="2" />
//                   <line x1="600" y1="30" x2="600" y2="80" stroke="#888" strokeWidth="2" />
//                 </>
//               ) : parents.length === 1 ? (
//                 <line x1="600" y1="0" x2="600" y2="80" stroke="#888" strokeWidth="2" />
//               ) : null}
//             </svg>
//           </div>
//         )}
//
//         {/* User Row */}
//         {user && (
//           <div className="tree-row user-row">
//             <div className="tree-node">
//               <FamilyCard member={user} />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
//
// export default FamilyTree;

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

  // ── Dynamic connector lines ────────────────────────────────────────────────
  //
  // All coordinates are in canvas-local space (pre-CSS-transform layout space),
  // so they are scale-independent and correct at any zoom level.
  //
  // calcPaths is a stable callback (only changes when familyData changes).
  // It is called:
  //   • synchronously via useLayoutEffect on mount / data change
  //   • by a ResizeObserver on the canvas (fires during card expand/collapse transitions)
  //   • by a window 'resize' listener (fires when viewport size changes)

  const calcPaths = useCallback(() => {
    if (!familyData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Returns the center-bottom and center-top of a node in canvas-local coords.
    // Uses offsetLeft/offsetTop traversal so measurements are independent of
    // scale, pan, and any in-progress CSS transitions.
    const getPos = (id) => {
      const el = nodeRefs.current[id];
      if (!el) return null;
      let relTop = 0, relLeft = 0;
      let curr = el;
      while (curr && curr !== canvas) {
        relTop  += curr.offsetTop;
        relLeft += curr.offsetLeft;
        curr = curr.offsetParent;
      }
      return {
        centerX: relLeft + el.offsetWidth  / 2,
        topY:    relTop,
        bottomY: relTop  + el.offsetHeight,
      };
    };

    // Draw a connector from a group of source nodes to one destination.
    //
    // When sources have different heights (e.g. one card expanded, one collapsed)
    // each source drops vertically to a shared junction Y (the lowest bottom edge),
    // a horizontal bar links them all, then a single line continues to the child.
    // This keeps the horizontal segments co-planar regardless of card height.
    //
    // For a single source the result is a plain elbow (vertical → horizontal → vertical).
    const groupConnector = (srcs, dst) => {
      if (!dst || srcs.length === 0) return [];

      if (srcs.length === 1) {
        const src = srcs[0];
        const mid = (src.bottomY + dst.topY) / 2;
        return [
          `M ${src.centerX} ${src.bottomY} `
          + `L ${src.centerX} ${mid} `
          + `L ${dst.centerX} ${mid} `
          + `L ${dst.centerX} ${dst.topY}`,
        ];
      }

      // Shared junction: midpoint between the tallest source and the destination.
      // Using the tallest source bottom as the anchor keeps all lines co-planar
      // while the midpoint placement gives visual breathing room (not flush with cards).
      const maxBottomY = Math.max(...srcs.map(s => s.bottomY));
      const junctionY  = (maxBottomY + dst.topY) / 2;
      const leftX      = Math.min(...srcs.map(s => s.centerX));
      const rightX     = Math.max(...srcs.map(s => s.centerX));
      const midX       = (leftX + rightX) / 2;
      const mid2       = (junctionY + dst.topY) / 2;

      const paths = [];

      // Each source drops vertically to the shared junction line
      srcs.forEach(src => {
        paths.push(`M ${src.centerX} ${src.bottomY} L ${src.centerX} ${junctionY}`);
      });

      // Horizontal bar at junction
      paths.push(`M ${leftX} ${junctionY} L ${rightX} ${junctionY}`);

      // Elbow from junction midpoint down to destination
      paths.push(
        `M ${midX} ${junctionY} `
        + `L ${midX} ${mid2} `
        + `L ${dst.centerX} ${mid2} `
        + `L ${dst.centerX} ${dst.topY}`,
      );

      return paths;
    };

    // Helper: group an array of members by a key and return { key → { dst, srcs[] } }
    const groupByDest = (members, getDestId) => {
      const map = {};
      members.forEach(m => {
        const destId = getDestId(m);
        if (!destId) return;
        const dst = getPos(destId);
        if (!dst) return;
        const src = getPos(m.id);
        if (!src) return;
        if (!map[destId]) map[destId] = { dst, srcs: [] };
        map[destId].srcs.push(src);
      });
      return map;
    };

    const {
      user,
      parents                = [],
      grandparents           = [],
      greatGrandparents      = [],
      greatGreatGrandparents = [],
    } = familyData;

    const newPaths = [];

    // Parents → user (all parents share one destination)
    if (user) {
      const dst  = getPos(user.id);
      const srcs = parents.map(p => getPos(p.id)).filter(Boolean);
      groupConnector(srcs, dst).forEach(p => newPaths.push(p));
    }

    // Grandparents → their parent (group by parentId)
    Object.values(groupByDest(grandparents, gp => gp.parentId))
      .forEach(({ srcs, dst }) => groupConnector(srcs, dst).forEach(p => newPaths.push(p)));

    // Great-grandparents → their grandparent
    Object.values(groupByDest(greatGrandparents, ggp => ggp.parentId))
      .forEach(({ srcs, dst }) => groupConnector(srcs, dst).forEach(p => newPaths.push(p)));

    // Great-great-grandparents → their great-grandparent
    Object.values(groupByDest(greatGreatGrandparents, gggp => gggp.parentId))
      .forEach(({ srcs, dst }) => groupConnector(srcs, dst).forEach(p => newPaths.push(p)));

    setPaths(newPaths);
  }, [familyData]);

  // Run synchronously after layout so paths are correct on first paint.
  // Also handles the one-time initial scroll to show the user card near bottom.
  useLayoutEffect(() => {
    calcPaths();

    if (!hasInitialized.current && familyData?.user) {
      const container = containerRef.current;
      const userEl    = nodeRefs.current[familyData.user.id];
      if (container && userEl) {
        const cRect   = container.getBoundingClientRect();
        const uRect   = userEl.getBoundingClientRect();
        const uBottom = uRect.bottom - cRect.top;
        const target  = cRect.height - 60;
        const neededY = target - uBottom;
        if (neededY < 0) setTranslate({ x: 0, y: neededY });
        hasInitialized.current = true;
      }
    }
  }, [calcPaths, familyData]);

  // Keep lines in sync with DOM size changes (card expand/collapse, window resize).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ResizeObserver fires whenever the canvas changes size, which happens during
    // card expand/collapse CSS transitions — giving smooth live line updates.
    const ro = new ResizeObserver(calcPaths);
    ro.observe(canvas);

    // Window resize can shift flex-row positions without changing the canvas size.
    window.addEventListener('resize', calcPaths);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calcPaths);
    };
  }, [calcPaths]);

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