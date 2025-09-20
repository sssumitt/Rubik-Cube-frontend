import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { initScene } from "./Scene";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";

// A simplified, "dumb" cube component without the Arrow HUD
const OpponentCube = forwardRef(({ cubeSize = 3, canvasId }, ref) => {
  const cubesRef = useRef([]);
  const sceneRef = useRef(null);
  const isRotating = useRef(false);

  // Expose a 'performMove' function to the parent component via the ref
  useImperativeHandle(ref, () => ({
    performMove: (move) => {
      const { face, sliceIndex, clockwise } = move;
      const spacing = 1.001;
      const centerIndex = (cubeSize - 1) / 2;
      const outerPos = centerIndex * spacing;
      const tolerance = spacing / 1000;
      
      if (sceneRef.current) {
         rotateFace(face, sliceIndex, cubesRef.current, sceneRef.current, outerPos, spacing, tolerance, getCubesForSlice, isRotating, clockwise);
      }
    }
  }));

  useEffect(() => {
    const spacing = 1.001;
    const centerIndex = (cubeSize - 1) / 2;
    const outerPos = centerIndex * spacing;
    const tolerance = spacing / 1000;

    // --- Main Cube Scene Setup ---
    const { scene: cubeScene, camera: cubeCamera, renderer: cubeRenderer, controls, cleanup: cleanupScene } = initScene(canvasId);
    sceneRef.current = cubeScene;

    // --- Create Cube Geometry ---
    const cubes = createRubiksCube(
      cubeSize, centerIndex, spacing, outerPos, tolerance,
      { W: 0xffffff, R: 0xff0000, Y: 0xffff00, O: 0xffa500, G: 0x00ff00, B: 0x0000ff },
      vertexShader, fragmentShader
    );
    const cubeGroup = new THREE.Group();
    cubes.forEach(cube => cubeGroup.add(cube));
    cubeScene.add(cubeGroup);
    cubesRef.current = cubes;

    // --- Animation Loop (No HUD to render) ---
    const animate = (t) => {
      requestAnimationFrame(animate);
      TWEEN.update(t);
      controls.update(); // Required for OrbitControls damping
      cubeRenderer.render(cubeScene, cubeCamera); // Just render the main scene
    };
    const animationFrameId = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      cleanupScene();
      cubeRenderer.dispose();
    };
  }, [cubeSize, canvasId]);

  // Render the canvas with the unique ID passed in from the parent.
  return <canvas id={canvasId} style={{ width: "100%", height: "100%" }} />;
});

export default OpponentCube;

