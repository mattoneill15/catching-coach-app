import React, { useState } from 'react';
import './ProgramsHub.css';

const ProgramsHub = ({ onStartProgram, onBack }) => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Program data - structured catching training programs
  const programs = [
    {
      id: 'elite-catcher',
      name: 'Elite Catcher Development',
      duration: '4 weeks',
      sessionsPerWeek: 4,
      difficulty: 'Advanced',
      description: 'Comprehensive program for serious catchers looking to reach elite level performance.',
      longDescription: 'This intensive 4-week program covers all aspects of elite catching: advanced framing techniques, blocking fundamentals, throwing mechanics, game management, and mental preparation. Perfect for high school varsity and college-bound catchers.',
      skills: ['Advanced Framing', 'Elite Blocking', 'Throwing Accuracy', 'Game Management', 'Leadership'],
      icon: '🏆',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      totalSessions: 16,
      estimatedTime: '45-60 min per session'
    },
    {
      id: 'framing-fundamentals',
      name: 'Framing Fundamentals',
      duration: '2 weeks',
      sessionsPerWeek: 3,
      difficulty: 'Beginner',
      description: 'Master the art of pitch framing with proper technique and positioning.',
      longDescription: 'Learn the fundamentals of pitch framing that can turn balls into strikes. This program focuses on proper stance, glove positioning, subtle movements, and timing to help you become a framing expert.',
      skills: ['Stance & Setup', 'Glove Positioning', 'Subtle Movements', 'Timing', 'Strike Zone Awareness'],
      icon: '🥎',
      color: '#00E676',
      gradient: 'linear-gradient(135deg, #00E676 0%, #00D96F 100%)',
      totalSessions: 6,
      estimatedTime: '30-40 min per session'
    },
    {
      id: 'blocking-mastery',
      name: 'Blocking Mastery',
      duration: '3 weeks',
      sessionsPerWeek: 3,
      difficulty: 'Intermediate',
      description: 'Develop elite blocking skills to keep runners from advancing.',
      longDescription: 'Transform your blocking ability with advanced techniques for different pitch types. Learn proper body positioning, recovery methods, and how to keep balls in front consistently.',
      skills: ['Body Positioning', 'Glove Work', 'Recovery Techniques', 'Dirt Ball Handling', 'Lateral Movement'],
      icon: '🛡️',
      color: '#1565C0',
      gradient: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      totalSessions: 9,
      estimatedTime: '40-50 min per session'
    },
    {
      id: 'throwing-mechanics',
      name: 'Throwing Mechanics',
      duration: '2 weeks',
      sessionsPerWeek: 4,
      difficulty: 'Intermediate',
      description: 'Perfect your throwing technique for accuracy and arm strength.',
      longDescription: 'Develop lightning-fast, accurate throws to all bases. Focus on proper footwork, arm mechanics, release point, and building arm strength safely.',
      skills: ['Footwork Patterns', 'Arm Mechanics', 'Release Point', 'Accuracy Training', 'Arm Strengthening'],
      icon: '⚡',
      color: '#FF6F00',
      gradient: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
      totalSessions: 8,
      estimatedTime: '35-45 min per session'
    }
  ];

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
  };

  const handleStartProgram = () => {
    if (selectedProgram) {
      onStartProgram({
        ...selectedProgram,
        currentWeek: 1,
        currentDay: 1,
        sessionDuration: parseInt(selectedProgram.estimatedTime)
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#00E676';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="programs-hub">
      <div className="programs-header">
        <button className="back-btn" onClick={onBack}>
          <span className="back-icon">←</span>
          Back
        </button>
        <h1>Training Programs</h1>
        <p>Choose a structured program to develop your catching skills</p>
      </div>

      <div className="programs-grid">
        {programs.map((program) => (
          <div
            key={program.id}
            className={`program-card ${selectedProgram?.id === program.id ? 'selected' : ''}`}
            onClick={() => handleProgramSelect(program)}
          >
            <div className="program-header" style={{ background: program.gradient }}>
              <div className="program-icon">{program.icon}</div>
              <div className="program-badge">
                <span className="difficulty" style={{ color: getDifficultyColor(program.difficulty) }}>
                  {program.difficulty}
                </span>
              </div>
            </div>
            
            <div className="program-content">
              <h3 className="program-name">{program.name}</h3>
              <p className="program-description">{program.description}</p>
              
              <div className="program-stats">
                <div className="stat">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-text">{program.duration}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <span className="stat-text">{program.sessionsPerWeek}x/week</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-text">{program.totalSessions} sessions</span>
                </div>
              </div>

              <div className="program-skills">
                <h4>Skills You'll Develop:</h4>
                <div className="skills-list">
                  {program.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                  {program.skills.length > 3 && (
                    <span className="skill-tag more">+{program.skills.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProgram && (
        <div className="program-details">
          <div className="details-content">
            <div className="details-header">
              <div className="details-icon" style={{ background: selectedProgram.gradient }}>
                {selectedProgram.icon}
              </div>
              <div className="details-info">
                <h2>{selectedProgram.name}</h2>
                <p className="details-duration">{selectedProgram.estimatedTime} • {selectedProgram.difficulty}</p>
              </div>
            </div>

            <div className="details-description">
              <p>{selectedProgram.longDescription}</p>
            </div>

            <div className="details-skills">
              <h3>Complete Skill Development:</h3>
              <div className="all-skills">
                {selectedProgram.skills.map((skill, index) => (
                  <span key={index} className="skill-tag-detailed">{skill}</span>
                ))}
              </div>
            </div>

            <div className="details-commitment">
              <div className="commitment-item">
                <span className="commitment-label">Duration:</span>
                <span className="commitment-value">{selectedProgram.duration}</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-label">Sessions per week:</span>
                <span className="commitment-value">{selectedProgram.sessionsPerWeek}</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-label">Total sessions:</span>
                <span className="commitment-value">{selectedProgram.totalSessions}</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-label">Time per session:</span>
                <span className="commitment-value">{selectedProgram.estimatedTime}</span>
              </div>
            </div>

            <button className="start-program-btn-detailed" onClick={handleStartProgram}>
              <span className="btn-icon">🚀</span>
              Start {selectedProgram.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsHub;
