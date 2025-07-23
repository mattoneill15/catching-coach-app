import React, { useState } from 'react';
import './DailyCheckin.css';

const DailyCheckin = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  userEquipment = [], 
  onWorkoutGenerated 
}) => {
  const [checkinData, setCheckinData] = useState({
    available_time: 30,
    equipment_today: [],
    energy_level: 'normal'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Time options with descriptions
  const timeOptions = [
    { 
      value: 15, 
      label: '15 min', 
      description: 'Quick focused session',
      intensity: 'High intensity fundamentals'
    },
    { 
      value: 30, 
      label: '30 min', 
      description: 'Balanced training',
      intensity: 'Complete skill development'
    },
    { 
      value: 45, 
      label: '45 min', 
      description: 'Comprehensive workout',
      intensity: 'Full training with video review'
    },
    { 
      value: 60, 
      label: '60+ min', 
      description: 'Elite training session',
      intensity: 'Complete program with analysis'
    }
  ];

  // Equipment options (filtered from user's available equipment)
  const equipmentOptions = [
    { 
      id: 'tennis_balls', 
      label: 'Tennis Balls', 
      icon: '🎾',
      tier: 'basic'
    },
    { 
      id: 'catchers_gear', 
      label: 'Catching Gear', 
      icon: '🥎',
      tier: 'intermediate'
    },
    { 
      id: 'home_plate', 
      label: 'Home Plate', 
      icon: '⚾',
      tier: 'advanced'
    },
    { 
      id: 'l_screen', 
      label: 'L-Screen', 
      icon: '🛡️',
      tier: 'premium'
    },
    { 
      id: 'cones', 
      label: 'Cones/Targets', 
      icon: '🚩',
      tier: 'premium'
    }
  ].filter(equipment => userEquipment.includes(equipment.id));

  // Energy level options
  const energyLevels = [
    { 
      value: 'low', 
      label: 'Taking it easy', 
      emoji: '😴',
      description: 'Focus on fundamentals and technique'
    },
    { 
      value: 'normal', 
      label: 'Ready to work', 
      emoji: '💪',
      description: 'Standard training intensity'
    },
    { 
      value: 'high', 
      label: 'Feeling strong', 
      emoji: '🔥',
      description: 'Push the limits today'
    }
  ];

  // Handle time selection
  const handleTimeSelect = (minutes) => {
    setCheckinData(prev => ({
      ...prev,
      available_time: minutes
    }));
  };

  // Handle equipment toggle
  const handleEquipmentToggle = (equipmentId) => {
    setCheckinData(prev => ({
      ...prev,
      equipment_today: prev.equipment_today.includes(equipmentId)
        ? prev.equipment_today.filter(id => id !== equipmentId)
        : [...prev.equipment_today, equipmentId]
    }));
  };

  // Handle energy level selection
  const handleEnergySelect = (level) => {
    setCheckinData(prev => ({
      ...prev,
      energy_level: level
    }));
  };

  // Generate workout
  const handleGenerateWorkout = async () => {
    if (checkinData.equipment_today.length === 0) {
      alert('Please select at least one piece of equipment you have available today.');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare workout generation data
      const workoutRequest = {
        user_profile: userProfile,
        available_time: checkinData.available_time,
        available_equipment: checkinData.equipment_today,
        energy_level: checkinData.energy_level,
        session_date: new Date().toISOString().split('T')[0],
        session_type: 'daily_training'
      };

      // Simulate AI workout generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Mock generated workout (replace with actual workout data)
      const generatedWorkout = {
        workout_id: `workout_${Date.now()}`,
        total_duration: checkinData.available_time,
        focus_area: 'blocking', // This would come from user's weakest skill
        phases: [
          {
            phase: 'warmup',
            duration: Math.max(2, Math.floor(checkinData.available_time * 0.1)),
            drills: ['basic_stance_warmup']
          },
          {
            phase: 'main_work',
            duration: Math.floor(checkinData.available_time * 0.6),
            drills: ['tennis_ball_blocking', 'basic_blocking_position']
          },
          {
            phase: 'secondary_work',
            duration: Math.floor(checkinData.available_time * 0.2),
            drills: ['framing_fundamentals']
          },
          {
            phase: 'education',
            duration: Math.floor(checkinData.available_time * 0.1),
            drills: ['pitch_calling_basics']
          }
        ],
        coaching_notes: [
          'Focus on keeping your glove steady through the catch',
          'Remember to stay low and balanced in your stance',
          'Today we\'re working on your blocking fundamentals'
        ],
        equipment_used: checkinData.equipment_today,
        energy_adjustment: checkinData.energy_level
      };

      // Pass workout back to parent component
      onWorkoutGenerated(generatedWorkout);

    } catch (error) {
      console.error('Error generating workout:', error);
      alert('Error generating your workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Close modal
  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedTimeOption = timeOptions.find(option => option.value === checkinData.available_time);

  return (
    <div className="daily-checkin-overlay" onClick={handleClose}>
      <div className="daily-checkin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="checkin-header">
          <h2>Ready to train?</h2>
          <p>Let's set up today's session</p>
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={isGenerating}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="checkin-content">
          {/* Time Selection */}
          <div className="section">
            <h3>How much time do you have?</h3>
            <div className="time-options">
              {timeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`time-card ${checkinData.available_time === option.value ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(option.value)}
                >
                  <div className="time-value">{option.label}</div>
                  <div className="time-description">{option.description}</div>
                  <div className="time-intensity">{option.intensity}</div>
                </div>
              ))}
            </div>
            
            {selectedTimeOption && (
              <div className="time-preview">
                <span className="preview-label">Today's session:</span>
                <span className="preview-value">{selectedTimeOption.label} - {selectedTimeOption.description}</span>
              </div>
            )}
          </div>

          {/* Equipment Selection */}
          <div className="section">
            <h3>What equipment do you have today?</h3>
            <p className="section-subtitle">Select all equipment you can use right now</p>
            
            {equipmentOptions.length > 0 ? (
              <div className="equipment-options">
                {equipmentOptions.map((equipment) => (
                  <div
                    key={equipment.id}
                    className={`equipment-option ${checkinData.equipment_today.includes(equipment.id) ? 'selected' : ''} ${equipment.tier}`}
                    onClick={() => handleEquipmentToggle(equipment.id)}
                  >
                    <div className="equipment-icon">{equipment.icon}</div>
                    <div className="equipment-label">{equipment.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-equipment-message">
                <p>No equipment found in your profile. You can still do bodyweight drills!</p>
                <div 
                  className="equipment-option selected"
                  onClick={() => handleEquipmentToggle('bodyweight')}
                >
                  <div className="equipment-icon">💪</div>
                  <div className="equipment-label">Bodyweight Only</div>
                </div>
              </div>
            )}
          </div>

          {/* Energy Level Selection */}
          <div className="section">
            <h3>How are you feeling?</h3>
            <div className="energy-options">
              {energyLevels.map((level) => (
                <div
                  key={level.value}
                  className={`energy-option ${checkinData.energy_level === level.value ? 'selected' : ''}`}
                  onClick={() => handleEnergySelect(level.value)}
                >
                  <div className="energy-emoji">{level.emoji}</div>
                  <div className="energy-info">
                    <div className="energy-label">{level.label}</div>
                    <div className="energy-description">{level.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="checkin-footer">
          <button
            className="generate-btn"
            onClick={handleGenerateWorkout}
            disabled={isGenerating || checkinData.equipment_today.length === 0}
          >
            {isGenerating ? (
              <div className="generating-content">
                <div className="spinner"></div>
                <span>Creating your workout...</span>
              </div>
            ) : (
              <span>Generate Today's Workout</span>
            )}
          </button>
          
          {checkinData.equipment_today.length === 0 && (
            <p className="validation-message">Please select at least one piece of equipment</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;