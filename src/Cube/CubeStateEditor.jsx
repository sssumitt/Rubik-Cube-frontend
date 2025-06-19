import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  edgeMappings,
  cornerMappings,
  edgeColors,
  cornerColors,
} from "./constants/face";
import { Corner } from "./constants/corner";
import { Edge } from "./constants/edge";

/* ─────────── ROTATION TABLES ─────────── */
const cpU = [Corner.UBR, Corner.URF, Corner.UFL, Corner.ULB, Corner.DFR, Corner.DLF, Corner.DBL, Corner.DRB];
const coU = Array(8).fill(0);
const epU = [Edge.UB, Edge.UR, Edge.UF, Edge.UL, Edge.DR, Edge.DF, Edge.DL, Edge.DB, Edge.FR, Edge.FL, Edge.BL, Edge.BR];
const eoU = Array(12).fill(0);

const cpR = [Corner.DFR, Corner.UFL, Corner.ULB, Corner.URF, Corner.DRB, Corner.DLF, Corner.DBL, Corner.UBR];
const coR = [2,0,0,1,1,0,0,2];
const epR = [Edge.FR, Edge.UF, Edge.UL, Edge.UB, Edge.BR, Edge.DF, Edge.DL, Edge.DB, Edge.DR, Edge.FL, Edge.BL, Edge.UR];
const eoR = Array(12).fill(0);

const cpF = [Corner.UFL, Corner.DLF, Corner.ULB, Corner.UBR, Corner.URF, Corner.DFR, Corner.DBL, Corner.DRB];
const coF = [1,2,0,0,2,1,0,0];
const epF = [Edge.UR, Edge.FL, Edge.UL, Edge.UB, Edge.DR, Edge.FR, Edge.DL, Edge.DB, Edge.UF, Edge.DF, Edge.BL, Edge.BR];
const eoF = [0,1,0,0,0,1,0,0,1,1,0,0];

const cpD = [Corner.URF, Corner.UFL, Corner.ULB, Corner.UBR, Corner.DLF, Corner.DBL, Corner.DRB, Corner.DFR];
const coD = Array(8).fill(0);
const epD = [Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DF, Edge.DL, Edge.DB, Edge.DR, Edge.FR, Edge.FL, Edge.BL, Edge.BR];
const eoD = Array(12).fill(0);

const cpL = [Corner.URF, Corner.ULB, Corner.DBL, Corner.UBR, Corner.DFR, Corner.UFL, Corner.DLF, Corner.DRB];
const coL = [0,1,2,0,0,2,1,0];
const epL = [Edge.UR, Edge.UF, Edge.BL, Edge.UB, Edge.DR, Edge.DF, Edge.FL, Edge.DB, Edge.FR, Edge.UL, Edge.DL, Edge.BR];
const eoL = Array(12).fill(0);

const cpB = [Corner.URF, Corner.UFL, Corner.UBR, Corner.DRB, Corner.DFR, Corner.DLF, Corner.ULB, Corner.DBL];
const coB = [0,0,1,2,0,0,2,1];
const epB = [Edge.UR, Edge.UF, Edge.UL, Edge.BR, Edge.DR, Edge.DF, Edge.DL, Edge.BL, Edge.FR, Edge.FL, Edge.UB, Edge.DB];
const eoB = [0,0,0,1,0,0,0,1,0,0,1,1];

const tables = {
  U: { cp: cpU, co: coU, ep: epU, eo: eoU },
  R: { cp: cpR, co: coR, ep: epR, eo: eoR },
  F: { cp: cpF, co: coF, ep: epF, eo: eoF },
  D: { cp: cpD, co: coD, ep: epD, eo: eoD },
  L: { cp: cpL, co: coL, ep: epL, eo: eoL },
  B: { cp: cpB, co: coB, ep: epB, eo: eoB },
};

/* ─────────── CONSTANT LOOKUPS ─────────── */
const allowedLetters = ["W","R","G","Y","O","B"];
const letterToColor = { W:"white", R:"red", G:"green", Y:"yellow", O:"orange", B:"blue" };

/* ─── pure helper: apply a single move to cube-state ───────────────────── */
const applyMove = (state, move) => {
  const base = move[0],
        suffix = move[1],
        times = suffix === "'" ? 3 : suffix === "2" ? 2 : 1;
  let { cp, co, ep, eo } = state;

  for (let t = 0; t < times; t++) {
    const { cp: cpT, co: coT, ep: epT, eo: eoT } = tables[base];
    const oCp = [...cp], oCo = [...co], oEp = [...ep], oEo = [...eo];
    const nCp = [...cp], nCo = [...co], nEp = [...ep], nEo = [...eo];

    for (let i = 0; i < 8; i++) {
      nCp[i] = oCp[cpT[i]];
      nCo[i] = (oCo[cpT[i]] + coT[i]) % 3;
    }
    for (let i = 0; i < 12; i++) {
      nEp[i] = oEp[epT[i]];
      nEo[i] = (oEo[epT[i]] + eoT[i]) % 2;
    }

    cp = nCp; co = nCo; ep = nEp; eo = nEo;
  }

  return { cp, co, ep, eo };
};

