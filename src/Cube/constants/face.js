export const Face = Object.freeze({
  U: 0,
  R: 1,
  F: 2,
  D: 3,
  L: 4,
  B: 5,
});

export const edgeMappings = [
  { face1: Face.U, index1: 5, face2: Face.R, index2: 1 }, // UR  0
  { face1: Face.U, index1: 7, face2: Face.F, index2: 1 }, // UF  1
  { face1: Face.U, index1: 3, face2: Face.L, index2: 1 }, // UL  2
  { face1: Face.U, index1: 1, face2: Face.B, index2: 1 }, // UB  3

  { face1: Face.D, index1: 5, face2: Face.R, index2: 7 }, // DR  4
  { face1: Face.D, index1: 1, face2: Face.F, index2: 7 }, // DF  5
  { face1: Face.D, index1: 3, face2: Face.L, index2: 7 }, // DL  6
  { face1: Face.D, index1: 7, face2: Face.B, index2: 7 }, // DB  7

  { face1: Face.F, index1: 5, face2: Face.R, index2: 3 }, // FR  8
  { face1: Face.F, index1: 3, face2: Face.L, index2: 5 }, // FL  9

  { face1: Face.B, index1: 5, face2: Face.L, index2: 3 }, // BL 10
  { face1: Face.B, index1: 3, face2: Face.R, index2: 5 }, // BR 11
];

export const cornerMappings = [
  {
    face1: Face.U,
    index1: 8,
    face2: Face.R,
    index2: 0,
    face3: Face.F,
    index3: 2,
  }, // URF  0
  {
    face1: Face.U,
    index1: 6,
    face2: Face.F,
    index2: 0,
    face3: Face.L,
    index3: 2,
  }, // UFL  1
  {
    face1: Face.U,
    index1: 0,
    face2: Face.L,
    index2: 0,
    face3: Face.B,
    index3: 2,
  }, // ULB  2
  {
    face1: Face.U,
    index1: 2,
    face2: Face.B,
    index2: 0,
    face3: Face.R,
    index3: 2,
  }, // UBR  3

  {
    face1: Face.D,
    index1: 2,
    face2: Face.F,
    index2: 8,
    face3: Face.R,
    index3: 6,
  }, // DFR  4
  {
    face1: Face.D,
    index1: 0,
    face2: Face.L,
    index2: 8,
    face3: Face.F,
    index3: 6,
  }, // DLF  5
  {
    face1: Face.D,
    index1: 6,
    face2: Face.B,
    index2: 8,
    face3: Face.L,
    index3: 6,
  }, // DBL  6
  {
    face1: Face.D,
    index1: 8,
    face2: Face.R,
    index2: 8,
    face3: Face.B,
    index3: 6,
  }, // DRB  7
];

export const edgeColors = [
  ["W", "R"], // UR
  ["W", "G"], // UF
  ["W", "O"], // UL
  ["W", "B"], // UB

  ["Y", "R"], // DR
  ["Y", "G"], // DF
  ["Y", "O"], // DL
  ["Y", "B"], // DB

  ["G", "R"], // FR
  ["G", "O"], // FL

  ["B", "O"], // BL
  ["B", "R"], // BR
];

export const cornerColors = [
  ["W", "R", "G"], // URF
  ["W", "G", "O"], // UFL
  ["W", "O", "B"], // ULB
  ["W", "B", "R"], // UBR
  ["Y", "G", "R"], // DFR
  ["Y", "O", "G"], // DLF
  ["Y", "B", "O"], // DBL
  ["Y", "R", "B"], // DRB
];
