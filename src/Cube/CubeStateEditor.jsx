import axios from "axios";
import React, { useState } from "react";

// Map single-letter codes to actual CSS colors.
const letterToColor = {
  W: "white",
  R: "red",
  G: "green",
  Y: "yellow",
  O: "orange",
  B: "blue",
};

// The standard face names in the net order we want: U, R, F, D, L, B
const faceNames = ["U", "R", "F", "D", "L", "B"];

// Example initial faces: each face is 9 squares of a single color for demonstration.
const initialCubeFaces = {
  U: Array(9).fill("W"),
  R: Array(9).fill("R"),
  F: Array(9).fill("G"),
  D: Array(9).fill("Y"),
  L: Array(9).fill("O"),
  B: Array(9).fill("B"),
};

// The letters you allow for facelets (the palette).
const allowedLetters = ["W", "R", "G", "Y", "O", "B"];

export default function CubeNetEditor() {
  // State to hold face data: each face has an array of 9 letter codes.
  const [cubeFaces, setCubeFaces] = useState(initialCubeFaces);
  // Currently selected color letter from the palette.
  const [selectedLetter, setSelectedLetter] = useState("W");
  // Output from the backend (e.g., the cube solution).
  const [output, setOutput] = useState("");

  // Update a single square in a face.
  const handleSquareClick = (face, index) => {
    setCubeFaces((prev) => ({
      ...prev,
      [face]: prev[face].map((letter, i) =>
        i === index ? selectedLetter : letter
      ),
    }));
  };

  // Log the current cube state as a single 54-character string (U,R,F,D,L,B order).
  const logCubeState = () => {
    let cubeStateStr = "";
    faceNames.forEach((face) => {
      cubeStateStr += cubeFaces[face].join("");
    });

    axios
      .post(`http://localhost:5050/solve?state=${cubeStateStr}`)
      .then((response) => {
        // Set the output state to the response data.
        setOutput(response.data);
        console.log("response", response.data);
      })
      .catch((error) => {
        console.error("Error sending cube state:", error);
      });
  };

  // Test function to check connection to backend.
  const testConnection = () => {
    console.log("Testing connection to backend...");
    fetch("http://localhost:5050/test")
      .then((response) => response.text())
      .then((data) => {
        console.log("Connection successful:", data);
      })
      .catch((error) => {
        console.error("Connection test failed:", error);
      });
  };

  return (
    <div className="container cube-editor">
      {/* <h2 className="hero__subtitle">3X3 Solver</h2>
      <p className="info-text">
        Select a color, then click on any square in the net to color it.
      </p> */}

      {/* Container for the net (3 rows x 4 columns) */}
      <div className="container cube-net">
        {/* U face => row 1, col 2 */}
        <div className="face face-U">
          {renderFace("U", cubeFaces.U, handleSquareClick)}
        </div>

        {/* L face => row 2, col 1 */}
        <div className="face face-L">
          {renderFace("L", cubeFaces.L, handleSquareClick)}
        </div>

        {/* F face => row 2, col 2 */}
        <div className="face face-F">
          {renderFace("F", cubeFaces.F, handleSquareClick)}
        </div>

        {/* R face => row 2, col 3 */}
        <div className="face face-R">
          {renderFace("R", cubeFaces.R, handleSquareClick)}
        </div>

        {/* B face => row 2, col 4 */}
        <div className="face face-B">
          {renderFace("B", cubeFaces.B, handleSquareClick)}
        </div>

        {/* D face => row 3, col 2 */}
        <div className="face face-D">
          {renderFace("D", cubeFaces.D, handleSquareClick)}
        </div>

        {/* Color palette */}
        <div className="color-palette">
          {allowedLetters.map((letter) => (
            <div
              key={letter}
              className={
                letter === selectedLetter
                  ? "color-swatch selected"
                  : "color-swatch"
              }
              style={{
                backgroundColor: letterToColor[letter],
              }}
              onClick={() => setSelectedLetter(letter)}
            />
          ))}
        </div>
      </div>

      <button className="btn" onClick={logCubeState}>
        Log Cube State
      </button>

      <div className="hero container">


      <div className="hero__title">
     Solution:
   </div>
      <div className="hero__subtitle"> {output}</div>
     
    </div>
      </div>
    
  );
}

/**
 * Renders a 3x3 face grid for a single face.
 * @param {string} face - Face name (U, R, F, D, L, B)
 * @param {string[]} letters - Array of 9 letter codes
 * @param {function} onClick - Callback to handle square click
 */
function renderFace(face, letters, onClick) {
  return (
    <div className="face-grid">
      {letters.map((letter, i) => (
        <div
          key={i}
          className="face-square"
          style={{
            backgroundColor: letterToColor[letter],
          }}
          onClick={() => onClick(face, i)}
        />
      ))}
    </div>
  );
}
