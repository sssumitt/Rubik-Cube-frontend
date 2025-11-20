// src/components/Cube/Scene.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  
  if (!canvas) {
    console.error(`Canvas with id ${canvasId} not found`);
    return {};
  }

  // FIX 1: Get dimensions from the parent container, NOT the window
  const container = canvas.parentElement;
  const width = container ? container.clientWidth : window.innerWidth;
  const height = container ? container.clientHeight : window.innerHeight;

  const scene = new THREE.Scene();

  // FIX 2: Use container dimensions for Aspect Ratio
  const camera = new THREE.PerspectiveCamera(
    15,
    width / height,
    10,
    10000
  );

  camera.position.z = 45;
  const ambientLight = new THREE.AmbientLight(0xffffff, 5);
  scene.add(ambientLight);

  // FIX 3: Enable alpha (optional, but helps with background blending)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
    // alpha: true 
  });

  // FIX 4: Set initial size to container size
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Sharpness fix

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // NOTE: We REMOVED the window.addEventListener('resize') here.
  // Your React components (CubeWithArrow/OpponentCube) now handle resizing 
  // via the ResizeObserver you added previously. This prevents conflicts.

  const cleanup = () => {
    controls.dispose();
    // No event listener to remove since we delegated that to the React component
  };

  return { scene, camera, renderer, controls, cleanup };
}