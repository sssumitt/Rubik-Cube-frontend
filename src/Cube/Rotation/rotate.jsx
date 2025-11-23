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
  duration = 300 // Default to 300ms
) => {
  // Return a Promise so we can await completion
  return new Promise((resolve) => {
    // If already rotating, resolve immediately to avoid blocking the queue
    if (isRotatingRef.current) {
      resolve();
      return;
    }

    isRotatingRef.current = true;

    const cubesToRotate = getCubesForSlice(face, cubes, outerPos, sliceIndex, spacing, tolerance);
    
    // If no cubes found (shouldn't happen), resolve immediately
    if (!cubesToRotate.length) {
      isRotatingRef.current = false;
      resolve();
      return;
    }

    const group = new THREE.Group();
    scene.add(group);
    cubesToRotate.forEach((cube) => {
      group.add(cube);
    });

    const axis = faceToAxis[face];
    const startAngle = group.rotation[axis];
    const endAngle = startAngle + getRotationSign(face, clockwise);

    new TWEEN.Tween(group.rotation)
      .to({ [axis]: endAngle }, duration) // Use the passed duration
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        const finalAngle = group.rotation[axis];
        const snappedAngle = Math.round(finalAngle / (Math.PI / 2)) * (Math.PI / 2);
        group.rotation[axis] = snappedAngle;

        cubesToRotate.forEach((cube) => {
          cube.updateWorldMatrix(true, true);
          scene.attach(cube);
        });
        scene.remove(group);
        isRotatingRef.current = false;
        
        resolve(); // <--- Signal that animation is completely finished
      })
      .start();
  });
};