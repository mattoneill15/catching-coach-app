import React, { useState, useEffect, useRef } from 'react';
import './WorkoutExecution.css';

const WorkoutExecution = ({ workout, onWorkoutComplete, onWorkoutExit }) => {
  // State management for live workout execution - MUST be before any returns
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDrillFeedback, setCurrentDrillFeedback] = useState('');
  const [showDrillInstructions, setShowDrillInstructions] = useState(true);
  const [completedDrills, setCompletedDrills] = useState(new Set());
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer refs for accurate timing - MUST be before any returns
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Get current phase and drill data - handle different workout data structures
  const phases = workout?.phases || [];
  const currentPhase = phases[currentPhaseIndex];
  const currentDrill = currentPhase?.drills?.[currentDrillIndex];
  const totalPhases = phases.length;
  const totalWorkoutTime = (workout?.totalDuration || workout?.duration || 30) * 60; // Convert to seconds

  // Initialize phase timer when phase changes - MUST be before any returns
  useEffect(() => {
    if (currentPhase) {
      setPhaseTimeRemaining(currentPhase.duration * 60); // Convert to seconds
      setCurrentDrillIndex(0);
      setShowDrillInstructions(true);
    }
  }, [currentPhaseIndex, currentPhase]);

  // Main timer logic - MUST be before any returns
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTotalTimeElapsed(prev => prev + 1);
        setPhaseTimeRemaining(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
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

  // Early return if no workout data - AFTER all hooks
  if (!workout) {
    return (
      <div className="workout-execution-error">
        <h2>No Workout Data</h2>
        <p>Unable to start workout - no workout data available.</p>
        <button className="btn-primary" onClick={() => {
          console.log('🔙 WorkoutExecution back button clicked (no workout)');
          console.log('onWorkoutExit function:', onWorkoutExit);
          if (onWorkoutExit) {
            onWorkoutExit();
          } else {
            console.error('❌ onWorkoutExit function is undefined!');
          }
        }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // If no phases, show error state - AFTER all hooks
  if (totalPhases === 0) {
    return (
      <div className="workout-execution-error">
        <h2>Workout Structure Missing</h2>
        <p>This workout doesn't have any phases configured. Please generate a new workout.</p>
        <button className="btn-primary" onClick={() => {
          console.log('🔙 WorkoutExecution back button clicked (no phases)');
          console.log('onWorkoutExit function:', onWorkoutExit);
          if (onWorkoutExit) {
            onWorkoutExit();
          } else {
            console.error('❌ onWorkoutExit function is undefined!');
          }
        }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Phase icons and colors (matching WorkoutDisplay component)
  const getPhaseIcon = (phaseType) => {
    const icons = {
      'warmup': '🔥',
      'main_work': '💪',
      'secondary_work': '⚙️',
      'education': '🧠',
      'video_review': '📹',
      'cooldown': '🧘'
    };
    return icons[phaseType] || '⚙️';
  };

  const getPhaseColor = (phaseType) => {
    const colors = {
      'warmup': '#FF6F00',
      'main_work': '#00E676',
      'secondary_work': '#1565C0',
      'education': '#9C27B0',
      'video_review': '#666666',
      'cooldown': '#8D6E63'
    };
    return colors[phaseType] || '#1565C0';
  };



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
    const drillKey = `${currentPhaseIndex}-${currentDrillIndex}`;
    setCompletedDrills(prev => new Set([...prev, drillKey]));
    
    // Move to next drill or finish phase
    if (currentDrillIndex < currentPhase.drills.length - 1) {
      setCurrentDrillIndex(currentDrillIndex + 1);
      setShowDrillInstructions(true);
    } else {
      // Phase complete - wait for timer or manual advance
      setShowDrillInstructions(false);
    }
  };

  // Handle phase completion
  const handlePhaseComplete = () => {
    if (currentPhaseIndex < totalPhases - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    } else {
      // Workout complete!
      handleWorkoutComplete();
    }
  };

  // Handle workout completion
  const handleWorkoutComplete = () => {
    setIsRunning(false);
    const workoutData = {
      workoutId: workout.id,
      totalDuration: totalTimeElapsed,
      completedDrills: Array.from(completedDrills),
      sessionNotes: sessionNotes,
      completedAt: new Date().toISOString()
    };
    onWorkoutComplete(workoutData);
  };

  // Skip to next drill
  const skipDrill = () => {
    if (currentDrillIndex < currentPhase.drills.length - 1) {
      setCurrentDrillIndex(currentDrillIndex + 1);
      setShowDrillInstructions(true);
    }
  };

  // Skip to next phase
  const skipPhase = () => {
    if (currentPhaseIndex < totalPhases - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate overall progress
  const overallProgress = ((totalTimeElapsed / totalWorkoutTime) * 100).toFixed(1);

  return (
    <div className="workout-execution">
      {/* Header with workout info and controls */}
      <div className="workout-header">
        <div className="workout-title">
          <h2>{workout.title}</h2>
          <p className="workout-focus">Focus: {workout.primaryFocus}</p>
        </div>
        <div className="workout-controls">
          <button 
            className="btn-secondary" 
            onClick={onWorkoutExit}
            disabled={isRunning && !isPaused}
          >
            Exit
          </button>
          {!isRunning ? (
            <button className="btn-primary" onClick={startWorkout}>
              Start Workout
            </button>
          ) : (
            <button 
              className={`btn-${isPaused ? 'primary' : 'secondary'}`}
              onClick={togglePause}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>

      {/* Progress indicators */}
      <div className="progress-section">
        <div className="overall-progress">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span>{formatTime(totalTimeElapsed)} / {formatTime(totalWorkoutTime)}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>

        <div className="phase-progress">
          <div className="phase-indicator">
            <span className="phase-icon" style={{ color: getPhaseColor(currentPhase?.type) }}>
              {getPhaseIcon(currentPhase?.type)}
            </span>
            <span className="phase-name">{currentPhase?.name}</span>
            <span className="phase-timer">{formatTime(phaseTimeRemaining)}</span>
          </div>
          <div className="phase-steps">
            Phase {currentPhaseIndex + 1} of {totalPhases} • 
            Drill {currentDrillIndex + 1} of {currentPhase?.drills.length}
          </div>
        </div>
      </div>

      {/* Current drill display */}
      {currentDrill && (
        <div className="current-drill-section">
          <div className="drill-header">
            <h3>{currentDrill.name}</h3>
            <div className="drill-meta">
              <span className="drill-category">{currentDrill.category}</span>
              <span className="drill-equipment">
                Equipment: {currentDrill.equipment.join(', ')}
              </span>
            </div>
          </div>

          {showDrillInstructions && (
            <div className="drill-instructions">
              <h4>Instructions:</h4>
              <p>{currentDrill.instructions}</p>
              
              {currentDrill.coachingNotes && (
                <div className="coaching-notes">
                  <h4>Coaching Notes:</h4>
                  <p>{currentDrill.coachingNotes}</p>
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

          {!showDrillInstructions && currentDrillIndex === currentPhase.drills.length - 1 && (
            <div className="phase-complete">
              <h4>Phase Complete!</h4>
              <p>Great work on the {currentPhase.name} phase.</p>
              <button 
                className="btn-primary" 
                onClick={handlePhaseComplete}
                disabled={!isRunning || isPaused}
              >
                Continue to Next Phase
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phase overview */}
      <div className="phase-overview">
        <h4>Today's Workout Phases</h4>
        <div className="phases-list">
          {workout.phases.map((phase, index) => (
            <div 
              key={index}
              className={`phase-item ${index === currentPhaseIndex ? 'active' : ''} ${index < currentPhaseIndex ? 'completed' : ''}`}
            >
              <span className="phase-icon" style={{ color: getPhaseColor(phase.type) }}>
                {getPhaseIcon(phase.type)}
              </span>
              <div className="phase-info">
                <span className="phase-name">{phase.name}</span>
                <span className="phase-duration">{phase.duration} min</span>
              </div>
              {index < currentPhaseIndex && (
                <span className="phase-status">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick controls */}
      <div className="quick-controls">
        <button 
          className="btn-tertiary" 
          onClick={skipPhase}
          disabled={!isRunning || isPaused || currentPhaseIndex >= totalPhases - 1}
        >
          Skip Phase
        </button>
        <button 
          className="btn-danger" 
          onClick={handleWorkoutComplete}
          disabled={!isRunning}
        >
          End Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutExecution;