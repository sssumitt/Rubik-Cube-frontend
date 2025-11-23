import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { initScene } from "./Scene";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";

const Cube3DEditor = forwardRef(({ cubeSize = 3, selectedColor, isPaintMode, onCubeReady }, ref) => {
    const mountRef = useRef(null);
    const cubesRef = useRef([]);
    const sceneRef = useRef(null);
    const isRotating = useRef(false);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const selectedColorRef = useRef(selectedColor);
    const isPaintModeRef = useRef(isPaintMode);

    // Update refs when props change
    useEffect(() => {
        selectedColorRef.current = selectedColor;
    }, [selectedColor]);

    useEffect(() => {
        isPaintModeRef.current = isPaintMode;
    }, [isPaintMode]);

    // Color mapping for uniforms
    const colorMap = {
        W: 0xffffff,
        R: 0xff0000,
        Y: 0xffff00,
        O: 0xffa500,
        G: 0x00ff00,
        B: 0x0000ff,
    };

    // Helper to get logical state string
    const getCubeState = () => {
        const spacing = 1.001;
        const centerIndex = (cubeSize - 1) / 2;
        const outerPos = centerIndex * spacing;
        const tolerance = 0.1;

        const faces = [
            { name: "U", normal: new THREE.Vector3(0, 1, 0), origin: { y: outerPos } },
            { name: "R", normal: new THREE.Vector3(1, 0, 0), origin: { x: outerPos } },
            { name: "F", normal: new THREE.Vector3(0, 0, 1), origin: { z: outerPos } },
            { name: "D", normal: new THREE.Vector3(0, -1, 0), origin: { y: -outerPos } },
            { name: "L", normal: new THREE.Vector3(-1, 0, 0), origin: { x: -outerPos } },
            { name: "B", normal: new THREE.Vector3(0, 0, -1), origin: { z: -outerPos } },
        ];

        let stateString = "";

        // Iterate faces in U R F D L B order
        for (const face of faces) {
            // Define grid for this face
            let uAxis, vAxis;
            if (face.name === "U") { uAxis = new THREE.Vector3(1, 0, 0); vAxis = new THREE.Vector3(0, 0, 1); }
            else if (face.name === "D") { uAxis = new THREE.Vector3(1, 0, 0); vAxis = new THREE.Vector3(0, 0, -1); }
            else if (face.name === "L") { uAxis = new THREE.Vector3(0, 0, 1); vAxis = new THREE.Vector3(0, -1, 0); }
            else if (face.name === "R") { uAxis = new THREE.Vector3(0, 0, -1); vAxis = new THREE.Vector3(0, -1, 0); }
            else if (face.name === "F") { uAxis = new THREE.Vector3(1, 0, 0); vAxis = new THREE.Vector3(0, -1, 0); }
            else if (face.name === "B") { uAxis = new THREE.Vector3(-1, 0, 0); vAxis = new THREE.Vector3(0, -1, 0); }

            for (let row = 0; row < cubeSize; row++) {
                for (let col = 0; col < cubeSize; col++) {
                    const u = (col - 1) * spacing;
                    const v = (row - 1) * spacing;

                    const targetPos = new THREE.Vector3()
                        .copy(face.normal).multiplyScalar(outerPos) // Center of face
                        .add(uAxis.clone().multiplyScalar(u))
                        .add(vAxis.clone().multiplyScalar(v));

                    // Find cube closest to this position
                    let closestCube = null;
                    let minDist = Infinity;

                    for (const cube of cubesRef.current) {
                        const dist = cube.position.distanceTo(targetPos);
                        if (dist < minDist) {
                            minDist = dist;
                            closestCube = cube;
                        }
                    }

                    if (closestCube && minDist < tolerance) {
                        const localNormals = [
                            new THREE.Vector3(1, 0, 0),
                            new THREE.Vector3(-1, 0, 0),
                            new THREE.Vector3(0, 1, 0),
                            new THREE.Vector3(0, -1, 0),
                            new THREE.Vector3(0, 0, 1),
                            new THREE.Vector3(0, 0, -1),
                        ];

                        let foundColor = "X";

                        for (let i = 0; i < 6; i++) {
                            const worldNormal = localNormals[i].clone().applyQuaternion(closestCube.quaternion);
                            if (worldNormal.dot(face.normal) > 0.9) {
                                const colorHex = closestCube.material[i].uniforms.faceColor.value.getHex();
                                for (const [key, val] of Object.entries(colorMap)) {
                                    if (val === colorHex) {
                                        foundColor = key;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        stateString += foundColor;
                    } else {
                        stateString += "X";
                    }
                }
            }
        }
        return stateString;
    };

    useImperativeHandle(ref, () => ({
        performMove: (move) => {
            const { face, sliceIndex, clockwise, duration } = move;
            const spacing = 1.001;
            const centerIndex = (cubeSize - 1) / 2;
            const outerPos = centerIndex * spacing;
            const tolerance = spacing / 1000;

            if (sceneRef.current) {
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
                    duration
                );
            }
            return Promise.resolve();
        },
        getCubeState,
        resetCube: () => {
            const spacing = 1.001;
            const centerIndex = (cubeSize - 1) / 2;
            const outerPos = centerIndex * spacing;
            const tolerance = spacing / 1000;

            cubesRef.current.forEach(c => sceneRef.current.remove(c));

            const cubes = createRubiksCube(
                cubeSize, centerIndex, spacing, outerPos, tolerance,
                colorMap, vertexShader, fragmentShader
            );
            const cubeGroup = new THREE.Group();
            cubes.forEach(cube => cubeGroup.add(cube));
            sceneRef.current.add(cubeGroup);
            cubesRef.current = cubes;
        }
    }));

    useEffect(() => {
        const spacing = 1.001;
        const centerIndex = (cubeSize - 1) / 2;
        const outerPos = centerIndex * spacing;
        const tolerance = spacing / 1000;

        const { scene, camera, renderer, controls, cleanup } = initScene("cube-3d-editor-canvas");
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;

        const handleResize = () => {
            const container = mountRef.current;
            if (container && camera && renderer) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };
        const resizeObserver = new ResizeObserver(() => handleResize());
        if (mountRef.current) resizeObserver.observe(mountRef.current);

        const cubes = createRubiksCube(
            cubeSize, centerIndex, spacing, outerPos, tolerance,
            colorMap, vertexShader, fragmentShader
        );
        const cubeGroup = new THREE.Group();
        cubes.forEach(cube => cubeGroup.add(cube));
        scene.add(cubeGroup);
        cubesRef.current = cubes;

        // --- Interaction Logic ---
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
            raycaster.setFromCamera(mouse, camera);
            return raycaster.intersectObjects(objects);
        };

        const onMouseDown = (event) => {
            if (!mountRef.current) return;

            const intersects = getIntersects(event, cubesRef.current);

            if (intersects.length > 0) {
                // Clicked on cube -> Prepare for potential drag or paint
                controls.enabled = false; // Disable orbit controls
                isDragging = true;
                startMouse.set(event.clientX, event.clientY);
                intersectedObject = intersects[0].object;
                intersectedFaceIndex = intersects[0].face.materialIndex;
                startPoint.copy(intersects[0].point);
            } else {
                // Clicked on background -> Orbit
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
                raycaster.setFromCamera(mouse, camera);
                const normal = intersectedObject.getWorldDirection(new THREE.Vector3()); // This gives Z axis of object? No.
                // We need the normal of the clicked face.
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

                    // Threshold for drag vs click (0.1 in world units is reasonable for spacing 1.0)
                    if (dist < 0.2) {
                        // It was a click -> Paint ONLY if paint mode is on
                        if (isPaintModeRef.current) {
                            const currentColor = selectedColorRef.current;
                            if (currentColor && intersectedObject.material[intersectedFaceIndex]) {
                                const newColorHex = colorMap[currentColor];
                                intersectedObject.material[intersectedFaceIndex].uniforms.faceColor.value.setHex(newColorHex);
                            }
                        }
                    } else {
                        // It was a drag
                        handleDragRotate(intersectedObject, intersectedFaceIndex, dragVector, faceNormal);
                    }
                }
            }

            isDragging = false;
            controls.enabled = true; // Re-enable orbit
            intersectedObject = null;
        };

        const handleDragRotate = (object, faceIndex, dragVector, faceNormal) => {
            if (isRotating.current) return;

            // Determine dominant axis of the drag on the face
            // We need two orthogonal vectors on the face: uAxis and vAxis
            // Standard basis vectors
            const worldX = new THREE.Vector3(1, 0, 0);
            const worldY = new THREE.Vector3(0, 1, 0);
            const worldZ = new THREE.Vector3(0, 0, 1);

            let uAxis, vAxis;

            // Determine face orientation to pick basis vectors
            // We use dot products to find which world axis the normal is parallel to
            const nx = Math.abs(faceNormal.x);
            const ny = Math.abs(faceNormal.y);
            const nz = Math.abs(faceNormal.z);

            let faceName = '';

            if (nx > ny && nx > nz) {
                // Normal is along X (Right/Left)
                faceName = faceNormal.x > 0 ? 'R' : 'L';
                uAxis = worldZ; // Horizontal on R/L face is Z
                vAxis = worldY; // Vertical on R/L face is Y
            } else if (ny > nx && ny > nz) {
                // Normal is along Y (Up/Down)
                faceName = faceNormal.y > 0 ? 'U' : 'D';
                uAxis = worldX; // Horizontal on U/D face is X
                vAxis = worldZ; // Vertical on U/D face is Z
            } else {
                // Normal is along Z (Front/Back)
                faceName = faceNormal.z > 0 ? 'F' : 'B';
                uAxis = worldX; // Horizontal on F/B face is X
                vAxis = worldY; // Vertical on F/B face is Y
            }

            // Calculate generalized slice index
            const centerIndex = (cubeSize - 1) / 2;
            // const spacing = 1.001; // Defined above

            // Helper to get slice index from position for a given face
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

                const normalizedVal = val / spacing;
                let idx;
                if (['U', 'R', 'F'].includes(face)) {
                    idx = Math.round(centerIndex - normalizedVal);
                } else {
                    idx = Math.round(normalizedVal + centerIndex);
                }
                return Math.max(0, Math.min(cubeSize - 1, idx));
            };

            // Project drag vector onto basis vectors
            const uProj = dragVector.dot(uAxis);
            const vProj = dragVector.dot(vAxis);

            let moveFace = '';
            let moveClockwise = true;
            let sliceIndex = 0;
            const pos = object.position;

            // Determine move based on dominant axis
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
                    sceneRef.current,
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

        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp); // Listen on window to catch drag release outside

        const animate = (t) => {
            requestAnimationFrame(animate);
            TWEEN.update(t);
            controls.update();
            renderer.render(scene, camera);
        };
        const animationFrameId = requestAnimationFrame(animate);

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            cleanup();
            renderer.dispose();
        };
    }, [cubeSize]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}
        >
            <canvas id="cube-3d-editor-canvas" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
});

export default Cube3DEditor;