export default function CubeNetEditor() {
  /* ─────────── STATE ─────────── */
  const initialState = {
    cp: [...Array(8).keys()],
    co: Array(8).fill(0),
    ep: [...Array(12).keys()],
    eo: Array(12).fill(0),
  };
  const [cubeState, setCubeState] = useState(initialState);
  const [cubeFaces, setCubeFaces] = useState({ U:[],R:[],F:[],D:[],L:[],B:[] });
  const [output, setOutput] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("W");
  const [moveInput, setMoveInput] = useState("");

  /* ── allow clicking on a net-square to color it ── */
  const handleSquareClick = (face, idx) => {
    setCubeFaces(prev => ({
      ...prev,
      [face]: prev[face].map((ltr,i) => i===idx ? selectedLetter : ltr)
    }));
  };

  /* ─── repaint the 6 faces every time cubeState changes ─────────── */
  useEffect(() => {
    // build a 6×9 array for center+edges+corners
    const faceCube = Array(6).fill().map(_ => Array(9).fill(null));
    const faceColors = {0:"W",1:"R",2:"G",3:"Y",4:"O",5:"B"};
    faceCube.forEach((arr,i)=>arr[4] = faceColors[i]);

    // place edges
    cubeState.ep.forEach((pos,i) => {
      const ori = cubeState.eo[i], map = edgeMappings[i];
      let [c1,c2] = edgeColors[pos];
      if (ori) [c1,c2] = [c2,c1];
      faceCube[map.face1][map.index1] = c1;
      faceCube[map.face2][map.index2] = c2;
    });

    // place corners
    cubeState.cp.forEach((pos,i) => {
      const ori = cubeState.co[i], map = cornerMappings[i];
      let [c1,c2,c3] = cornerColors[pos];
      if (ori === 1) [c1,c2,c3] = [c3,c1,c2];
      if (ori === 2) [c1,c2,c3] = [c2,c3,c1];
      faceCube[map.face1][map.index1] = c1;
      faceCube[map.face2][map.index2] = c2;
      faceCube[map.face3][map.index3] = c3;
    });

    // lift into named faces
    const newF = {};
    ["U","R","F","D","L","B"].forEach((f,i)=>newF[f] = faceCube[i]);
    setCubeFaces(newF);
  }, [cubeState]);

  /* ─────────── HANDLERS ─────────── */
  const handleMove    = m => setCubeState(prev => applyMove(prev,m));
  const handleReset   = () => setCubeState(initialState);

  const scrambleCube  = (len=20) => {
    const all = ["U","U'","U2","R","R'","R2","F","F'","F2","D","D'","D2","L","L'","L2","B","B'","B2"];
    const seq = Array.from({length:len}, ()=> all[Math.floor(Math.random()*all.length)]);
    setCubeState(prev => seq.reduce(applyMove, prev));
  };

  const logCubeState = () => {
    const s = ["U","R","F","D","L","B"]
      .map(f => cubeFaces[f].join(""))
      .join("");
    axios
      .post(`https://rubik-cube-backend-wkss.onrender.com/solve?state=${s}`)
      .then(r=>setOutput(r.data));
  };

  const applyMoves = async () => {
  // define exactly the legal moves
  const validMoves = new Set([
    "U","U'","U2",
    "R","R'","R2",
    "F","F'","F2",
    "D","D'","D2",
    "L","L'","L2",
    "B","B'","B2"
  ]);

  // split on whitespace
  const seq = moveInput.trim().split(/\s+/).filter(x => x);

  // sanity-check every token
  for (const m of seq) {
    if (!validMoves.has(m)) {
      alert(`“${m}” is not a valid move. Please use only U, U', U2, R, R', R2, etc.`);
      return;       // bail out without doing anything
    }
  }

  // all clear – apply them one at a time
  for (const m of seq) {
    setCubeState(prev => applyMove(prev, m));
    await new Promise(res => setTimeout(res, 500));
  }
  setMoveInput("");
};


  /* ─────────── JSX ─────────── */
  return (
    <div className="container cube-editor">

      {/* ─── the cube net ─── */}
      <div className="container cube-net">
        {["U","L","F","R","B","D"].map(face=>(
          <div key={face} className={`face face-${face}`}>
            <div className="face-grid">
              {cubeFaces[face]?.map((ltr,i)=>(
                <div
                  key={i}
                  className="face-square"
                  onClick={()=>handleSquareClick(face,i)}
                  style={{ backgroundColor: letterToColor[ltr] || letterToColor[selectedLetter] }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── controls below ─── */}
      <div className="cube-wrapper">
        <div className="cube-controls">

          <div className="controls-top">
            {/* rotation buttons */}
            <div className="rotation-grid">
              {["U","U'","R","R'","F","F'","D","D'","L","L'","B","B'"].map(m=>(
                <button
                  key={m}
                  className="btn rotation-btn"
                  onClick={()=>handleMove(m)}
                >{m}</button>
              ))}
            </div>

            {/* color swatches */}
            <div className="bottom-palette">
              {allowedLetters.map(letter=>(
                <div
                  key={letter}
                  className={`swatch${letter===selectedLetter?" selected":""}`}
                  onClick={()=>setSelectedLetter(letter)}
                  style={{ backgroundColor: letterToColor[letter] }}
                />
              ))}
            </div>
          </div>

          {/* apply / scramble / reset */}
          <div className="actions-wrapper">
            <div className="actions-left">
              <input
                type="text"
                placeholder="e.g. R U R' U'"
                value={moveInput}
                onChange={e=>setMoveInput(e.target.value)}
              />
              <button className="btn action-btn" onClick={applyMoves}>Apply</button>
             
            </div>
          </div>

          {/* solve button down below */}
          <div className="action-down">
             <button className="btn action-btn" onClick={()=>scrambleCube()}>Scramble</button>
              <button className="btn action-btn" onClick={handleReset}>Reset</button>

          </div>

            <div className="action-down">
  
            <button className="btn solve-btn" onClick={logCubeState}>Solve</button>
          </div>

        </div>
      </div>

      {/* ─── display solution ─── */}
      <div className="hero container">
        <div className="hero__stitle">Solution:</div>
        <div className="hero__sstitle">{output}</div>
      </div>
    </div>
  );
}
