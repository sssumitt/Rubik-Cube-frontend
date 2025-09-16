// src/components/Cube/CubeWithArrow.jsx

import { useEffect, useRef } from "react";
import { initScene } from "./Scene";
import initAxesScene from "./AxisScene"; // Corrected import name
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";

const CubeWithArrow = ({ cubeSize = 12 }) => {
  const cubesRef = useRef([]);
  const isRotating = useRef(false);

  useEffect(() => {
    const spacing = 1.001;
    const centerIndex = (cubeSize - 1) / 2;
    const outerPos = centerIndex * spacing;
    const tolerance = spacing / 1000;

    // --- Main Cube Scene ---
    const { scene: cubeScene, camera: cubeCamera, renderer: cubeRenderer, controls, cleanup: cleanupScene } = initScene("cubeCanvas");

    // --- Cube Group ---
    const cubes = createRubiksCube(
      cubeSize, centerIndex, spacing, outerPos, tolerance,
      { W: 0xffffff, R: 0xff0000, Y: 0xffff00, O: 0xffa500, G: 0x00ff00, B: 0x0000ff },
      vertexShader, fragmentShader
    );
    const cubeGroup = new THREE.Group();
    cubes.forEach(cube => cubeGroup.add(cube));
    cubeScene.add(cubeGroup);
    cubesRef.current = cubes;

    // --- Arrow HUD Scene ---
    const arrowSize = 150;
    const { scene: arrowScene, camera: arrowCamera, renderer: arrowRenderer, arrowGroup } = initAxesScene(arrowSize);
    document.body.appendChild(arrowRenderer.domElement);

    // Position the HUD in the bottom-left corner
    arrowRenderer.domElement.style.bottom = "10px";
    arrowRenderer.domElement.style.left = "10px";

    // --- Keyboard Controls ---
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

    // --- Animation Loop ---
    const animate = (t) => {
      requestAnimationFrame(animate);
      TWEEN.update(t);

      // Required for OrbitControls damping
      controls.update();

      // Sync Arrow HUD to Cube Canvas Camera's rotation
      // Corrected code
      arrowGroup.quaternion.copy(cubeCamera.quaternion).invert();

      // Render both scenes
      cubeRenderer.render(cubeScene, cubeCamera);
      arrowRenderer.render(arrowScene, arrowCamera);
    };
    animate();

    // --- Cleanup on component unmount ---
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cleanupScene(); // Cleans up the resize listener from initScene
      cubeRenderer.dispose();
      arrowRenderer.dispose();
      // Safely remove the HUD element
      if (arrowRenderer.domElement.parentElement) {
        arrowRenderer.domElement.remove();
      }
    };
  }, [cubeSize]);

  // The canvas for the main scene
  return <canvas id="cubeCanvas" style={{ width: "100%", height: "100%" }} />;
};

export default CubeWithArrow;