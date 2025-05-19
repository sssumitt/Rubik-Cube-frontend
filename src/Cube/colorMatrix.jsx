// import { Corner } from './constants/corner';
// import { Edge } from './constants/edge';

// import { Face, edgeMappings, cornerMappings, edgeColors, cornerColors } from './constants/face';

// const { UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB } = Corner;
// const { UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR } = Edge;

// const cpU = [UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB];
// const coU = [0, 0, 0, 0, 0, 0, 0, 0];
// const epU = [UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR];
// const eoU = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// const cpR = [DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR];
// const coR = [2, 0, 0, 1, 1, 0, 0, 2];
// const epR = [FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR];
// const eoR = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// const cpF = [UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB];
// const coF = [1, 2, 0, 0, 2, 1, 0, 0];
// const epF = [UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR];
// const eoF = [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0];

// const cpD = [URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR];
// const coD = [0, 0, 0, 0, 0, 0, 0, 0];
// const epD = [UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR];
// const eoD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// const cpL = [URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB];
// const coL = [0, 1, 2, 0, 0, 2, 1, 0];
// const epL = [UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR];
// const eoL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// const cpB = [URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL];
// const coB = [0, 0, 1, 2, 0, 0, 2, 1];
// const epB = [UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB];
// const eoB = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1];

// const colorMatrix = () => {
//   const cube = {
//     ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//     eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     cp: [0, 1, 2, 3, 4, 5, 6, 7],
//     co: [0, 0, 0, 0, 0, 0, 0, 0]
//   };

//   const faceColors = {
//     [Face.U]: 'W',
//     [Face.R]: 'R',
//     [Face.F]: 'G',
//     [Face.D]: 'Y',
//     [Face.L]: 'O',
//     [Face.B]: 'B'
//   };

//   const faceCube = Object.keys(faceColors).map(key =>
//     Array(9).fill(faceColors[key])
//   );

//   const applyRotation = moves => {
//     for (const move of moves) {
//       let tempCornerPos = [...cube.cp];
//       let tempCornerOri = [...cube.co];
//       let tempEdgePos = [...cube.ep];
//       let tempEdgeOri = [...cube.eo];
//       switch (move[0]) {
//         case 'U':
//           for (let i = 0; i < 8; i++) {
//             cube.cp[i] = tempCornerPos[cpU[i]];
//             cube.co[i] = (tempCornerOri[cpU[i]] + coU[i]) % 3;
//           }
//           for (let i = 0; i < 12; i++) {
//             cube.ep[i] = tempEdgePos[epU[i]];
//             cube.eo[i] = (tempEdgeOri[epU[i]] + eoU[i]) % 2;
//           }
//           break;
//         case 'R':
//           for (let i = 0; i < 8; i++) {
//             cube.cp[i] = tempCornerPos[cpR[i]];
//             cube.co[i] = (tempCornerOri[cpR[i]] + coR[i]) % 3;
//           }
//           for (let i = 0; i < 12; i++) {
//             cube.ep[i] = tempEdgePos[epR[i]];
//             cube.eo[i] = (tempEdgeOri[epR[i]] + eoR[i]) % 2;
//           }
//           break;
//         case 'F':
//           for (let i = 0; i < 8; i++) {
//             cube.cp[i] = tempCornerPos[cpF[i]];
//             cube.co[i] = (tempCornerOri[cpF[i]] + coF[i]) % 3;
//           }
//           for (let i = 0; i < 12; i++) {
//             cube.ep[i] = tempEdgePos[epF[i]];
//             cube.eo[i] = (tempEdgeOri[epF[i]] + eoF[i]) % 2;
//           }
//           break;
//         case 'D':
//           for (let i = 0; i < 8; i++) {
//             cube.cp[i] = tempCornerPos[cpD[i]];
//             cube.co[i] = (tempCornerOri[cpD[i]] + coD[i]) % 3;
//           }
//           for (let i = 0; i < 12; i++) {
//             cube.ep[i] = tempEdgePos[epD[i]];
//             cube.eo[i] = (tempEdgeOri[epD[i]] + eoD[i]) % 2;
//           }
//           break;
//         case 'L':
//           for (let i = 0; i < 8; i++) {
//             cube.cp[i] = tempCornerPos[cpL[i]];
//             cube.co[i] = (tempCornerOri[cpL[i]] + coL[i]) % 3;
//           }
//           for (let i = 0; i < 12; i++) {
//             cube.ep[i] = tempEdgePos[epL[i]];
//             cube.eo[i] = (tempEdgeOri[epL[i]] + eoL[i]) % 2;
//           }
//           break;
//         case 'B':
//           for (let i = 0; i < 8; i++) {
//             cube.cp[i] = tempCornerPos[cpB[i]];
//             cube.co[i] = (tempCornerOri[cpB[i]] + coB[i]) % 3;
//           }
//           for (let i = 0; i < 12; i++) {
//             cube.ep[i] = tempEdgePos[epB[i]];
//             cube.eo[i] = (tempEdgeOri[epB[i]] + eoB[i]) % 2;
//           }
//           break;
//       }
//     }
//     console.log(cube);
//   };

//   applyRotation(['U', 'R', 'L']);

//   function updateFacelets(cube) {
//     for (let face = 0; face < 6; face++) {
//       faceCube[face][4] = faceColors[face];
//     }
//     for (let i = 0; i < 12; i++) {
//       const pos = cube.ep[i];
//       const ori = cube.eo[i];
//       const mapping = edgeMappings[i];
//       let c1 = edgeColors[pos][0];
//       let c2 = edgeColors[pos][1];
//       if (ori === 1) {
//         const temp = c1;
//         c1 = c2;
//         c2 = temp;
//       }
//       faceCube[mapping.face1][mapping.index1] = c1;
//       faceCube[mapping.face2][mapping.index2] = c2;
//     }
//     for (let i = 0; i < 8; i++) {
//       const pos = cube.cp[i];
//       const ori = cube.co[i];
//       const mapping = cornerMappings[i];
//       let c1 = cornerColors[pos][0];
//       let c2 = cornerColors[pos][1];
//       let c3 = cornerColors[pos][2];
//       if (ori === 1) {
//         const temp = c1;
//         c1 = c3;
//         c3 = c2;
//         c2 = temp;
//       } else if (ori === 2) {
//         const temp = c1;
//         c1 = c2;
//         c2 = c3;
//         c3 = temp;
//       }
//       faceCube[mapping.face1][mapping.index1] = c1;
//       faceCube[mapping.face2][mapping.index2] = c2;
//       faceCube[mapping.face3][mapping.index3] = c3;
//     }
//   }
//   updateFacelets(cube);

//   function printFaceCube(faceCube) {
//     const faceNames = ['U', 'R', 'F', 'D', 'L', 'B'];
//     faceCube.forEach((face, i) => {
//       console.log(`Face ${faceNames[i]}:`);
//       for (let row = 0; row < 3; row++) {
//         console.log(face.slice(row * 3, row * 3 + 3).join(' '));
//       }
//       console.log(''); // Blank line between faces
//     });
//   }

//   // printFaceCube(faceCube);

//   function faceCubeToString(faceCube) {
//     const faceNames = ['U', 'R', 'F', 'D', 'L', 'B'];
//     let output = '';
//     faceCube.forEach((face, i) => {
//       // output += `Face ${faceNames[i]}:\n`;
//       for (let row = 0; row < 3; row++) {
//         output += face.slice(row * 3, row * 3 + 3).join('');
//       }
//       // output += "\n";
//     });
//     return output;
//   }
  
 
 

//   console.log(faceCubeToString(faceCube))
  
  

// };

// export default colorMatrix;
