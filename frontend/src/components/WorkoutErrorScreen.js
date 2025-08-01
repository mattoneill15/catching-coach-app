import React from 'react';
import './WorkoutErrorScreen.css';

const WorkoutErrorScreen = ({ onRetry }) => {
  return (
    <div className="workout-error-screen">
      <div className="error-content">
        <div className="error-icon">
          <span className="error-emoji">⚠️</span>
        </div>
        
        <h1 className="error-title">Workout Save Failed</h1>
        <p className="error-message">
          We encountered an issue saving your workout completion. Don't worry - your progress was still recorded locally.
        </p>
        
        <div className="error-details">
          <p>This can happen due to:</p>
          <ul>
            <li>Network connectivity issues</li>
            <li>Server maintenance</li>
            <li>Temporary system overload</li>
          </ul>
        </div>
        
        <button 
          className="btn-primary retry-btn"
          onClick={onRetry}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WorkoutErrorScreen;
