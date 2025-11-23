import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { initScene } from "./Scene";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";

const OpponentCube = forwardRef(({ cubeSize = 3, canvasId }, ref) => {
  const cubesRef = useRef([]);
  const sceneRef = useRef(null);
  const isRotating = useRef(false);
  const canvasRef = useRef(null);

  // Expose performMove to parent
  useImperativeHandle(ref, () => ({
    performMove: (move) => {
      const { face, sliceIndex, clockwise, duration } = move;
      const spacing = 1.001;
      const centerIndex = (cubeSize - 1) / 2;
      const outerPos = centerIndex * spacing;
      const tolerance = spacing / 1000;
      
      if (sceneRef.current) {
         // IMPORTANT: Return the Promise from rotateFace so the parent can await it
         return rotateFace(
           face, 
           sliceIndex, 
           cubesRef.current, 
           sceneRef.current, 
           outerPos, 
           spacing, 
           tolerance, 
           getCubesForSlice, 
           isRotating, 
           clockwise, 
           duration // Pass the custom duration (fast for scrambles)
         );
      }
      return Promise.resolve();
    }
  }));

  useEffect(() => {
    const spacing = 1.001;
    const centerIndex = (cubeSize - 1) / 2;
    const outerPos = centerIndex * spacing;
    const tolerance = spacing / 1000;

    const { scene: cubeScene, camera: cubeCamera, renderer: cubeRenderer, controls, cleanup: cleanupScene } = initScene(canvasId);
    sceneRef.current = cubeScene;

    // --- Resize Logic (Fixes Centering/Overflow) ---
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container && cubeCamera && cubeRenderer) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        cubeRenderer.setSize(width, height);
        cubeCamera.aspect = width / height;
        cubeCamera.updateProjectionMatrix();
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvasRef.current?.parentElement) {
        resizeObserver.observe(canvasRef.current.parentElement);
        handleResize(); // Initial sizing
    }

    // --- Geometry Creation ---
    const cubes = createRubiksCube(
      cubeSize, centerIndex, spacing, outerPos, tolerance,
      { W: 0xffffff, R: 0xff0000, Y: 0xffff00, O: 0xffa500, G: 0x00ff00, B: 0x0000ff },
      vertexShader, fragmentShader
    );
    const cubeGroup = new THREE.Group();
    cubes.forEach(cube => cubeGroup.add(cube));
    cubeScene.add(cubeGroup);
    cubesRef.current = cubes;

    // --- Animation Loop ---
    const animate = (t) => {
      requestAnimationFrame(animate);
      TWEEN.update(t);
      controls.update();
      cubeRenderer.render(cubeScene, cubeCamera);
    };
    const animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      cleanupScene();
      cubeRenderer.dispose();
    };
  }, [cubeSize, canvasId]);

  return (
    <canvas 
      ref={canvasRef}
      id={canvasId} 
      style={{ 
        display: "block",
        position: "absolute", // Strict positioning inside the card
        top: 0,
        left: 0,
        width: "100%", 
        height: "100%",
        outline: "none"
      }} 
    />
  );
});

export default OpponentCube;