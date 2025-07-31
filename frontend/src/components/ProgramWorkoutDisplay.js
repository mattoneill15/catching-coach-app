import React, { useState } from 'react';
import './WorkoutDisplay.css';

const ProgramWorkoutDisplay = ({ 
  workout, 
  workoutType,
  selectedProgram,
  onStart, 
  onBackToDashboard 
}) => {
  const [expandedDrill, setExpandedDrill] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // Handle drill expansion
  const toggleDrill = (drillIndex) => {
    setExpandedDrill(expandedDrill === drillIndex ? null : drillIndex);
  };

  // Handle start workout
  const handleStartWorkout = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart(workout);
    }, 1000);
  };

  // Parse equipment list from drill equipment strings
  const getAllEquipment = () => {
    const equipmentSet = new Set();
    workout.exercises?.forEach(exercise => {
      if (exercise.equipment) {
        // Split equipment string and clean up
        const items = exercise.equipment.split(',').map(item => item.trim());
        items.forEach(item => equipmentSet.add(item));
      }
    });
    return Array.from(equipmentSet);
  };

  const equipmentList = getAllEquipment();

  return (
    <div className="workout-display">
      {/* Header Section */}
      <div className="workout-header">
        <div className="header-content">
          <div className="workout-title">
            <h1>{workout.sessionTitle || workout.title}</h1>
            <div className="workout-meta">
              <span className="duration">{workout.duration} minutes</span>
              <span className="program-name">{workout.programName}</span>
            </div>
          </div>
          
          <button 
            className="back-button"
            onClick={onBackToDashboard}
            disabled={isStarting}
          >
            ← Back
          </button>
        </div>

        {/* Learning Objectives */}
        {workout.learningObjectives && (
          <div className="learning-objectives">
            <div className="objectives-header">
              <span className="objectives-icon">🎯</span>
              <span className="objectives-title">Learning Objectives</span>
            </div>
            <div className="objectives-content">
              <p>{workout.learningObjectives}</p>
            </div>
          </div>
        )}
      </div>

      {/* Drills Section */}
      <div className="drills-section">
        <h2>Today's Drills</h2>
        <div className="drills-list">
          {workout.exercises?.map((drill, index) => (
            <div 
              key={index}
              className={`drill-card ${expandedDrill === index ? 'expanded' : ''}`}
            >
              <div 
                className="drill-header"
                onClick={() => toggleDrill(index)}
              >
                <div className="drill-info">
                  <h3 className="drill-name">{drill.name}</h3>
                  <div className="drill-meta">
                    <span className="drill-duration">⏱️ {drill.duration} min</span>
                    {drill.repetitions && (
                      <span className="drill-reps">🔄 {drill.repetitions}</span>
                    )}
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedDrill === index ? '−' : '+'}
                </div>
              </div>

              {expandedDrill === index && (
                <div className="drill-details">
                  {/* Equipment */}
                  {drill.equipment && (
                    <div className="drill-equipment">
                      <h4>🎯 Equipment Needed:</h4>
                      <p>{drill.equipment}</p>
                    </div>
                  )}

                  {/* Instructions */}
                  {drill.instructions && (
                    <div className="drill-instructions">
                      <h4>📋 Instructions:</h4>
                      <p>{drill.instructions}</p>
                    </div>
                  )}

                  {/* Coaching Points */}
                  {drill.coachingPoints && (
                    <div className="drill-coaching">
                      <h4>💡 Coaching Points:</h4>
                      <p>{drill.coachingPoints}</p>
                    </div>
                  )}

                  {/* Scenarios (if applicable) */}
                  {drill.scenarios && drill.scenarios.length > 0 && (
                    <div className="drill-scenarios">
                      <h4>🎲 Practice Scenarios:</h4>
                      <ul>
                        {drill.scenarios.map((scenario, idx) => (
                          <li key={idx}>{scenario}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Summary */}
      {equipmentList.length > 0 && (
        <div className="equipment-summary">
          <h3>📦 Equipment for Today</h3>
          <div className="equipment-list">
            {equipmentList.map((equipment, index) => (
              <div key={index} className="equipment-item">
                <span className="equipment-name">{equipment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="workout-actions">
        <button 
          className="start-workout-btn"
          onClick={handleStartWorkout}
          disabled={isStarting}
        >
          {isStarting ? (
            <div className="starting-content">
              <div className="spinner"></div>
              <span>Starting Session...</span>
            </div>
          ) : (
            <span>▶ Start Training Session</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProgramWorkoutDisplay;
