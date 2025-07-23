import React, { useState } from 'react';
import './WorkoutDisplay.css';

const WorkoutDisplay = ({ 
  workout, 
  userProfile, 
  onStartWorkout, 
  onRegenerateWorkout,
  onBackToDashboard 
}) => {
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // Phase configurations for display
  const phaseConfig = {
    warmup: {
      title: 'Warm-Up',
      icon: '🔥',
      color: '#FF9800',
      description: 'Prepare your body for training'
    },
    main_work: {
      title: 'Main Work',
      icon: '💪',
      color: '#00E676',
      description: 'Focus area training'
    },
    secondary_work: {
      title: 'Secondary Work',
      icon: '⚙️',
      color: '#2196F3',
      description: 'Supporting skills'
    },
    education: {
      title: 'Education',
      icon: '🧠',
      color: '#9C27B0',
      description: 'Mental game & strategy'
    },
    video_review: {
      title: 'Video Review',
      icon: '📹',
      color: '#607D8B',
      description: 'Analyze your technique'
    },
    cooldown: {
      title: 'Cool Down',
      icon: '🧘',
      color: '#795548',
      description: 'Recovery and reflection'
    }
  };

  // Calculate total workout duration
  const totalDuration = workout?.phases?.reduce((total, phase) => total + phase.duration, 0) || workout?.total_duration || 0;

  // Handle phase expansion
  const togglePhase = (phaseIndex) => {
    setExpandedPhase(expandedPhase === phaseIndex ? null : phaseIndex);
  };

  // Handle start workout
  const handleStartWorkout = async () => {
    setIsStarting(true);
    
    try {
      // Start the workout execution
      await onStartWorkout(workout);
    } catch (error) {
      console.error('Error starting workout:', error);
      alert('Error starting workout. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  // Handle regenerate workout
  const handleRegenerateWorkout = () => {
    onRegenerateWorkout();
  };

  if (!workout) {
    return (
      <div className="workout-display">
        <div className="no-workout">
          <h2>No workout available</h2>
          <p>Please generate a workout to get started.</p>
          <button className="back-btn" onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-display">
      {/* Header */}
      <div className="workout-header">
        <div className="header-content">
          <div className="workout-title">
            <h1>Today's Training Session</h1>
            <div className="workout-meta">
              <span className="duration">{totalDuration} minutes</span>
              <span className="focus-area">Focus: {workout.focus_area || 'Balanced Training'}</span>
            </div>
          </div>
          
          <button 
            className="back-button"
            onClick={onBackToDashboard}
            disabled={isStarting}
          >
            ← Dashboard
          </button>
        </div>

        {/* AI Coaching Notes */}
        {workout.coaching_notes && workout.coaching_notes.length > 0 && (
          <div className="coaching-notes">
            <div className="notes-header">
              <span className="notes-icon">🎯</span>
              <span className="notes-title">Today's Focus</span>
            </div>
            <div className="notes-content">
              {workout.coaching_notes.map((note, index) => (
                <p key={index} className="coaching-note">{note}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workout Overview */}
      <div className="workout-overview">
        <h2>Workout Overview</h2>
        <div className="phases-timeline">
          {workout.phases && workout.phases.map((phase, index) => {
            const config = phaseConfig[phase.phase] || {
              title: phase.phase,
              icon: '⚡',
              color: '#666666',
              description: 'Training phase'
            };

            return (
              <div 
                key={index}
                className={`phase-card ${expandedPhase === index ? 'expanded' : ''}`}
                onClick={() => togglePhase(index)}
              >
                <div className="phase-header">
                  <div className="phase-info">
                    <span 
                      className="phase-icon"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.icon}
                    </span>
                    <div className="phase-details">
                      <h3>{config.title}</h3>
                      <p>{config.description}</p>
                    </div>
                  </div>
                  <div className="phase-duration">
                    <span className="duration-text">{phase.duration} min</span>
                    <span className="expand-icon">
                      {expandedPhase === index ? '−' : '+'}
                    </span>
                  </div>
                </div>

                {/* Expanded phase content */}
                {expandedPhase === index && (
                  <div className="phase-content">
                    <div className="drills-list">
                      <h4>Drills in this phase:</h4>
                      {phase.drills && phase.drills.map((drill, drillIndex) => (
                        <div key={drillIndex} className="drill-item">
                          <span className="drill-name">
                            {typeof drill === 'string' ? drill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : drill.name}
                          </span>
                          {drill.duration && (
                            <span className="drill-duration">{drill.duration} min</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Used */}
      {workout.equipment_used && workout.equipment_used.length > 0 && (
        <div className="equipment-section">
          <h3>Equipment for Today</h3>
          <div className="equipment-list">
            {workout.equipment_used.map((equipment, index) => {
              const equipmentMap = {
                tennis_balls: { name: 'Tennis Balls', icon: '🎾' },
                catchers_gear: { name: 'Catching Gear', icon: '🥎' },
                home_plate: { name: 'Home Plate', icon: '⚾' },
                l_screen: { name: 'L-Screen', icon: '🛡️' },
                cones: { name: 'Cones/Targets', icon: '🚩' }
              };
              
              const equipmentInfo = equipmentMap[equipment] || { 
                name: equipment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
                icon: '⚡' 
              };

              return (
                <div key={index} className="equipment-item">
                  <span className="equipment-icon">{equipmentInfo.icon}</span>
                  <span className="equipment-name">{equipmentInfo.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="workout-actions">
        <button 
          className="regenerate-btn"
          onClick={handleRegenerateWorkout}
          disabled={isStarting}
        >
          🔄 Generate Different Workout
        </button>
        
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
            <span>▶ Start Workout</span>
          )}
        </button>
      </div>

      {/* Workout Stats */}
      <div className="workout-stats">
        <div className="stat-item">
          <span className="stat-label">Total Duration</span>
          <span className="stat-value">{totalDuration} min</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Phases</span>
          <span className="stat-value">{workout.phases?.length || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Focus Area</span>
          <span className="stat-value">{workout.focus_area || 'Balanced'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Energy Level</span>
          <span className="stat-value">
            {workout.energy_adjustment === 'high' ? '🔥 High' : 
             workout.energy_adjustment === 'low' ? '😴 Easy' : '💪 Normal'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDisplay;