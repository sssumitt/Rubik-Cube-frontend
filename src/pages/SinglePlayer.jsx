import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import CubeWithArrow from '../Cube/cubeWithArrow.jsx'; // Ensure path matches your structure

function SinglePlayerPage() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cubeSize, setCubeSize] = useState(3);
  const countRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      countRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isActive && countRef.current) {
      clearInterval(countRef.current);
    }
    return () => clearInterval(countRef.current);
  }, [isActive]);

  const handleTimerClick = () => {
    setIsActive(prev => !prev);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setIsActive(false);
    setTime(0);
  };

  const decSize = (e) => {
    e.stopPropagation();
    setCubeSize((s) => Math.max(2, s - 1));
  };
  const incSize = (e) => {
    e.stopPropagation();
    setCubeSize((s) => Math.min(9, s + 1));
  };

  const formatTime = (timeInMs) => {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

  // --- CSS Variables Injection (Optional, similar to TwoPlayerView) ---
  // Assuming these variables are globally available. If not, inject them.
  
  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 80px)', // Adjust based on your global Navbar height
    width: '100%',
    position: 'relative', // Needed context if we switch Controls to absolute
    background: 'var(--clr-dark, #070a13)', // Fallback color added
    overflow: 'hidden',
  };

  // --- FIX: Container Logic ---
  const cubeContainerStyle = {
    flex: 1, // Take up all remaining vertical space
    width: '100%',
    position: 'relative', // Anchor for the CubeWithArrow's internal absolute canvas
    minHeight: 0, // CRITICAL: Prevents Flexbox overflow on resizing
    overflow: 'hidden', // Ensures no scrollbars appear if canvas calculates wrongly
    // REMOVED: display: flex, justifyContent, alignItems (These caused the collapse)
  };
  
  const topBarStyle = {
    position: 'absolute', // Changed to absolute so it stays relative to this page, not viewport
    top: '1rem',
    left: '1.5rem',
    right: '1.5rem',
    zIndex: 100, // Ensure it sits above the canvas
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'none', // Clicks pass through to the cube
  };

  const controlBoxStyle = {
    background: 'rgba(7, 10, 19, 0.8)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    border: '1px solid #2a3a52',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    pointerEvents: 'auto', // Re-enable clicks for buttons
  };

  const sizeControlStyle = {
    ...controlBoxStyle,
    padding: '0.5rem 1rem',
    gap: '0.5rem',
    color: 'var(--clr-light, #f1f5f9)',
    fontFamily: 'monospace',
    fontSize: '1rem',
  };

  const sizeInputStyle = {
    width: '2rem',
    textAlign: 'center',
    background: 'transparent',
    border: 'none',
    color: 'var(--clr-light, #f1f5f9)',
    fontFamily: 'monospace',
    fontSize: '1.125rem',
    outline: 'none',
  };

  const sizeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--clr-slate400, #94a3b8)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    transition: 'all 0.2s ease',
  };

  const handleSizeButtonHover = (e, isHovering) => {
    e.currentTarget.style.backgroundColor = isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
    e.currentTarget.style.color = isHovering ? 'var(--clr-light, #f1f5f9)' : 'var(--clr-slate400, #94a3b8)';
  };

  const timerStyle = {
    ...controlBoxStyle,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '1.5rem',
    padding: '0.75rem 1.5rem',
    gap: '1.5rem',
    color: 'var(--clr-light, #f1f5f9)',
    border: `2px solid ${isActive ? 'var(--clr-indigo, #4f46e5)' : '#2a3a52'}`,
    boxShadow: isActive ? '0 0 20px rgba(79, 70, 229, 0.6)' : '0 4px 12px rgba(0,0,0,0.5)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const resetButtonStyle = {
    ...sizeButtonStyle,
  };

  return (
    <div style={pageStyle}>
      <style>{`
        :root {
          --clr-dark: #070a13;
          --clr-light: #f1f5f9;
          --clr-slate400: #94a3b8;
          --clr-indigo: #4f46e5;
        }
      `}</style>
      
      <div style={topBarStyle}>
        <div style={sizeControlStyle}>
          <label htmlFor="cube-size" style={{ marginRight: '5px' }}>Size:</label>
          <button style={sizeButtonStyle} onClick={decSize} onMouseEnter={(e) => handleSizeButtonHover(e, true)} onMouseLeave={(e) => handleSizeButtonHover(e, false)}>
            <Minus size={18} />
          </button>
          <input
            id="cube-size"
            type="number"
            value={cubeSize}
            readOnly
            style={sizeInputStyle}
          />
          <button style={sizeButtonStyle} onClick={incSize} onMouseEnter={(e) => handleSizeButtonHover(e, true)} onMouseLeave={(e) => handleSizeButtonHover(e, false)}>
            <Plus size={18} />
          </button>
        </div>

        <div style={timerStyle} onClick={handleTimerClick}>
          <span>{formatTime(time)}</span>
          <button style={resetButtonStyle} onClick={handleReset} onMouseEnter={(e) => handleSizeButtonHover(e, true)} onMouseLeave={(e) => handleSizeButtonHover(e, false)}>
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div style={cubeContainerStyle}>
        {/* CubeWithArrow will now fill this container completely */}
        <CubeWithArrow key={cubeSize} cubeSize={cubeSize} canvasId="singlePlayerCanvas" />
      </div>
    </div>
  );
}

export default SinglePlayerPage;