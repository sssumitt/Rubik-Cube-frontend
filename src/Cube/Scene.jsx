// initScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import Stats from 'three/examples/jsm/libs/stats.module';

export function initScene(canvasId) {

  const scene = new THREE.Scene();

  // Create the camera
  const camera = new THREE.PerspectiveCamera(
    15, // Field of view
    window.innerWidth / window.innerHeight*2, // Aspect ratio
    10, // Near plane
    10000 // Far plane
  );
  camera.position.z = 45;

  // const axesHelper = new THREE.AxesHelper(16);
  // scene.add(axesHelper);

  const ambientLight = new THREE.AmbientLight(0xffffff, 5);
  scene.add(ambientLight);


  const canvas = document.getElementById(canvasId);


  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.setSize(window.innerWidth , window.innerHeight/2);

  
  const controls = new OrbitControls(camera, renderer.domElement);

  // (Optional) Create a stats panel
  // const stats = Stats();
  // document.body.appendChild(stats.dom);


  window.addEventListener('resize', onWindowResize, false);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight*2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight/2);
  }

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    // stats.update();
    renderer.render(scene, camera);
  };

  animate();

  return { scene, camera, renderer, controls };
}
export function createCanvas() {

}
