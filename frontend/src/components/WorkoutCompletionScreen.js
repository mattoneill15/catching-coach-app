import React from 'react';
import './WorkoutCompletionScreen.css';

const WorkoutCompletionScreen = ({ onContinue }) => {
  return (
    <div className="workout-completion-screen">
      <div className="completion-content">
        <div className="completion-icon">
          <span className="success-emoji">🎉</span>
        </div>
        
        <h1 className="completion-title">Workout Complete!</h1>
        <p className="completion-message">
          Great job finishing your training session. Your progress has been saved and your stats have been updated.
        </p>
        
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Session Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <span className="stat-label">Progress Updated</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <span className="stat-label">Skills Practiced</span>
          </div>
        </div>
        
        <button 
          className="btn-primary completion-btn"
          onClick={onContinue}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WorkoutCompletionScreen;
