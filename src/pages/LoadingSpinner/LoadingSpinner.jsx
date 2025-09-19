// components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // Don't forget to import the styles

function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
}

export default LoadingSpinner;