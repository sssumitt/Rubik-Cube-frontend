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
        <li>
          Choose a layer by pressing a <strong>number</strong> (1 = top, 2 = middle, etc.).
        </li>
        <li>
          Rotate by pressing a face letter <strong>(U/R/F/D/L/B)</strong>, with{' '}
          <strong>Shift</strong> for counter-clockwise.
        </li>
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

  const dec = () => setCubeSize((s) => Math.max(2, s - 1));
  const inc = () => setCubeSize((s) => Math.min(9, s + 1));

  return (
    <>
    <header className="header-wrapper">
  {/* Info button always lives at top‐left of this wrapper */}
  <button
    className="info-button"
    onClick={() => setShowInfo(prev => !prev)}
    aria-label="Show instructions"
  >
    <Info size={20}/>
  </button>

  {/* This inner “hero container” stays full-width & centers its children */}
  <div className="hero container">
    <h1 className="hero__title">Rubik's Cube Solver</h1>
  </div>
</header>


      {showInfo && (
        <>
          {backdrop}
          {instructions}
        </>
      )}

      <main className="hero container">
        <Cube key={cubeSize} cubeSize={cubeSize} />

        <div
          className="size-input-container"
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <label htmlFor="cube-size" className="hero__subtitle">
            Cube Size:
          </label>
          <button
            type="button"
            onClick={dec}
            aria-label="Decrease size"
            style={{ padding: '0.2rem 0.6rem' }}
          >
            –
          </button>
          <input
            id="cube-size"
            type="number"
            min="2"
            step="1"
            value={cubeSize}
            readOnly
            style={{
              width: '3rem',
              textAlign: 'center',
              background: 'transparent',
              border: '1px solid var(--clr-slate400)',
              borderRadius: '0.25rem',
              padding: '0.2rem',
            }}
          />
          <button
            type="button"
            onClick={inc}
            aria-label="Increase size"
            style={{ padding: '0.2rem 0.6rem' }}
          >
            +
          </button>
        </div>
      </main>

      <CubeStateEditor />
    </>
  );
}

export default App;
