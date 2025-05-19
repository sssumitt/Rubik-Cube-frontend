import axios from "axios";
import React, { useState, useEffect } from "react";
import { Face, edgeMappings, cornerMappings, edgeColors, cornerColors } from './constants/face';
import { Corner } from './constants/corner';
import { Edge } from './constants/edge';

// rotation tables from colorMatrix utility
const cpU = [Corner.UBR, Corner.URF, Corner.UFL, Corner.ULB, Corner.DFR, Corner.DLF, Corner.DBL, Corner.DRB];
const coU = [0,0,0,0,0,0,0,0];
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

const tables = { U:{cp:cpU,co:coU,ep:epU,eo:eoU},R:{cp:cpR,co:coR,ep:epR,eo:eoR},F:{cp:cpF,co:coF,ep:epF,eo:eoF},D:{cp:cpD,co:coD,ep:epD,eo:eoD},L:{cp:cpL,co:coL,ep:epL,eo:eoL},B:{cp:cpB,co:coB,ep:epB,eo:eoB}};

export default function CubeNetEditor(){
  const initialState={cp:[...Array(8).keys()],co:Array(8).fill(0),ep:[...Array(12).keys()],eo:Array(12).fill(0)};
  const [cubeState,setCubeState]=useState(initialState);
  const [cubeFaces,setCubeFaces]=useState({U:[],R:[],F:[],D:[],L:[],B:[]});
  const [output,setOutput]=useState("");

  const allowedLetters=['W','R','G','Y','O','B'];
  const letterToColor={W:'white',R:'red',G:'green',Y:'yellow',O:'orange',B:'blue'};
  const [selectedLetter,setSelectedLetter]=useState('W');

  const handleSquareClick=(face,idx)=>{
    setCubeFaces(prev=>({...prev,[face]:prev[face].map((ltr,i)=>i===idx?selectedLetter:ltr)}));
  };

  useEffect(()=>{
    const faceCube=Array(6).fill().map(_=>Array(9).fill(null));
    const faceColors={0:'W',1:'R',2:'G',3:'Y',4:'O',5:'B'};
    faceCube.forEach((m,i)=>m[4]=faceColors[i]);
    cubeState.ep.forEach((pos,i)=>{const ori=cubeState.eo[i],map=edgeMappings[i];let[c1,c2]=edgeColors[pos];if(ori) [c1,c2]=[c2,c1];faceCube[map.face1][map.index1]=c1;faceCube[map.face2][map.index2]=c2;});
    cubeState.cp.forEach((pos,i)=>{const ori=cubeState.co[i],map=cornerMappings[i];let[c1,c2,c3]=cornerColors[pos];if(ori===1)[c1,c2,c3]=[c3,c1,c2];else if(ori===2)[c1,c2,c3]=[c2,c3,c1];faceCube[map.face1][map.index1]=c1;faceCube[map.face2][map.index2]=c2;faceCube[map.face3][map.index3]=c3;});
    const newF={};['U','R','F','D','L','B'].forEach((f,i)=>newF[f]=faceCube[i]);setCubeFaces(newF);
  },[cubeState]);

  const handleMove=(move)=>{const base=move[0],suffix=move[1];const times=suffix==="'"?3:suffix==='2'?2:1;let{cp,co,ep,eo}=cubeState;for(let t=0;t<times;t++){const{cp:cpTbl,co:coTbl,ep:epTbl,eo:eoTbl}=tables[base];const oldCp=[...cp],oldCo=[...co],oldEp=[...ep],oldEo=[...eo];const newCp=[...cp],newCo=[...co],newEp=[...ep],newEo=[...eo];for(let i=0;i<8;i++){newCp[i]=oldCp[cpTbl[i]];newCo[i]=(oldCo[cpTbl[i]]+coTbl[i])%3;}for(let i=0;i<12;i++){newEp[i]=oldEp[epTbl[i]];newEo[i]=(oldEo[epTbl[i]]+eoTbl[i])%2;}cp=newCp;co=newCo;ep=newEp;eo=newEo;}setCubeState({cp,co,ep,eo});};
  const handleReset=()=>setCubeState(initialState);
  const logCubeState=()=>{let s='';['U','R','F','D','L','B'].forEach(f=>s+=cubeFaces[f].join(''));axios.post(`https://rubik-cube-backend-production-e17c.up.railway.app/solve?state=${s}`).then(r=>setOutput(r.data));};

  return(
    <div className="container cube-editor">
      <div className="container cube-net">
        {['U','L','F','R','B','D'].map(face=>(<div key={face} className={`face face-${face}`}>
          <div className="face-grid">{cubeFaces[face]?.map((ltr,i)=>(<div key={i} onClick={()=>handleSquareClick(face,i)} className="face-square" style={{backgroundColor:letterToColor[ltr]||letterToColor[selectedLetter]}}/>))}</div></div>))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>

        <div className="rotation-grid" style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gridTemplateRows:'repeat(2,auto)',gap:8}}>
          {["U","U'","R","R'","F","F'","D","D'","L","L'","B","B'"].map(m=>(<button key={m} className="btn" onClick={()=>handleMove(m)}>{m}</button>))}
        </div>

        <div className="bottom-palette" >
        {allowedLetters.map(letter=>(<div key={letter} onClick={()=>setSelectedLetter(letter)} className={letter===selectedLetter?'swatch selected':'swatch'} style={{backgroundColor:letterToColor[letter]}}/>))}
      </div>

        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:12}}>
          <button className="btn action-btn" onClick={handleReset}>Reset</button>
          <button className="btn action-btn" onClick={logCubeState}>Solve</button>
        </div>
      </div>

      <div className="hero container" style={{marginTop:16}}>
        <div className="hero__stitle">Solution:</div>
        <div className="hero__subtitle">{output}</div>
      </div>
    </div>
  );
}
