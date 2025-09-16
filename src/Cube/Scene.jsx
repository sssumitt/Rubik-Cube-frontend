// src/components/Cube/Scene.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initScene(canvasId) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    15,
    window.innerWidth / window.innerHeight,
    10,
    10000
  );

  camera.position.z = 45;
  const ambientLight = new THREE.AmbientLight(0xffffff, 5);
  scene.add(ambientLight);

  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);
  // Improvement: Enable damping for smoother camera movement
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Handle window resizing
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', handleResize);

  // Return a cleanup function for the event listener
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
  };

  return { scene, camera, renderer, controls, cleanup };
}