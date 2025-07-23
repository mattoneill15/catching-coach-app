import React, { useState } from 'react';
import './IntakeQuestionnaire.css';

const IntakeQuestionnaire = ({ userProfile, onIntakeComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    age: '',
    experience_level: '',
    years_experience: '',
    position: 'catcher',
    school_team: '',
    
    // Goals (multiple selection)
    goals: [],
    
    // Equipment Access (multiple selection)
    equipment_access: [],
    
    // Training Preferences
    preferred_session_length: 30,
    training_frequency: '',
    training_focus: ''
  });
  const [errors, setErrors] = useState({});

  // Form configuration
  const totalSteps = 4;

  // Experience level options
  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: '0-2 years of organized catching' },
    { value: 'intermediate', label: 'Intermediate', description: '2-5 years of catching experience' },
    { value: 'advanced', label: 'Advanced', description: '5+ years, varsity level or higher' },
    { value: 'elite', label: 'Elite', description: 'College level or professional aspirations' }
  ];

  // Goals options
  const goalOptions = [
    { id: 'improve_blocking', label: 'Improve Blocking Skills', icon: '🛡️' },
    { id: 'better_framing', label: 'Better Pitch Framing', icon: '🎯' },
    { id: 'stronger_arm', label: 'Develop Stronger Throwing Arm', icon: '💪' },
    { id: 'game_calling', label: 'Learn Pitch Calling Strategy', icon: '🧠' },
    { id: 'college_prep', label: 'Prepare for College Baseball', icon: '🎓' },
    { id: 'pro_prep', label: 'Professional Development', icon: '⭐' },
    { id: 'consistency', label: 'Build Consistent Mechanics', icon: '⚙️' },
    { id: 'leadership', label: 'Develop Leadership Skills', icon: '👑' }
  ];

  // Equipment options
  const equipmentOptions = [
    { id: 'tennis_balls', label: 'Tennis Balls', tier: 'basic', icon: '🎾' },
    { id: 'catchers_gear', label: 'Full Catching Gear', tier: 'intermediate', icon: '🥎' },
    { id: 'home_plate', label: 'Home Plate Setup', tier: 'advanced', icon: '⚾' },
    { id: 'l_screen', label: 'L-Screen for Protection', tier: 'premium', icon: '🛡️' },
    { id: 'cones', label: 'Cones/Targets', tier: 'premium', icon: '🚩' }
  ];

  // Training frequency options
  const frequencyOptions = [
    { value: '2-3_times_week', label: '2-3 times per week', description: 'Consistent improvement' },
    { value: '4-5_times_week', label: '4-5 times per week', description: 'Serious development' },
    { value: 'daily', label: 'Daily training', description: 'Elite dedication' },
    { value: 'flexible', label: 'Flexible schedule', description: 'Train when available' }
  ];

  // Training focus options
  const focusOptions = [
    { value: 'fundamentals', label: 'Master the Fundamentals', description: 'Build solid foundation' },
    { value: 'advanced_skills', label: 'Advanced Skill Development', description: 'Refine techniques' },
    { value: 'game_situations', label: 'Game Situation Training', description: 'Real-game scenarios' },
    { value: 'weakness_focus', label: 'Focus on Weak Areas', description: 'Target improvement areas' }
  ];

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle multi-select fields (goals, equipment)
  const handleMultiSelectToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.age || formData.age < 12 || formData.age > 25) {
          newErrors.age = 'Age must be between 12 and 25';
        }
        if (!formData.experience_level) {
          newErrors.experience_level = 'Please select your experience level';
        }
        if (!formData.years_experience || formData.years_experience < 0) {
          newErrors.years_experience = 'Please enter years of experience';
        }
        break;
        
      case 2: // Goals
        if (formData.goals.length === 0) {
          newErrors.goals = 'Please select at least one goal';
        }
        break;
        
      case 3: // Equipment
        if (formData.equipment_access.length === 0) {
          newErrors.equipment_access = 'Please select available equipment';
        }
        break;
        
      case 4: // Training Preferences
        if (!formData.training_frequency) {
          newErrors.training_frequency = 'Please select training frequency';
        }
        if (!formData.training_focus) {
          newErrors.training_focus = 'Please select training focus';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare intake data
      const intakeData = {
        ...formData,
        user_id: userProfile.user_id,
        completed_at: new Date().toISOString()
      };
      
      // Call parent component handler
      await onIntakeComplete(intakeData);
      
    } catch (error) {
      console.error('Error submitting intake:', error);
      setErrors({ general: 'Error saving your information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Tell us about yourself</h2>
            <p>Help us understand your catching background</p>
            
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  min="12"
                  max="25"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                  className={errors.age ? 'error' : ''}
                  placeholder="Enter your age"
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="yearsExperience">Years of Catching Experience</label>
                <input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="15"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || '')}
                  className={errors.years_experience ? 'error' : ''}
                  placeholder="Years of experience"
                />
                {errors.years_experience && <span className="error-text">{errors.years_experience}</span>}
              </div>

              <div className="input-group full-width">
                <label htmlFor="schoolTeam">School/Team (Optional)</label>
                <input
                  id="schoolTeam"
                  type="text"
                  value={formData.school_team}
                  onChange={(e) => handleInputChange('school_team', e.target.value)}
                  placeholder="High School Varsity, Travel Team, etc."
                />
              </div>
            </div>

            <div className="selection-group">
              <label>Experience Level</label>
              {errors.experience_level && <span className="error-text">{errors.experience_level}</span>}
              <div className="option-cards">
                {experienceLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`option-card ${formData.experience_level === level.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('experience_level', level.value)}
                  >
                    <h3>{level.label}</h3>
                    <p>{level.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>What are your goals?</h2>
            <p>Select all areas where you want to improve (choose multiple)</p>
            {errors.goals && <span className="error-text">{errors.goals}</span>}
            
            <div className="multi-select-grid">
              {goalOptions.map((goal) => (
                <div
                  key={goal.id}
                  className={`multi-select-card ${formData.goals.includes(goal.id) ? 'selected' : ''}`}
                  onClick={() => handleMultiSelectToggle('goals', goal.id)}
                >
                  <div className="card-icon">{goal.icon}</div>
                  <h3>{goal.label}</h3>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>What equipment do you have access to?</h2>
            <p>Select all equipment you can use for training (choose multiple)</p>
            {errors.equipment_access && <span className="error-text">{errors.equipment_access}</span>}
            
            <div className="equipment-grid">
              {equipmentOptions.map((equipment) => (
                <div
                  key={equipment.id}
                  className={`equipment-card ${formData.equipment_access.includes(equipment.id) ? 'selected' : ''} ${equipment.tier}`}
                  onClick={() => handleMultiSelectToggle('equipment_access', equipment.id)}
                >
                  <div className="card-icon">{equipment.icon}</div>
                  <h3>{equipment.label}</h3>
                  <span className="equipment-tier">{equipment.tier}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Training preferences</h2>
            <p>How do you want to structure your training?</p>
            
            <div className="preference-section">
              <label>Preferred Session Length</label>
              <div className="slider-group">
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="15"
                  value={formData.preferred_session_length}
                  onChange={(e) => handleInputChange('preferred_session_length', parseInt(e.target.value))}
                  className="time-slider"
                />
                <div className="slider-value">{formData.preferred_session_length} minutes</div>
                <div className="slider-labels">
                  <span>15 min</span>
                  <span>30 min</span>
                  <span>45 min</span>
                  <span>60 min</span>
                </div>
              </div>
            </div>

            <div className="selection-group">
              <label>Training Frequency</label>
              {errors.training_frequency && <span className="error-text">{errors.training_frequency}</span>}
              <div className="option-cards">
                {frequencyOptions.map((freq) => (
                  <div
                    key={freq.value}
                    className={`option-card ${formData.training_frequency === freq.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('training_frequency', freq.value)}
                  >
                    <h3>{freq.label}</h3>
                    <p>{freq.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="selection-group">
              <label>Training Focus</label>
              {errors.training_focus && <span className="error-text">{errors.training_focus}</span>}
              <div className="option-cards">
                {focusOptions.map((focus) => (
                  <div
                    key={focus.value}
                    className={`option-card ${formData.training_focus === focus.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('training_focus', focus.value)}
                  >
                    <h3>{focus.label}</h3>
                    <p>{focus.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="intake-questionnaire">
      <div className="intake-container">
        {/* Header */}
        <div className="intake-header">
          <h1>Setup Your Training Profile</h1>
          <p>This helps us create a personalized training program just for you</p>
          
          {/* Progress indicator */}
          <div className="progress-bar">
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">Step {currentStep} of {totalSteps}</span>
          </div>
        </div>

        {/* Step content */}
        <div className="intake-content">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="intake-navigation">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="nav-btn secondary"
          >
            ← Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="nav-btn primary"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="nav-btn primary submit"
            >
              {isSubmitting ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  Setting up your profile...
                </span>
              ) : (
                'Complete Setup'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeQuestionnaire;