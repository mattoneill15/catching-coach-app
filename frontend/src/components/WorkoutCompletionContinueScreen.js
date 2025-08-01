import React from 'react';
import './WorkoutCompletionContinueScreen.css';

const WorkoutCompletionContinueScreen = ({ nextWorkout, onContinueProgram, onReturnHome }) => {
  return (
    <div className="workout-completion-continue-screen">
      <div className="completion-continue-content">
        <div className="completion-icon">
          <span className="success-emoji">🎉</span>
        </div>
        
        <h1 className="completion-title">Workout Complete!</h1>
        <p className="completion-message">
          Great job! You've completed another session in your training program.
        </p>
        
        <div className="program-progress">
          <div className="progress-info">
            <h3>Program Progress</h3>
            <p>Your next workout is ready to go!</p>
          </div>
          
          {nextWorkout && (
            <div className="next-workout-preview">
              <h4>Next Session: {nextWorkout.program_info?.session_title || `Session ${nextWorkout.program_info?.session_number}`}</h4>
              <div className="workout-details">
                <span className="workout-duration">
                  ⏱️ {nextWorkout.duration || nextWorkout.totalDuration || 30} minutes
                </span>
                <span className="workout-focus">
                  🎯 {nextWorkout.focus_area || 'Skill Development'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-primary continue-btn"
            onClick={onContinueProgram}
          >
            Continue Program
          </button>
          <button 
            className="btn-secondary home-btn"
            onClick={onReturnHome}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCompletionContinueScreen;
