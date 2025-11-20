import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { initScene } from "./Scene";
import initAxesScene from "./AxisScene";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";

const CubeWithArrow = forwardRef(({ cubeSize = 3, canvasId }, ref) => {
  const mountRef = useRef(null); // Reference to the parent DIV
  const cubesRef = useRef([]);
  const sceneRef = useRef(null);
  const isRotating = useRef(false);
  const canvasRef = useRef(null); // Reference to the Main Cube Canvas

  // --- 1. Restore Game Control Logic (Required for Socket) ---
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

    // --- 2. Main Cube Scene Setup ---
    const { scene: cubeScene, camera: cubeCamera, renderer: cubeRenderer, controls, cleanup: cleanupScene } = initScene(canvasId);
    sceneRef.current = cubeScene;

    // --- 3. Resize Logic (Keeps cube centered in card) ---
    const handleResize = () => {
      const container = mountRef.current;
      if (container && cubeCamera && cubeRenderer) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        cubeRenderer.setSize(width, height);
        cubeCamera.aspect = width / height;
        cubeCamera.updateProjectionMatrix();
      }
    };
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    // --- 4. Cube Geometry ---
    const cubes = createRubiksCube(
      cubeSize, centerIndex, spacing, outerPos, tolerance,
      { W: 0xffffff, R: 0xff0000, Y: 0xffff00, O: 0xffa500, G: 0x00ff00, B: 0x0000ff },
      vertexShader, fragmentShader
    );
    const cubeGroup = new THREE.Group();
    cubes.forEach(cube => cubeGroup.add(cube));
    cubeScene.add(cubeGroup);
    cubesRef.current = cubes;

    // --- 5. Arrow HUD Setup ---
    const arrowSize = 100; // Slightly smaller to fit nicely
    const { scene: arrowScene, camera: arrowCamera, renderer: arrowRenderer, arrowGroup } = initAxesScene(arrowSize);
    
    // CRITICAL FIX: Append to the component's container, NOT document.body
    if (mountRef.current) {
        mountRef.current.appendChild(arrowRenderer.domElement);
    }

    // CRITICAL FIX: Style the Arrow Canvas to sit in the bottom-left of the wrapper
    arrowRenderer.domElement.style.position = "absolute";
    arrowRenderer.domElement.style.bottom = "10px";
    arrowRenderer.domElement.style.left = "10px";
    arrowRenderer.domElement.style.zIndex = "10"; // Ensure it sits ON TOP of the main cube
    arrowRenderer.domElement.style.pointerEvents = "none"; // Click-through to main canvas

    // --- 6. Keyboard Controls (Local) ---
    let currentSlice = null;
    const digitMapping = { "1":"1","!":"1","2":"2","@":"2","3":"3","#":"3","4":"4","$":"4","5":"5","%":"5","6":"6","^":"6","7":"7","&":"7","8":"8","*":"8","9":"9","(":"9" };

    const handleKeyDown = (e) => {
      if (digitMapping[e.key]) {
        currentSlice = parseInt(digitMapping[e.key]) - 1;
        return;
      }
      if ("udlrfb".includes(e.key.toLowerCase())) {
        const face = e.key.toUpperCase();
        const sliceIndex = currentSlice !== null ? currentSlice : 0;
        const clockwise = !e.shiftKey;
        rotateFace(face, sliceIndex, cubesRef.current, cubeScene, outerPos, spacing, tolerance, getCubesForSlice, isRotating, clockwise);
        currentSlice = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // --- 7. Animation Loop ---
    const animate = (t) => {
      requestAnimationFrame(animate);
      TWEEN.update(t);
      controls.update();

      // Sync Arrow rotation
      arrowGroup.quaternion.copy(cubeCamera.quaternion).invert();

      cubeRenderer.render(cubeScene, cubeCamera);
      arrowRenderer.render(arrowScene, arrowCamera);
    };
    const animationFrameId = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      cleanupScene();
      cubeRenderer.dispose();
      arrowRenderer.dispose();
      
      // Remove Arrow Canvas from the specific container
      if (arrowRenderer.domElement.parentElement) {
        arrowRenderer.domElement.remove();
      }
    };
  }, [cubeSize, canvasId]);

  // --- 8. JSX Structure ---
  // We return a Div Wrapper (Relative) containing the Main Canvas (Absolute)
  // The Arrow Canvas is appended dynamically inside this Div by the useEffect
  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'relative', // Establishes boundary for absolute children
        width: '100%', 
        height: '100%',
        overflow: 'hidden' 
      }}
    >
      <canvas 
        ref={canvasRef}
        id={canvasId} 
        style={{ 
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", 
            height: "100%",
            outline: "none",
            zIndex: 1 
        }}
      />
    </div>
  );
});

export default CubeWithArrow;