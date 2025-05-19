// Cube.js
import { useEffect, useRef } from "react";
import { initScene } from "./Scene";
import * as TWEEN from "@tweenjs/tween.js";
import { vertexShader } from "./Shaders/vertex";
import { fragmentShader } from "./Shaders/fragment";
import { createRubiksCube, getCubesForSlice } from "./cubeUtil";
import { rotateFace } from "./Rotation/rotate";


const Cube = ({ cubeSize = 12}) => {
  // cubeSize controls the number of layers per dimension.
  const cubesRef = useRef([]);
  const isRotating = useRef(false);

  useEffect(() => {
    const spacing = 1.001;
    const centerIndex = (cubeSize - 1) / 2;
    const outerPos = centerIndex * spacing;
    const tolerance = spacing / 1000;

    // Initialize scene, camera, renderer.
    const { scene, camera, renderer } = initScene("myThreeJsCanvas");

    // Create cubelets.
    const cubes = createRubiksCube(
      cubeSize,
      centerIndex,
      spacing,
      outerPos,
      tolerance,
      {
        "W": 0xffffff,
        "R": 0xff0000,
        "Y": 0xffff00,
        "O": 0xffa500,
        "G": 0x00ff00,
        "B": 0x0000ff,
      },
      vertexShader,
      fragmentShader,
    );
    cubes.forEach((cube) => scene.add(cube));
    cubesRef.current = cubes;

    // Temporary variable to hold the chosen slice index.
    let currentSlice = null;

    // Mapping to convert shifted symbols to digits.
    const digitMapping = {
      "1": "1",
      "!": "1",
      "2": "2",
      "@": "2",
      "3": "3",
      "#": "3",
      "4": "4",
      "$": "4",
      "5": "5",
      "%": "5",
      "6": "6",
      "^": "6",
      "7": "7",
      "&": "7",
      "8": "8",
      "*": "8",
      "9": "9",
      "(": "9",
    };

    // Keydown listener:
    // - If a number key is pressed (with or without shift), store that as the slice index.
    // - If a face key (u, d, l, r, f, b) is pressed, rotate that face's specified slice.
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Check if the key is a digit or its shifted symbol.
      if (digitMapping[e.key]) {
        // Convert the mapped digit to a 0-based slice index.
        currentSlice = parseInt(digitMapping[e.key], 10) - 1;
        return;
      }

      // Check if the key is one of our face letters.
      if ("udlrfb".includes(key)) {
        const face = key.toUpperCase();
        // Use the stored slice index if available, otherwise default to 0 (outer slice).
        const sliceIndex = currentSlice !== null ? currentSlice : 0;
        // If the face key is pressed with Shift, rotate anticlockwise; otherwise, clockwise.
        const clockwise = !e.shiftKey;

        rotateFace(
          face,
          sliceIndex,
          cubesRef.current,
          scene,
          outerPos,
          spacing,
          tolerance,
          getCubesForSlice,
          isRotating,
          clockwise
        );
        // Clear the stored slice after processing.
        currentSlice = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Render loop.
    const animate = (t) => {
      TWEEN.update(t);
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      renderer.dispose();
    };
  }, [cubeSize]);

  return <canvas id="myThreeJsCanvas" className="myThreeJsCanvas" />;
};

export default Cube;
