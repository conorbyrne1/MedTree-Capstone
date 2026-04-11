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

    // When sources have different heights (e.g. one card expanded, one collapsed)
    // each source drops vertically to a shared junction Y (the lowest bottom edge),
    // a horizontal bar links them all, then a single line continues to the child.
    // This keeps the horizontal segments co-planar regardless of card height.

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

      // Shared junction: fixed offset below the tallest source card.
      // This keeps the bar a consistent distance from the parent row regardless
      // of how far away the child is.  Shorter cards get a longer vertical stem
      // down to the same bar level; the bar is never flush with any card.
      const maxBottomY = Math.max(...srcs.map(s => s.bottomY));
      const junctionY  = maxBottomY + 40;
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

    // Connect a group of parents to a group of children (siblings + user).
    // Draws a horizontal bar below parents and, when there are multiple children,
    // a second horizontal bar above them — joined by a vertical stem in the middle.
    const familyGroupConnector = (parentSrcs, childDsts) => {
      if (parentSrcs.length === 0 || childDsts.length === 0) return [];

      // Single parent → single child: plain elbow
      if (parentSrcs.length === 1 && childDsts.length === 1) {
        const src = parentSrcs[0];
        const dst = childDsts[0];
        const mid = (src.bottomY + dst.topY) / 2;
        return [
          `M ${src.centerX} ${src.bottomY} `
          + `L ${src.centerX} ${mid} `
          + `L ${dst.centerX} ${mid} `
          + `L ${dst.centerX} ${dst.topY}`,
        ];
      }

      const result = [];

      // Junction bar below parents
      const maxParentBottom = Math.max(...parentSrcs.map(s => s.bottomY));
      const parentJunctionY = maxParentBottom + 40;

      // Each parent drops a vertical stem to the junction bar
      parentSrcs.forEach(src => {
        result.push(`M ${src.centerX} ${src.bottomY} L ${src.centerX} ${parentJunctionY}`);
      });

      // Horizontal bar across all parents (only drawn when there are multiple)
      if (parentSrcs.length > 1) {
        const leftX  = Math.min(...parentSrcs.map(s => s.centerX));
        const rightX = Math.max(...parentSrcs.map(s => s.centerX));
        result.push(`M ${leftX} ${parentJunctionY} L ${rightX} ${parentJunctionY}`);
      }

      const parentMidX = parentSrcs.length === 1
        ? parentSrcs[0].centerX
        : (Math.min(...parentSrcs.map(s => s.centerX)) + Math.max(...parentSrcs.map(s => s.centerX))) / 2;

      if (childDsts.length === 1) {
        // Single child: elbow from parent junction down to child
        const dst  = childDsts[0];
        const mid2 = (parentJunctionY + dst.topY) / 2;
        result.push(
          `M ${parentMidX} ${parentJunctionY} `
          + `L ${parentMidX} ${mid2} `
          + `L ${dst.centerX} ${mid2} `
          + `L ${dst.centerX} ${dst.topY}`,
        );
      } else {
        // Multiple children: second horizontal bar above the child row
        const minChildTop     = Math.min(...childDsts.map(d => d.topY));
        const childJunctionY  = minChildTop - 40;
        const childLeftX      = Math.min(...childDsts.map(d => d.centerX));
        const childRightX     = Math.max(...childDsts.map(d => d.centerX));
        const childMidX       = (childLeftX + childRightX) / 2;
        const midY            = (parentJunctionY + childJunctionY) / 2;

        // Stem from parent junction down to child junction, elbowing if centres differ
        result.push(
          `M ${parentMidX} ${parentJunctionY} `
          + `L ${parentMidX} ${midY} `
          + `L ${childMidX} ${midY} `
          + `L ${childMidX} ${childJunctionY}`,
        );

        // Horizontal bar across all children
        result.push(`M ${childLeftX} ${childJunctionY} L ${childRightX} ${childJunctionY}`);

        // Each child rises from its top to the child junction bar
        childDsts.forEach(dst => {
          result.push(`M ${dst.centerX} ${dst.topY} L ${dst.centerX} ${childJunctionY}`);
        });
      }

      return result;
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
      siblings               = [],
      grandparents           = [],
      greatGrandparents      = [],
      greatGreatGrandparents = [],
    } = familyData;

    const newPaths = [];

    // Parents → user + siblings (all share the same parents)
    if (user) {
      const parentSrcs = parents.map(p => getPos(p.id)).filter(Boolean);
      const childDsts  = [user, ...siblings].map(c => getPos(c.id)).filter(Boolean);
      familyGroupConnector(parentSrcs, childDsts).forEach(p => newPaths.push(p));
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