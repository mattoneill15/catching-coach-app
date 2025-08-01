import React, { useState, useEffect, useRef } from 'react';
import './WorkoutExecution.css';

const ProgramWorkoutExecution = ({ workout, onWorkoutComplete, onWorkoutExit }) => {
  // State management for program workout execution
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [drillTimeRemaining, setDrillTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDrillInstructions, setShowDrillInstructions] = useState(true);
  const [completedDrills, setCompletedDrills] = useState(new Set());
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer refs for accurate timing
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Get current drill data
  const exercises = workout.exercises || [];
  const currentDrill = exercises[currentDrillIndex];
  const totalDrills = exercises.length;
  const totalWorkoutTime = workout.duration * 60; // Convert to seconds

  // Initialize drill timer when drill changes
  useEffect(() => {
    if (currentDrill) {
      // Parse duration from drill - handle both number and string formats
      let drillDuration = 300; // Default 5 minutes in seconds
      
      if (typeof currentDrill.duration === 'number') {
        // Duration is already a number (in minutes)
        drillDuration = currentDrill.duration * 60;
      } else if (typeof currentDrill.duration === 'string') {
        // Duration is a string like "10 min"
        const durationMatch = currentDrill.duration.match(/(\d+)/);
        drillDuration = durationMatch ? parseInt(durationMatch[1]) * 60 : 300;
      }
      
      setDrillTimeRemaining(drillDuration);
      setShowDrillInstructions(true);
    }
  }, [currentDrillIndex, currentDrill]);

  // Main timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTotalTimeElapsed(prev => prev + 1);
        setDrillTimeRemaining(prev => {
          if (prev <= 1) {
            handleDrillComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused]);

  // Start the workout
  const startWorkout = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  // Pause/Resume workout
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle drill completion
  const handleDrillComplete = () => {
    const drillKey = currentDrillIndex;
    setCompletedDrills(prev => new Set([...prev, drillKey]));
    
    // Move to next drill or finish workout
    if (currentDrillIndex < totalDrills - 1) {
      setCurrentDrillIndex(currentDrillIndex + 1);
      setShowDrillInstructions(true);
    } else {
      // Workout complete!
      handleWorkoutComplete();
    }
  };

  // Handle workout completion
  const handleWorkoutComplete = () => {
    setIsRunning(false);
    // Convert elapsed time from seconds to minutes for backend
    const durationMinutes = Math.round(totalTimeElapsed / 60);
    
    const workoutData = {
      workoutId: workout.id || 'program-workout',
      duration: durationMinutes, // Backend expects 'duration' in minutes
      totalDuration: totalTimeElapsed, // Keep for compatibility
      completedDrills: Array.from(completedDrills),
      drillsCompleted: Array.from(completedDrills), // Backend expects 'drillsCompleted'
      skillsFocused: [], // Add required field
      sessionNotes: sessionNotes,
      notes: sessionNotes, // Backend expects 'notes'
      completedAt: new Date().toISOString(),
      // Add program info if available
      sessionTitle: workout?.sessionTitle || workout?.programInfo?.session_title || 'Program Session',
      programName: workout?.programName || workout?.programInfo?.program_name || 'Program Workout'
    };
    
    console.log('🎯 ProgramWorkoutExecution completing with data:', workoutData);
    onWorkoutComplete(workoutData);
  };

  // Skip to next drill
  const skipDrill = () => {
    if (currentDrillIndex < totalDrills - 1) {
      setCurrentDrillIndex(currentDrillIndex + 1);
    } else {
      handleWorkoutComplete();
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Safety check
  if (!workout || !exercises.length) {
    return (
      <div className="workout-execution">
        <div className="error-state">
          <h2>No workout data available</h2>
          <button className="btn-primary" onClick={onWorkoutExit}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-execution">
      {/* Header with workout info */}
      <div className="workout-header">
        <div className="header-content">
          <div className="workout-title">
            <h1>{workout.sessionTitle || 'Training Session'}</h1>
            <p className="program-name">{workout.programName}</p>
          </div>
          
          <button 
            className="exit-button"
            onClick={onWorkoutExit}
          >
            ✕ Exit
          </button>
        </div>

        {/* Workout progress */}
        <div className="workout-progress">
          <div className="progress-info">
            <div className="drill-indicator">
              <span className="drill-icon">🥎</span>
              <span className="drill-name">{currentDrill?.name}</span>
              <span className="drill-timer">{formatTime(drillTimeRemaining)}</span>
            </div>
            <div className="drill-steps">
              Drill {currentDrillIndex + 1} of {totalDrills} • 
              Total Time: {formatTime(totalTimeElapsed)}
            </div>
          </div>
        </div>
      </div>

      {/* Current drill display */}
      {currentDrill && (
        <div className="current-drill-section">
          <div className="drill-header">
            <h3>{currentDrill.name}</h3>
            <div className="drill-meta">
              <span className="drill-duration">⏱️ {typeof currentDrill.duration === 'number' ? `${currentDrill.duration} min` : currentDrill.duration}</span>
              {currentDrill.repetitions && (
                <span className="drill-reps">🔄 {currentDrill.repetitions} reps</span>
              )}
            </div>
          </div>

          {showDrillInstructions && (
            <div className="drill-instructions">
              {/* Equipment */}
              {currentDrill.equipment && (
                <div className="drill-equipment">
                  <h4>🎯 Equipment Needed:</h4>
                  <p>{currentDrill.equipment}</p>
                </div>
              )}

              {/* Instructions */}
              {currentDrill.instructions && (
                <div className="drill-instructions-text">
                  <h4>📋 Instructions:</h4>
                  <p>{currentDrill.instructions}</p>
                </div>
              )}

              {/* Coaching Points */}
              {currentDrill.coachingPoints && (
                <div className="coaching-notes">
                  <h4>💡 Coaching Points:</h4>
                  <p>{currentDrill.coachingPoints}</p>
                </div>
              )}

              {/* Scenarios */}
              {currentDrill.scenarios && currentDrill.scenarios.length > 0 && (
                <div className="drill-scenarios">
                  <h4>🎲 Practice Scenarios:</h4>
                  <ul>
                    {currentDrill.scenarios.map((scenario, idx) => (
                      <li key={idx}>{scenario}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="drill-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleDrillComplete}
                  disabled={!isRunning || isPaused}
                >
                  Complete Drill
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={skipDrill}
                  disabled={!isRunning || isPaused}
                >
                  Skip Drill
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workout overview */}
      <div className="workout-overview">
        <h4>Today's Drills</h4>
        <div className="drills-list">
          {exercises.map((drill, index) => (
            <div 
              key={index}
              className={`drill-item ${index === currentDrillIndex ? 'active' : ''} ${completedDrills.has(index) ? 'completed' : ''}`}
            >
              <span className="drill-icon">🥎</span>
              <div className="drill-info">
                <span className="drill-name">{drill.name}</span>
                <span className="drill-duration">{typeof drill.duration === 'number' ? `${drill.duration} min` : drill.duration}</span>
              </div>
              {completedDrills.has(index) && (
                <span className="drill-status">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control buttons */}
      <div className="workout-controls">
        {!isRunning ? (
          <button 
            className="btn-start" 
            onClick={startWorkout}
          >
            ▶ Start Training
          </button>
        ) : (
          <div className="control-buttons">
            <button 
              className="btn-pause" 
              onClick={togglePause}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button 
              className="btn-danger" 
              onClick={handleWorkoutComplete}
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* Session notes */}
      <div className="session-notes">
        <h4>Session Notes</h4>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Add notes about your training session..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProgramWorkoutExecution;
