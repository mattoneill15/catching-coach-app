import React from 'react';
import './ProgramCompletionScreen.css';

const ProgramCompletionScreen = ({ onViewProgress }) => {
  return (
    <div className="program-completion-screen">
      <div className="program-completion-content">
        <div className="completion-icon">
          <span className="celebration-emoji">🏆</span>
        </div>
        
        <h1 className="completion-title">Program Complete!</h1>
        <p className="completion-message">
          Congratulations! You've successfully completed your entire training program. 
          Your dedication and hard work have paid off!
        </p>
        
        <div className="achievement-stats">
          <div className="achievement-item">
            <span className="achievement-icon">✅</span>
            <span className="achievement-label">Program Finished</span>
          </div>
          <div className="achievement-item">
            <span className="achievement-icon">📊</span>
            <span className="achievement-label">Skills Improved</span>
          </div>
          <div className="achievement-item">
            <span className="achievement-icon">🎯</span>
            <span className="achievement-label">Goals Achieved</span>
          </div>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <p>Check out your progress dashboard to see how much you've improved, or start a new program to continue your development.</p>
        </div>
        
        <button 
          className="btn-primary progress-btn"
          onClick={onViewProgress}
        >
          View My Progress
        </button>
      </div>
    </div>
  );
};

export default ProgramCompletionScreen;
