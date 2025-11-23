import React, { useState, useRef } from "react";
import axios from "axios";
import "./CubeStateEditor.css";
import Cube3DEditor from "./Cube3DEditor";

/* ─────────── CONSTANT LOOKUPS ─────────── */
const allowedLetters = ["W", "R", "G", "Y", "O", "B"];
const letterToColor = { W: "white", R: "red", G: "green", Y: "yellow", O: "orange", B: "blue" };

export default function CubeNetEditor() {
  const [output, setOutput] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("W");
  const [moveInput, setMoveInput] = useState("");
  const [isPaintMode, setIsPaintMode] = useState(false);
  const cubeRef = useRef(null);

  /* ─────────── HANDLERS ─────────── */
  const handleMove = (m) => {
    if (cubeRef.current) {
      // Parse move: R, R', R2
      const face = m[0];
      const suffix = m.slice(1);
      const clockwise = suffix !== "'";
      const duration = 300;

      // Handle double moves (R2) as two moves or one fast move?
      // rotateFace handles 90 degrees.
      // For R2, we can call it twice.

      const count = suffix === "2" ? 2 : 1;

      const perform = async () => {
        for (let i = 0; i < count; i++) {
          await cubeRef.current.performMove({
            face,
            sliceIndex: 0, // Outer layer for now.
            // TODO: If we want to support inner slices, we need more UI.
            // But standard notation usually implies outer layers.
            clockwise,
            duration: duration / count
          });
        }
      };
      perform();
    }
  };

  const handleReset = () => {
    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }
    setOutput("");
  };

  const scrambleCube = async (len = 20) => {
    const all = ["U", "U'", "U2", "R", "R'", "R2", "F", "F'", "F2", "D", "D'", "D2", "L", "L'", "L2", "B", "B'", "B2"];
    const seq = Array.from({ length: len }, () => all[Math.floor(Math.random() * all.length)]);

    // Apply moves rapidly
    if (cubeRef.current) {
      for (const m of seq) {
        const face = m[0];
        const suffix = m.slice(1);
        const clockwise = suffix !== "'";
        const count = suffix === "2" ? 2 : 1;

        for (let i = 0; i < count; i++) {
          await cubeRef.current.performMove({
            face,
            sliceIndex: 0,
            clockwise,
            duration: 100 // Fast
          });
        }
      }
    }
  };

  const logCubeState = () => {
    if (cubeRef.current) {
      const stateString = cubeRef.current.getCubeState();
      console.log("Scanned State:", stateString);

      axios
        .post(`https://rubik-cube-backend-wkss.onrender.com/solve?state=${stateString}`)
        .then(r => setOutput(r.data))
        .catch(err => {
          console.error(err);
          setOutput("Error solving cube. Check if state is valid.");
        });
    }
  };

  const applyMoves = async () => {
    const validMoves = new Set([
      "U", "U'", "U2",
      "R", "R'", "R2",
      "F", "F'", "F2",
      "D", "D'", "D2",
      "L", "L'", "L2",
      "B", "B'", "B2"
    ]);

    const seq = moveInput.trim().split(/\s+/).filter(x => x);

    for (const m of seq) {
      if (!validMoves.has(m)) {
        alert(`“${m}” is not a valid move.`);
        return;
      }
    }

    if (cubeRef.current) {
      for (const m of seq) {
        const face = m[0];
        const suffix = m.slice(1);
        const clockwise = suffix !== "'";
        const count = suffix === "2" ? 2 : 1;

        for (let i = 0; i < count; i++) {
          await cubeRef.current.performMove({
            face,
            sliceIndex: 0,
            clockwise,
            duration: 300
          });
        }
      }
    }
    setMoveInput("");
  };


  /* ─────────── JSX ─────────── */
  return (
    <div className="cube-editor-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>3D Cube Solver & Editor</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        {isPaintMode ? "Paint Mode Active: Click stickers to color them." : "View Mode: Drag to rotate layers."}
      </p>

      {/* ─── 3D Cube View ─── */}
      <div className="cube-net-grid" style={{ display: 'block', width: '100%', maxWidth: '500px', height: '500px', margin: '0 auto 2rem' }}>
        <Cube3DEditor ref={cubeRef} cubeSize={3} selectedColor={selectedLetter} isPaintMode={isPaintMode} />
      </div>

      {/* ─── controls below ─── */}
      <div className="controls-section">

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setIsPaintMode(!isPaintMode)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: isPaintMode ? '#22c55e' : '#334155',
              color: 'white',
              transition: 'background 0.2s'
            }}
          >
            {isPaintMode ? "Paint Mode ON" : "Enable Paint Mode"}
          </button>
        </div>

        {/* color swatches - only show/enable if paint mode is on? Or just dim them. */}
        <div className={`palette-container ${isPaintMode ? '' : 'disabled'}`} style={{ opacity: isPaintMode ? 1 : 0.5, pointerEvents: isPaintMode ? 'auto' : 'none' }}>
          {allowedLetters.map(letter => (
            <div
              key={letter}
              className={`color-swatch${letter === selectedLetter ? " selected" : ""}`}
              onClick={() => setSelectedLetter(letter)}
              style={{ backgroundColor: letterToColor[letter] }}
              title={`Select ${letterToColor[letter]}`}
            />
          ))}
        </div>



        {/* apply / scramble / reset */}
        <div className="action-row">
          <input
            type="text"
            className="input-move"
            placeholder="e.g. R U R' U'"
            value={moveInput}
            onChange={e => setMoveInput(e.target.value)}
          />
          <button className="primary-btn" onClick={applyMoves}>Apply Moves</button>
        </div>

        <div className="action-row" style={{ justifyContent: 'space-between' }}>
          <button className="secondary-btn" onClick={() => scrambleCube()}>Random Scramble</button>
          <button className="secondary-btn" onClick={handleReset} style={{ backgroundColor: '#ef4444' }}>Reset Cube</button>
        </div>

        <button className="solve-btn" onClick={logCubeState}>SOLVE CUBE</button>
      </div>

      {/* ─── display solution ─── */}
      {output && (
        <div className="solution-display">
          <div style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Solution Found</div>
          <div className="solution-text">{output}</div>
        </div>
      )}
    </div>
  );
}
