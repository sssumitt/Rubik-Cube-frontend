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

    // --- Interaction Logic (Drag to Rotate) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let startMouse = new THREE.Vector2();
    let intersectedObject = null;
    let intersectedFaceIndex = -1;
    let startPoint = new THREE.Vector3();

    const getIntersects = (event, objects) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cubeCamera);
      return raycaster.intersectObjects(objects);
    };

    const onMouseDown = (event) => {
      if (!mountRef.current) return;
      const intersects = getIntersects(event, cubesRef.current);
      if (intersects.length > 0) {
        controls.enabled = false;
        isDragging = true;
        startMouse.set(event.clientX, event.clientY);
        intersectedObject = intersects[0].object;
        intersectedFaceIndex = intersects[0].face.materialIndex;
        startPoint.copy(intersects[0].point);
      } else {
        controls.enabled = true;
        isDragging = false;
        intersectedObject = null;
      }
    };

    const onMouseUp = (event) => {
      if (isDragging && intersectedObject) {
        const rect = mountRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Calculate 3D drag vector on the face plane
        raycaster.setFromCamera(mouse, cubeCamera);
        const normals = [
          new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
        ];
        const faceNormal = normals[intersectedFaceIndex].clone().applyQuaternion(intersectedObject.quaternion);

        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(faceNormal, startPoint);
        const endPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, endPoint);

        if (endPoint) {
          const dragVector = new THREE.Vector3().subVectors(endPoint, startPoint);
          const dist = dragVector.length();

          // Threshold for drag (0.1 in world units)
          if (dist >= 0.2) {
            handleDragRotate(intersectedObject, intersectedFaceIndex, dragVector, faceNormal);
          }
        }
      }
      isDragging = false;
      controls.enabled = true;
      intersectedObject = null;
    };

    const handleDragRotate = (object, faceIndex, dragVector, faceNormal) => {
      if (isRotating.current) return;

      // Determine dominant axis of the drag on the face
      const worldX = new THREE.Vector3(1, 0, 0);
      const worldY = new THREE.Vector3(0, 1, 0);
      const worldZ = new THREE.Vector3(0, 0, 1);

      let uAxis, vAxis;

      const nx = Math.abs(faceNormal.x);
      const ny = Math.abs(faceNormal.y);
      const nz = Math.abs(faceNormal.z);

      let faceName = '';

      if (nx > ny && nx > nz) {
        faceName = faceNormal.x > 0 ? 'R' : 'L';
        uAxis = worldZ;
        vAxis = worldY;
      } else if (ny > nx && ny > nz) {
        faceName = faceNormal.y > 0 ? 'U' : 'D';
        uAxis = worldX;
        vAxis = worldZ;
      } else {
        faceName = faceNormal.z > 0 ? 'F' : 'B';
        uAxis = worldX;
        vAxis = worldY;
      }

      // Calculate generalized slice index
      // const spacing = 1.001; // Defined above

      // Helper to get slice index from position for a given face
      // Based on getTargetCoordinate in cubeUtil.js
      const getSliceIndex = (face, positionVector) => {
        let val;
        switch (face) {
          case 'U': val = positionVector.y; break;
          case 'D': val = positionVector.y; break;
          case 'R': val = positionVector.x; break;
          case 'L': val = positionVector.x; break;
          case 'F': val = positionVector.z; break;
          case 'B': val = positionVector.z; break;
          default: return 0;
        }

        // Normalize value by spacing
        const normalizedVal = val / spacing;

        // Calculate slice index
        // For U, R, F (Positive faces): sliceIndex = centerIndex - normalizedVal
        // For D, L, B (Negative faces): sliceIndex = normalizedVal + centerIndex
        // Note: This assumes slice 0 is the OUTERMOST layer for that face.

        let idx;
        if (['U', 'R', 'F'].includes(face)) {
          idx = Math.round(centerIndex - normalizedVal);
        } else {
          idx = Math.round(normalizedVal + centerIndex);
        }

        // Clamp to valid range [0, cubeSize - 1]
        return Math.max(0, Math.min(cubeSize - 1, idx));
      };

      const uProj = dragVector.dot(uAxis);
      const vProj = dragVector.dot(vAxis);

      let moveFace = '';
      let moveClockwise = true;
      let sliceIndex = 0;
      const pos = object.position;

      if (Math.abs(uProj) > Math.abs(vProj)) {
        // Moving along uAxis
        if (faceName === 'F') {
          moveFace = 'U';
          moveClockwise = uProj < 0;
          sliceIndex = getSliceIndex('U', pos);
        }
        else if (faceName === 'B') {
          moveFace = 'U';
          moveClockwise = uProj > 0;
          sliceIndex = getSliceIndex('U', pos);
        }
        else if (faceName === 'R') {
          moveFace = 'U';
          moveClockwise = uProj > 0;
          sliceIndex = getSliceIndex('U', pos);
        }
        else if (faceName === 'L') {
          moveFace = 'U';
          moveClockwise = uProj < 0;
          sliceIndex = getSliceIndex('U', pos);
        }
        else if (faceName === 'U') {
          moveFace = 'F';
          moveClockwise = uProj > 0;
          sliceIndex = getSliceIndex('F', pos);
        }
        else if (faceName === 'D') {
          moveFace = 'F';
          moveClockwise = uProj > 0;
          sliceIndex = getSliceIndex('F', pos);
        }
      } else {
        // Moving along vAxis
        if (faceName === 'F') {
          moveFace = 'R';
          moveClockwise = vProj > 0;
          sliceIndex = getSliceIndex('R', pos);
        }
        else if (faceName === 'B') {
          moveFace = 'R';
          moveClockwise = vProj < 0;
          sliceIndex = getSliceIndex('R', pos);
        }
        else if (faceName === 'R') {
          moveFace = 'F';
          moveClockwise = vProj < 0;
          sliceIndex = getSliceIndex('F', pos);
        }
        else if (faceName === 'L') {
          moveFace = 'F';
          moveClockwise = vProj > 0;
          sliceIndex = getSliceIndex('F', pos);
        }
        else if (faceName === 'U') {
          moveFace = 'R';
          moveClockwise = vProj < 0;
          sliceIndex = getSliceIndex('R', pos);
        }
        else if (faceName === 'D') {
          moveFace = 'R';
          moveClockwise = vProj > 0;
          sliceIndex = getSliceIndex('R', pos);
        }
      }

      if (moveFace && !isRotating.current) {
        rotateFace(
          moveFace,
          sliceIndex,
          cubesRef.current,
          cubeScene,
          outerPos,
          spacing,
          tolerance,
          getCubesForSlice,
          isRotating,
          moveClockwise,
          300
        );
      }
    };

    const canvas = cubeRenderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

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
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
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