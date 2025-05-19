import { useState } from 'react';
import { Info } from 'lucide-react';
import Cube from "./Cube/cubie.jsx";


import CubeStateEditor from "./Cube/CubeStateEditor.jsx";

function App() {
  const [cubeSize, setCubeSize] = useState(3);
  const [showInfo, setShowInfo] = useState(false);

  const instructions = (
    <div
      className="info-modal"
      style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translate(-50%, -15%)',
        background: 'rgba(7, 10, 19, 0.9)',
        color: 'var(--clr-light)',
        padding: '1.5rem 2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.6)',
        zIndex: 10001,
        maxWidth: '90%',
        width: '400px',
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>How to use the cube</h3>
      <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
        <li>Choose a layer by pressing a <strong>number</strong> (1 = top, 2 = middle, etc.).</li>
        <li>Rotate by pressing a face letter <strong>(U/R/F/D/L/B)</strong>, with <strong>Shift</strong> for counter-clockwise.</li>

      </ul>
      <button className="btn" onClick={() => setShowInfo(false)}>
        Close
      </button>
    </div>
  );

  const backdrop = (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 10000,
      }}
      onClick={() => setShowInfo(false)}
    />
  );

  return (
    <>
      <header className="hero container header-wrapper" style={{ position: 'relative' }}>
        <button
          className="info-button"
          onClick={() => setShowInfo(prev => !prev)}
          aria-label="Show instructions"
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            zIndex: 10002,
            color: 'var(--clr-light)',
            cursor: 'pointer',
          }}
        >
          <Info size={24} />
        </button>
        <h1 className="hero__title">Rubik's Cube solver</h1>
      </header>

      {showInfo && (
        <>
          {backdrop}
          {instructions}
        </>
      )}

      <main className="hero container">
        <Cube key={cubeSize} cubeSize={cubeSize} />

        <div className="size-input-container">
          <label htmlFor="cube-size" className='hero__subtitle'>
            Cube Size:
          </label>
          <input
            id="cube-size"
            type="number"
            min="2"
            value={cubeSize}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 2) setCubeSize(v);
            }}
          />
        </div>
      </main>

      <CubeStateEditor />
    </>
  );
}

export default App;
