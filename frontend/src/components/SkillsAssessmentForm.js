import React, { useState } from 'react';
import './SkillsAssessmentForm.css';

const SkillsAssessmentForm = ({ onAssessmentComplete, userProfile }) => {
  // Initialize assessment state with all 13 skills
  const [assessment, setAssessment] = useState({
    // Receiving skills (4 subcategories)
    receiving_glove_move: 5,
    receiving_glove_load: 5,
    receiving_setups: 5,
    receiving_presentation: 5,
    
    // Throwing skills (4 subcategories)
    throwing_footwork: 5,
    throwing_exchange: 5,
    throwing_arm_strength: 5,
    throwing_accuracy: 5,
    
    // Blocking skills (1 category)
    blocking_overall: 5,
    
    // Education skills (4 subcategories)
    education_pitch_calling: 5,
    education_scouting_reports: 5,
    education_umpire_relations: 5,
    education_pitcher_relations: 5
  });

  const [currentSection, setCurrentSection] = useState('receiving');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skill categories with proper organization
  const skillCategories = {
    receiving: {
      title: 'Receiving Skills',
      description: 'Rate your ability to catch, frame, and present pitches',
      color: '#4CAF50', // Green
      skills: [
        {
          key: 'receiving_glove_move',
          name: 'Glove Movement',
          description: 'How well you position and move your glove to catch pitches'
        },
        {
          key: 'receiving_glove_load',
          name: 'Glove Loading',
          description: 'Your ability to prepare and load your glove for incoming pitches'
        },
        {
          key: 'receiving_setups',
          name: 'Setup & Stance',
          description: 'Proper positioning and stance behind the plate'
        },
        {
          key: 'receiving_presentation',
          name: 'Pitch Presentation',
          description: 'How well you frame and present pitches to the umpire'
        }
      ]
    },
    throwing: {
      title: 'Throwing Skills',
      description: 'Rate your throwing mechanics and accuracy',
      color: '#2196F3', // Blue
      skills: [
        {
          key: 'throwing_footwork',
          name: 'Throwing Footwork',
          description: 'Your footwork during the throwing motion'
        },
        {
          key: 'throwing_exchange',
          name: 'Ball Exchange',
          description: 'Speed and efficiency of glove-to-hand transfer'
        },
        {
          key: 'throwing_arm_strength',
          name: 'Arm Strength',
          description: 'Power and velocity of your throws'
        },
        {
          key: 'throwing_accuracy',
          name: 'Throwing Accuracy',
          description: 'Precision and consistency of your throws'
        }
      ]
    },
    blocking: {
      title: 'Blocking Skills',
      description: 'Rate your ability to block pitches in the dirt',
      color: '#FF9800', // Orange
      skills: [
        {
          key: 'blocking_overall',
          name: 'Overall Blocking',
          description: 'Your complete blocking technique and recovery'
        }
      ]
    },
    education: {
      title: 'Education & Mental Game',
      description: 'Rate your game knowledge and mental skills',
      color: '#9C27B0', // Purple
      skills: [
        {
          key: 'education_pitch_calling',
          name: 'Pitch Calling',
          description: 'Your ability to call pitches and manage counts'
        },
        {
          key: 'education_scouting_reports',
          name: 'Scouting Reports',
          description: 'How well you use and remember scouting information'
        },
        {
          key: 'education_umpire_relations',
          name: 'Umpire Relations',
          description: 'Your communication and relationship with umpires'
        },
        {
          key: 'education_pitcher_relations',
          name: 'Pitcher Relations',
          description: 'How well you work with and manage pitchers'
        }
      ]
    }
  };

  // Handle skill rating change
  const handleSkillChange = (skillKey, value) => {
    setAssessment(prev => ({
      ...prev,
      [skillKey]: parseInt(value)
    }));
  };

  // Get rating description
  const getRatingDescription = (rating) => {
    if (rating <= 2) return 'Needs Major Work';
    if (rating <= 4) return 'Needs Improvement';
    if (rating <= 6) return 'Average';
    if (rating <= 8) return 'Good';
    return 'Excellent';
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating <= 2) return '#f44336'; // Red
    if (rating <= 4) return '#ff9800'; // Orange
    if (rating <= 6) return '#ffc107'; // Yellow
    if (rating <= 8) return '#4caf50'; // Green
    return '#2196f3'; // Blue
  };

  // Handle section navigation
  const sections = Object.keys(skillCategories);
  const currentSectionIndex = sections.indexOf(currentSection);

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSection(sections[currentSectionIndex + 1]);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSection(sections[currentSectionIndex - 1]);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create assessment data
      const assessmentData = {
        ...assessment,
        user_id: userProfile?.user_id,
        completed_at: new Date().toISOString(),
        assessment_type: 'self_assessment'
      };

      // Call parent component's handler
      await onAssessmentComplete(assessmentData);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryData = skillCategories[currentSection];

  return (
    <div className="skills-assessment-form">
      <div className="assessment-header">
        <h1>Skills Assessment</h1>
        <p>Rate your current catching skills on a scale of 1-10 to get personalized training recommendations.</p>
        
        {/* Progress indicator */}
        <div className="progress-indicator">
          {sections.map((section, index) => (
            <div 
              key={section}
              className={`progress-step ${index <= currentSectionIndex ? 'completed' : ''} ${index === currentSectionIndex ? 'active' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{skillCategories[section].title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="assessment-content">
        {/* Section header */}
        <div className="section-header" style={{ borderColor: currentCategoryData.color }}>
          <h2 style={{ color: currentCategoryData.color }}>{currentCategoryData.title}</h2>
          <p>{currentCategoryData.description}</p>
        </div>

        {/* Skills rating grid */}
        <div className="skills-grid">
          {currentCategoryData.skills.map((skill) => (
            <div key={skill.key} className="skill-card">
              <div className="skill-header">
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
              </div>
              
              <div className="skill-rating">
                <div className="rating-display">
                  <span className="rating-number" style={{ color: getRatingColor(assessment[skill.key]) }}>
                    {assessment[skill.key]}
                  </span>
                  <span className="rating-label" style={{ color: getRatingColor(assessment[skill.key]) }}>
                    {getRatingDescription(assessment[skill.key])}
                  </span>
                </div>
                
                <div className="rating-slider">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={assessment[skill.key]}
                    onChange={(e) => handleSkillChange(skill.key, e.target.value)}
                    className="slider"
                    style={{ accentColor: getRatingColor(assessment[skill.key]) }}
                  />
                  <div className="slider-labels">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="navigation-buttons">
          <button 
            onClick={goToPreviousSection}
            disabled={currentSectionIndex === 0}
            className="nav-button prev-button"
          >
            ← Previous Section
          </button>
          
          {currentSectionIndex < sections.length - 1 ? (
            <button 
              onClick={goToNextSection}
              className="nav-button next-button"
            >
              Next Section →
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="nav-button submit-button"
            >
              {isSubmitting ? 'Generating Your Training Plan...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsAssessmentForm;