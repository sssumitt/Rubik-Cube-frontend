/* ─────────── GENERIC N x N CUBE LOGIC ─────────── */

// Face Indices
export const FACES = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };
export const FACE_NAMES = ['U', 'R', 'F', 'D', 'L', 'B'];
export const COLORS = { 0: 'W', 1: 'R', 2: 'G', 3: 'Y', 4: 'O', 5: 'B' };

/**
 * Generates a solved state for a cube of size N
 * Returns an object: { size: N, faces: [[...], [...], ...] }
 * Each face is a 1D array of length N*N (row-major)
 */
export const getInitialState = (size = 3) => {
  const faces = [];
  for (let f = 0; f < 6; f++) {
    // Create an array of size N*N filled with the color index (0-5)
    faces.push(Array(size * size).fill(f));
  }
  return { size, faces };
};

/**
 * Helper: Rotates a single face grid 90 degrees clockwise
 */
const rotateFaceGrid = (faceArray, size, clockwise) => {
  const newFace = [...faceArray];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Map old coordinates to new coordinates
      const oldIdx = row * size + col;
      let newRow, newCol;

      if (clockwise) {
        newRow = col;
        newCol = size - 1 - row;
      } else {
        newRow = size - 1 - col;
        newCol = row;
      }

      const newIdx = newRow * size + newCol;
      newFace[newIdx] = faceArray[oldIdx];
    }
  }
  return newFace;
};

/**
 * Helper: Gets a strip (row or column) from a face
 */
const getStrip = (faceArray, size, type, index, reverse = false) => {
  const strip = [];
  if (type === 'row') {
    const start = index * size;
    for (let i = 0; i < size; i++) strip.push(faceArray[start + i]);
  } else { // col
    for (let i = 0; i < size; i++) strip.push(faceArray[i * size + index]);
  }
  return reverse ? strip.reverse() : strip;
};

/**
 * Helper: Sets a strip (row or column) onto a face
 */
const setStrip = (faceArray, size, type, index, data) => {
  const newFace = [...faceArray];
  if (type === 'row') {
    const start = index * size;
    for (let i = 0; i < size; i++) newFace[start + i] = data[i];
  } else { // col
    for (let i = 0; i < size; i++) newFace[i * size + index] = data[i];
  }
  return newFace;
};

/**
 * Applies a move to the generic state
 * moveStr format: "U", "R'", "F2", etc.
 * NOTE: This function assumes outer layer moves. 
 * For slice moves, we rely on the `applyMoveObject` function below.
 */
export const applyMoveToState = (state, moveStr) => {
  if (!moveStr) return state;

  const faceChar = moveStr[0];
  const suffix = moveStr.length > 1 ? moveStr.substring(1) : "";

  // Parse modifiers
  const clockwise = !suffix.includes("'");
  const double = suffix.includes("2");

  // For notation like "U", "R", we assume sliceIndex 0 (outer layer)
  // To support "2R" or "Rw" notation parsing, you'd need a more complex parser.
  // Here we construct a move object and delegate.
  const moveObj = {
    face: faceChar,
    sliceIndex: 0,
    clockwise: clockwise
  };

  let newState = state;
  newState = applyMoveObject(newState, moveObj);

  if (double) {
    newState = applyMoveObject(newState, moveObj);
  }

  return newState;
};

/**
 * THE CORE LOGIC
 * Handles Face rotation + Adjacent Ring Cycling for ANY slice depth
 */
