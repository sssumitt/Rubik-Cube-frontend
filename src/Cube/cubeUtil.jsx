// cubeUtil.js
import * as THREE from "three";

export const getTargetCoordinate = (face, sliceIndex, outerPos, spacing) => {
  // For a given face, the outer layer has coordinate outerPos (or -outerPos).
  // For inner slices, subtract (or add) multiples of spacing.
  switch (face) {
    case "U":
      return outerPos - sliceIndex * spacing;
    case "D":
      return -outerPos + sliceIndex * spacing;
    case "L":
      return -outerPos + sliceIndex * spacing;
    case "R":
      return outerPos - sliceIndex * spacing;
    case "F":
      return outerPos - sliceIndex * spacing;
    case "B":
      return -outerPos + sliceIndex * spacing;
    default:
      return null;
  }
};

export const addNewBoxMesh = (
  x,
  y,
  z,
  outerPos,
  tolerance,
  NColorMap,
  vertexShader,
  fragmentShader,
) => {
  const faceData = [
    { axis: "x", position: outerPos, color: NColorMap["R"] },
    { axis: "x", position: -outerPos, color: NColorMap["O"] },
    { axis: "y", position: outerPos, color: NColorMap["W"] },
    { axis: "y", position: -outerPos, color: NColorMap["Y"] },
    { axis: "z", position: outerPos, color: NColorMap["G"] },
    { axis: "z", position: -outerPos, color: NColorMap["B"] },
  ];

  const faceMaterials = [];
  for (let i = 0; i < 6; i++) {
    const { axis, position: expectedPos, color } = faceData[i];
    const coord = axis === "x" ? x : axis === "y" ? y : z;
    const isOuterFace = Math.abs(coord - expectedPos) < tolerance;
    const faceColorValue = isOuterFace ? color : 0x000000;

    faceMaterials.push(
      new THREE.ShaderMaterial({
        uniforms: {
          faceColor: { value: new THREE.Color(faceColorValue) },
          borderThickness: { value: 0.05 },
          borderRadius: { value: 0.1 },
        },
        vertexShader,
        fragmentShader,
      })
    );
  }

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMesh = new THREE.Mesh(boxGeometry, faceMaterials);
  boxMesh.position.set(x, y, z);

  // Store logical face colors for reference.
  boxMesh.userData.faceColors = {
    U: "W",
    R: "R",
    F: "G",
    D: "Y",
    L: "O",
    B: "B",
  };

  return boxMesh;
};

export const createRubiksCube = (
  cubeSize,
  centerIndex,
  spacing,
  outerPos,
  tolerance,
  NColorMap,
  vertexShader,
  fragmentShader
) => {
  const cubes = [];
  for (let i = 0; i < cubeSize; i++) {
    for (let j = 0; j < cubeSize; j++) {
      for (let k = 0; k < cubeSize; k++) {
        const x = (i - centerIndex) * spacing;
        const y = (j - centerIndex) * spacing;
        const z = (k - centerIndex) * spacing;
        const cube = addNewBoxMesh(x, y, z, outerPos, tolerance, NColorMap, vertexShader, fragmentShader);
        cubes.push(cube);
      }
    }
  }
  return cubes;
};

export const getCubesForSlice = (face, cubes, outerPos, sliceIndex, spacing, tolerance) => {
  const target = getTargetCoordinate(face, sliceIndex, outerPos, spacing);
  switch (face) {
    case "U":
    case "D":
      return cubes.filter((cube) => Math.abs(cube.position.y - target) < tolerance);
    case "L":
    case "R":
      return cubes.filter((cube) => Math.abs(cube.position.x - target) < tolerance);
    case "F":
    case "B":
      return cubes.filter((cube) => Math.abs(cube.position.z - target) < tolerance);
    default:
      return [];
  }
};
