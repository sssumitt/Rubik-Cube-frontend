// rotate.js
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

export const faceToAxis = {
  U: "y",
  D: "y",
  L: "x",
  R: "x",
  F: "z",
  B: "z",
};

export const getRotationSign = (face, clockwise) => {
  const map = {
    U: clockwise ? -1 : +1,
    D: clockwise ? +1 : -1,
    L: clockwise ? +1 : -1,
    R: clockwise ? -1 : +1,
    F: clockwise ? -1 : +1,
    B: clockwise ? +1 : -1,
  };
  return map[face] * (Math.PI / 2);
};

export const rotateFace = (
  face,
  sliceIndex,
  cubes,
  scene,
  outerPos,
  spacing,
  tolerance,
  getCubesForSlice,
  isRotatingRef,
  clockwise = true,
) => {
  if (isRotatingRef.current) return;
  isRotatingRef.current = true;

  // Use the helper to select cubes in the specified slice.
  const cubesToRotate = getCubesForSlice(face, cubes, outerPos, sliceIndex, spacing, tolerance);
  if (!cubesToRotate.length) {
    isRotatingRef.current = false;
    return;
  }

  // Create a temporary group for these cubes.
  const group = new THREE.Group();
  scene.add(group);
  cubesToRotate.forEach((cube) => {
    group.add(cube);
  });

  const axis = faceToAxis[face];
  const startAngle = group.rotation[axis];
  const endAngle = startAngle + getRotationSign(face, clockwise);

  new TWEEN.Tween(group.rotation)
    .to({ [axis]: endAngle }, 300)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onComplete(() => {
      // Snap to the nearest 90°.
      const finalAngle = group.rotation[axis];
      const snappedAngle = Math.round(finalAngle / (Math.PI / 2)) * (Math.PI / 2);
      group.rotation[axis] = snappedAngle;

      // "Bake" the rotation into each cube and reattach them.
      cubesToRotate.forEach((cube) => {
        cube.updateWorldMatrix(true, true);
        scene.attach(cube);
      });
      scene.remove(group);
      isRotatingRef.current = false;
    })
    .start();
};
