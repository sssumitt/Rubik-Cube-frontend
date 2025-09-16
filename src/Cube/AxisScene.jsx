// src/components/Cube/AxisScene.js

import * as THREE from "three";

export default function initAxesScene(size = 150) {
  const scene = new THREE.Scene();

  // An OrthographicCamera is better for a non-distorted HUD
  const frustumSize = 2.5;
  const camera = new THREE.OrthographicCamera(
    frustumSize / -2,
    frustumSize / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    100
  );

  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  // This group will hold the arrows and be rotated
  const arrowGroup = new THREE.Group();
  scene.add(arrowGroup);

  const axisLength = 0.5;
  const arrowOrigin = new THREE.Vector3(0, 0, 0);

  const axesInfo = [
    { dir: new THREE.Vector3(1, 0, 0), color: 0xe11d48 },   // +X Right (Red/Rose)
    { dir: new THREE.Vector3(-1, 0, 0), color: 0xff8c00 },  // -X Left (Orange)
    { dir: new THREE.Vector3(0, 1, 0), color: 0xf1f5f9 },   // +Y Up (White/Light)
    { dir: new THREE.Vector3(0, -1, 0), color: 0xffff00 },  // -Y Down (Yellow)
    { dir: new THREE.Vector3(0, 0, 1), color: 0x00ff00 },   // +Z Front (Green)
    { dir: new THREE.Vector3(0, 0, -1), color: 0x0000ff },  // -Z Back (Blue)
  ];

  axesInfo.forEach((axis) => {
    const arrowHelper = new THREE.ArrowHelper(
      axis.dir,
      arrowOrigin,
      axisLength,
      axis.color,
      0.25, // Head length
      0.15  // Head width
    );
    arrowGroup.add(arrowHelper);
  });


  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.pointerEvents = "none"; // Clicks pass through
  renderer.domElement.style.zIndex = "1";

  return { scene, camera, renderer, arrowGroup };
}