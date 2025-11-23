import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { initScene } from "./Scene";
import initAxesScene from "./AxisScene";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";

const CubeWithArrow = forwardRef(({ cubeSize = 3, canvasId, disableKeyboard = false }, ref) => {
  const mountRef = useRef(null); // Reference to the wrapper div
  const cubesRef = useRef([]);
  const sceneRef = useRef(null);
  const isRotating = useRef(false);
  const canvasRef = useRef(null);

  // Expose performMove to parent (TwoPlayerCubeView)
  useImperativeHandle(ref, () => ({
    performMove: (move) => {
      const { face, sliceIndex, clockwise, duration } = move;
      const spacing = 1.001;
      const centerIndex = (cubeSize - 1) / 2;
      const outerPos = centerIndex * spacing;
      const tolerance = spacing / 1000;

      if (sceneRef.current) {
        // IMPORTANT: Return promise for async/await in parent
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
          duration // Pass custom duration
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

    // --- Main Scene ---
    // Initialize the main Three.js scene for the cube
    const { scene: cubeScene, camera: cubeCamera, renderer: cubeRenderer, controls, cleanup: cleanupScene } = initScene(canvasId);
    sceneRef.current = cubeScene;

    // --- Resize Logic ---
    // Keeps the 3D camera synced with the wrapper div's size
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

    // --- Geometry ---
    // Create the individual cubies
    const cubes = createRubiksCube(
      cubeSize, centerIndex, spacing, outerPos, tolerance,
      { W: 0xffffff, R: 0xff0000, Y: 0xffff00, O: 0xffa500, G: 0x00ff00, B: 0x0000ff },
      vertexShader, fragmentShader
    );
    const cubeGroup = new THREE.Group();
    cubes.forEach(cube => cubeGroup.add(cube));
    cubeScene.add(cubeGroup);
    cubesRef.current = cubes;

    // --- Arrow HUD ---
    // Initialize the separate scene for the orientation arrows
    const arrowSize = 100;
    const { scene: arrowScene, camera: arrowCamera, renderer: arrowRenderer, arrowGroup } = initAxesScene(arrowSize);

    // Append Arrow Canvas to the Wrapper Div
    if (mountRef.current) {
      mountRef.current.appendChild(arrowRenderer.domElement);
    }

    // Style the Arrow Canvas (Bottom-Left of Wrapper)
    arrowRenderer.domElement.style.position = "absolute";
    arrowRenderer.domElement.style.bottom = "10px";
    arrowRenderer.domElement.style.left = "10px";
    arrowRenderer.domElement.style.zIndex = "10";
    arrowRenderer.domElement.style.pointerEvents = "none"; // Allow clicks to pass through

    // --- Local Keyboard Controls ---
    let currentSlice = null;
    const digitMapping = { "1": "1", "!": "1", "2": "2", "@": "2", "3": "3", "#": "3", "4": "4", "$": "4", "5": "5", "%": "5", "6": "6", "^": "6", "7": "7", "&": "7", "8": "8", "*": "8", "9": "9", "(": "9" };

    const handleKeyDown = (e) => {
      if (digitMapping[e.key]) {
        currentSlice = parseInt(digitMapping[e.key]) - 1;
        return;
      }
      if ("udlrfb".includes(e.key.toLowerCase())) {
        const face = e.key.toUpperCase();
        const sliceIndex = currentSlice !== null ? currentSlice : 0;
        const clockwise = !e.shiftKey;
        // Local moves trigger default duration
        rotateFace(face, sliceIndex, cubesRef.current, cubeScene, outerPos, spacing, tolerance, getCubesForSlice, isRotating, clockwise);
        currentSlice = null;
      }
    };

    if (!disableKeyboard) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // --- Animation Loop ---
    const animate = (t) => {
      requestAnimationFrame(animate);
      TWEEN.update(t);
      controls.update();
      // Sync Arrow Orientation with Main Camera
      arrowGroup.quaternion.copy(cubeCamera.quaternion).invert();

      cubeRenderer.render(cubeScene, cubeCamera);
      arrowRenderer.render(arrowScene, arrowCamera);
    };
    const animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      cleanupScene();
      cubeRenderer.dispose();
      arrowRenderer.dispose();
      // Manually remove arrow canvas
      if (arrowRenderer.domElement.parentElement) {
        arrowRenderer.domElement.remove();
      }
    };
  }, [cubeSize, canvasId]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'relative', // Establishes context for absolute children
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