export const applyMoveObject = (state, move) => {
  const { face, sliceIndex, clockwise } = move;
  const { size, faces } = state;
  const nextFaces = [...faces]; // Copy of the 6 faces

  // 1. If sliceIndex is 0, we must rotate the face itself
  if (sliceIndex === 0) {
    nextFaces[FACES[face]] = rotateFaceGrid(nextFaces[FACES[face]], size, clockwise);
  } else if (sliceIndex === size - 1) {
    // If sliceIndex is the last one, it corresponds to the opposite face
    // The rotation direction is inverted relative to the opposite face's standard rotation
    const oppositeFaceMap = { 'U': 'D', 'D': 'U', 'L': 'R', 'R': 'L', 'F': 'B', 'B': 'F' };
    const oppositeFace = oppositeFaceMap[face];
    nextFaces[FACES[oppositeFace]] = rotateFaceGrid(nextFaces[FACES[oppositeFace]], size, !clockwise);
  }

  // 2. Cycle the adjacent ring
  // Define relationships: Which adjacent faces/strips are affected by this face?
  // format: [FaceIdx, 'row'/'col', index, shouldReverse?]
  let ring;

  // Indices for strips depend on sliceIndex (depth)
  const first = sliceIndex;
  const last = size - 1 - sliceIndex;

  switch (face) {
    case 'U':
      // F(row 0) -> L(row 0) -> B(row 0) -> R(row 0)
      ring = [
        { f: FACES.F, type: 'row', idx: first },
        { f: FACES.L, type: 'row', idx: first },
        { f: FACES.B, type: 'row', idx: first },
        { f: FACES.R, type: 'row', idx: first }
      ];
      break;
    case 'D':
      // F(row last) -> R(row last) -> B(row last) -> L(row last)
      ring = [
        { f: FACES.F, type: 'row', idx: last },
        { f: FACES.R, type: 'row', idx: last },
        { f: FACES.B, type: 'row', idx: last },
        { f: FACES.L, type: 'row', idx: last }
      ];
      break;
    case 'L':
      // U(col 0) -> F(col 0) -> D(col 0) -> B(col last, reversed)
      ring = [
        { f: FACES.U, type: 'col', idx: first },
        { f: FACES.F, type: 'col', idx: first },
        { f: FACES.D, type: 'col', idx: first },
        { f: FACES.B, type: 'col', idx: last, rev: true }
      ];
      break;
    case 'R':
      // U(col last) -> B(col 0, reversed) -> D(col last) -> F(col last)
      ring = [
        { f: FACES.U, type: 'col', idx: last },
        { f: FACES.B, type: 'col', idx: first, rev: true },
        { f: FACES.D, type: 'col', idx: last },
        { f: FACES.F, type: 'col', idx: last }
      ];
      break;
    case 'F':
      // U(row last) -> R(col 0) -> D(row 0) -> L(col last)
      ring = [
        { f: FACES.U, type: 'row', idx: last },
        { f: FACES.R, type: 'col', idx: first },
        { f: FACES.D, type: 'row', idx: first },
        { f: FACES.L, type: 'col', idx: last }
      ];
      break;
    case 'B':
      // U(row 0) -> L(col 0) -> D(row last) -> R(col last)
      ring = [
        { f: FACES.U, type: 'row', idx: first },
        { f: FACES.L, type: 'col', idx: first },
        { f: FACES.D, type: 'row', idx: last },
        { f: FACES.R, type: 'col', idx: last }
      ];
      break;
    default: return state;
  }

  // Perform the cycle
  const strips = ring.map(r => getStrip(nextFaces[r.f], size, r.type, r.idx, r.rev));

  if (clockwise) {
    // 0->1, 1->2, 2->3, 3->0 (Actually usually logic pushes: 3 gets 2, 2 gets 1...)
    // Let's trace: U -> L -> B -> R (Clockwise U turn)
    // Visually: Front face goes Left, Right face goes Front...
    // Standard cycle: 3->0, 0->1, 1->2, 2->3

    // Save last to temp
    const temp = strips[3];

    // Apply to state
    // 3 gets 2
    nextFaces[ring[3].f] = setStrip(nextFaces[ring[3].f], size, ring[3].type, ring[3].idx, ring[3].rev ? strips[2].reverse() : strips[2]);
    // 2 gets 1
    nextFaces[ring[2].f] = setStrip(nextFaces[ring[2].f], size, ring[2].type, ring[2].idx, ring[2].rev ? strips[1].reverse() : strips[1]);
    // 1 gets 0
    nextFaces[ring[1].f] = setStrip(nextFaces[ring[1].f], size, ring[1].type, ring[1].idx, ring[1].rev ? strips[0].reverse() : strips[0]);
    // 0 gets temp (3)
    nextFaces[ring[0].f] = setStrip(nextFaces[ring[0].f], size, ring[0].type, ring[0].idx, ring[0].rev ? temp.reverse() : temp);

  } else {
    // Counter Clockwise
    const temp = strips[0];

    // 0 gets 1
    nextFaces[ring[0].f] = setStrip(nextFaces[ring[0].f], size, ring[0].type, ring[0].idx, ring[0].rev ? strips[1].reverse() : strips[1]);
    // 1 gets 2
    nextFaces[ring[1].f] = setStrip(nextFaces[ring[1].f], size, ring[1].type, ring[1].idx, ring[1].rev ? strips[2].reverse() : strips[2]);
    // 2 gets 3
    nextFaces[ring[2].f] = setStrip(nextFaces[ring[2].f], size, ring[2].type, ring[2].idx, ring[2].rev ? strips[3].reverse() : strips[3]);
    // 3 gets 0
    nextFaces[ring[3].f] = setStrip(nextFaces[ring[3].f], size, ring[3].type, ring[3].idx, ring[3].rev ? temp.reverse() : temp);
  }

  return { size, faces: nextFaces };
};

/**
 * Checks if the cube is solved
 */
export const checkSolved = (state) => {
  const { faces } = state;
  // For each face 0..5
  for (let f = 0; f < 6; f++) {
    const stickers = faces[f];
    // Check if the face is monochromatic.
    // We take the first sticker's color as the target for this face.
    const targetColor = stickers[0];

    for (let i = 1; i < stickers.length; i++) {
      if (stickers[i] !== targetColor) return false;
    }
  }
  return true;
};

/**
 * Converts 3D move object to logic
 */
export const convertMoveToNotation = (moveObj) => {
  // This is a pass-through helper now, but the main logic uses objects directly
  // If you need string notation for UI:
  let str = moveObj.face;
  // Slice notation is complex (Rw, 2R, etc), we can skip standard notation
  // and just return the object itself if your app supports it, 
  // OR keep returning basic strings for outer layers only.
  if (moveObj.sliceIndex !== 0) return null; // Only track outer moves for notation
  if (!moveObj.clockwise) str += "'";
  return str;
};