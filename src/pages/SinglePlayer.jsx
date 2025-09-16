import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import CubeWithArrow from '../Cube/cubeWithArrow.jsx';

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

  // --- Styles for the full-screen layout ---

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 80px)', 
    width: '100%',
    boxSizing: 'border-box',
  };

  const headerStyle = {
    textAlign: 'center',
    padding: '1rem 0',
  };

  const cubeContainerStyle = {
    flexGrow: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
  };
  
  const topBarStyle = {
    position: 'fixed',
    top: 'calc(80px + 1rem)',
    left: '1.5rem',
    right: '1.5rem',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'none', // Allow clicks to pass through to the cube canvas
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
    pointerEvents: 'auto', // Re-enable pointer events for this element
  };

  const sizeControlStyle = {
    ...controlBoxStyle,
    padding: '0.5rem 1rem',
    gap: '0.5rem',
    color: 'var(--clr-light)',
    fontFamily: 'monospace',
    fontSize: 'var(--size-base)',
  };

  const sizeInputStyle = {
    width: '2rem',
    textAlign: 'center',
    background: 'transparent',
    border: 'none',
    color: 'var(--clr-light)',
    fontFamily: 'monospace',
    fontSize: 'var(--size-lg)',
    outline: 'none',
  };

  const sizeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--clr-slate400)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    transition: 'all 0.2s ease',
  };

  const handleSizeButtonHover = (e, isHovering) => {
    e.currentTarget.style.backgroundColor = isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
    e.currentTarget.style.color = isHovering ? 'var(--clr-light)' : 'var(--clr-slate400)';
  };

  const timerStyle = {
    ...controlBoxStyle,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 'var(--size-2xl)',
    padding: '0.75rem 1.5rem',
    gap: '1.5rem',
    color: 'var(--clr-light)',
    border: `2px solid ${isActive ? 'var(--clr-indigo)' : '#2a3a52'}`,
    boxShadow: isActive ? '0 0 20px rgba(79, 70, 229, 0.6)' : '0 4px 12px rgba(0,0,0,0.5)',
  };

  const resetButtonStyle = {
    ...sizeButtonStyle,
  };

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div style={sizeControlStyle}>
          <label htmlFor="cube-size">Cube Size:</label>
          <button style={sizeButtonStyle} onClick={decSize} onMouseEnter={(e) => handleSizeButtonHover(e, true)} onMouseLeave={(e) => handleSizeButtonHover(e, false)}><Minus size={20} /></button>
          <input
            id="cube-size"
            type="number"
            value={cubeSize}
            readOnly
            style={sizeInputStyle}
          />
          <button style={sizeButtonStyle} onClick={incSize} onMouseEnter={(e) => handleSizeButtonHover(e, true)} onMouseLeave={(e) => handleSizeButtonHover(e, false)}><Plus size={20} /></button>
        </div>

        <div style={timerStyle} onClick={handleTimerClick}>
          <span>{formatTime(time)}</span>
          <button style={resetButtonStyle} onClick={handleReset} onMouseEnter={(e) => handleSizeButtonHover(e, true)} onMouseLeave={(e) => handleSizeButtonHover(e, false)}>
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      <div style={cubeContainerStyle}>
        <CubeWithArrow key={cubeSize} cubeSize={cubeSize} />
      </div>
    </div>
  );
}

export default SinglePlayerPage;

