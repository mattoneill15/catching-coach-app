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
      longDescription: 'Learn the fundamentals of pitch framing that can turn balls into strikes. This comprehensive 2-week program progresses from basic stance fundamentals to advanced velocity framing, covering setup selection, tennis ball receiving, and real baseball framing techniques.',
      skills: ['Stance Selection', 'Setup Fundamentals', 'Tennis Ball Receiving', 'Coach Pitch Framing', 'Breaking Ball Patience', 'Velocity Framing'],
      icon: '🥎',
      color: '#00E676',
      gradient: 'linear-gradient(135deg, #00E676 0%, #00D96F 100%)',
      totalSessions: 6,
      estimatedTime: '30 min per session',
      sessions: [
        {
          id: 1,
          week: 1,
          title: 'Introduction to Stances and Setups',
          duration: 30,
          learningObjectives: 'Catcher will understand the three different stances, how differing scenarios affect their setup, and will learn how to digest game information and translate that into the setup they will use for each pitch.',
          drills: [
            {
              name: 'Random Setups',
              duration: 20,
              repetitions: 20,
              equipment: 'None needed (optional helper calling out scenarios)',
              instructions: 'Go through different scenarios in your head, or have a coach call them out to you. Given the scenario (Count, runner on base, and what pitch), you will get into your setup. Practice doing this for 20 repetitions, each time getting more comfortable selecting a setup to address the current scenario.',
              coachingPoints: 'Focus on consistent setups. Each time you are using a certain setup, know your checkpoints. Make sure you understand the three stances: Traditional setup (both knees up, deep squat), Left knee down setup, Right knee down setup.',
              scenarios: ['Nobody on base, less than 2 strikes', 'Nobody on base, 2 strikes', 'Runner on base']
            }
          ]
        },
        {
          id: 2,
          week: 1,
          title: 'Basic Tennis Ball Receiving',
          duration: 30,
          learningObjectives: 'Catcher will learn how to catch and stick the ball.',
          drills: [
            {
              name: 'Two Knees Down Tennis Ball Receiving',
              duration: 15,
              repetitions: '3 rounds of 20 reps',
              equipment: 'Tennis balls, coach/helper optional',
              instructions: 'Put both knees down on the ground. Start with your bare hand on the ground. If you have a coach, have a coach flip you the ball and you are going to work up from the ground, catch the ball, and then stick it. If you do not have a coach, toss the ball off of a wall and receive it.',
              coachingPoints: 'Make only one move with your hand to the ball. When it comes off the ground, it is a quick and aggressive move to catch the ball. Try to eliminate as much body movement as possible. "Stick it" means you will hold the ball there right after you catch it.'
            }
          ]
        },
        {
          id: 3,
          week: 1,
          title: 'Setups + Tennis Ball Receiving',
          duration: 30,
          learningObjectives: 'Catcher will practice changing stances and then will receive tennis balls from various different setups.',
          drills: [
            {
              name: 'Normal Tennis Ball Receiving with Variable Setups',
              duration: 20,
              repetitions: '3 rounds of 20 reps',
              equipment: 'Tennis balls, catchers mitt, coach/helper',
              instructions: 'Coach/Helper will call out a scenario (i.e. runner on first, 2 strikes, Slider). Then the coach will throw the pitch and catcher will frame the pitch.',
              coachingPoints: 'Focus on consistent setups. Take that feeling of one move to the ball from the knees down receiving. Minimize movement of the body.'
            }
          ]
        },
        {
          id: 4,
          week: 2,
          title: 'Coach Pitch Framing',
          duration: 30,
          learningObjectives: 'Catcher will catch real baseballs thrown by a coach. Moving towards game-like pitching.',
          drills: [
            {
              name: 'Coach Pitch Framing',
              duration: 20,
              repetitions: '3 rounds of 20 reps',
              equipment: 'Baseballs, coach/helper, catchers mitt, catchers gear',
              instructions: 'Choose a scenario, then use the corresponding setup. Stay here for a full round of 20 repetitions. Coach will throw pitches and catcher will frame pitches to the best of his ability. The variability of the live arm will replicate game-like variability.',
              coachingPoints: 'Make sure you get the glove load done early. Limit body movement as much as possible. One move from the ground to the ball.'
            }
          ]
        },
        {
          id: 5,
          week: 2,
          title: 'Long Slow Breaking Balls',
          duration: 30,
          learningObjectives: 'Catcher will learn how to wait and be patient while making the glove move as quick as possible.',
          drills: [
            {
              name: 'Long Slow Breaking Balls',
              duration: 20,
              repetitions: '3 rounds of 20 reps',
              equipment: 'Baseballs, catchers mitt, coach, pitching machine optional',
              instructions: 'Get in your most comfortable setup. If you have a machine, set up 60 feet from machine. Put the machine on slow curveballs landing right behind the plate. If you have a coach, have him throw really big slow curveballs landing right behind the plate. Do your glove load, but wait as long as you can. When you move to catch the ball, it should be a very short and quick move with no body movement.',
              coachingPoints: 'If you are having trouble waiting, put a cone 5 feet in front of you and don\'t move until the ball gets to that cone.'
            }
          ]
        },
        {
          id: 6,
          week: 2,
          title: 'Velocity Framing',
          duration: 30,
          learningObjectives: 'Get used to catching high velocities.',
          drills: [
            {
              name: 'Velocity Framing',
              duration: 20,
              repetitions: '3 rounds of 20 reps',
              equipment: 'Pitching machine, baseballs, catchers gear, catchers glove, coach',
              instructions: 'Get in any one of your stances. Set the machine to a hard fastball. Practice moving the pitch as quickly as you can while limiting body movement. Stick as best you can.',
              coachingPoints: 'If you are having success catching pitches at first, you can move closer to the machine to make it more challenging. Can also work sides of the plate if you are looking for more of a challenge.'
            }
          ]
        }
      ]
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
