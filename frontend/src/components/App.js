import React, { useState, useEffect } from 'react';
import './App.css';

// Import components for simplified flow
import AuthScreen from './AuthScreen.js';
import WorkoutDisplay from './WorkoutDisplay.js';
import WorkoutExecution from './WorkoutExecution.js';
import ProgramsHub from './ProgramsHub.js';

// Note: Removed IntakeQuestionnaire, SkillsAssessmentForm, DailyCheckin for simplified flow

const App = () => {
  // Simplified app state management
  const [currentUser, setCurrentUser] = useState(null);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState('auth'); // auth, main, programs_hub, workout_preview, workout_execution
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [workoutType, setWorkoutType] = useState(null); // 'program' or 'oneoff'
  const [showProgramsHub, setShowProgramsHub] = useState(false);

  // Simplified flow: auth → main → [programs_hub] → workout_preview → workout_execution

  // Simplified user session management
  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('catching_coach_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        setAppState('main'); // Direct to main dashboard
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('catching_coach_user');
      }
    }
  }, []);

  // Simplified authentication handlers
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('catching_coach_user', JSON.stringify(userData));
    setAppState('main'); // Direct to main dashboard
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentWorkout(null);
    setSelectedProgram(null);
    setWorkoutType(null);
    setActiveTab('home');
    setAppState('auth');
    localStorage.removeItem('catching_coach_user');
  };

  // Simplified training flow handlers
  const handleStartProgram = (program) => {
    setSelectedProgram(program);
    setWorkoutType('program');
    // Generate workout based on program (placeholder for now)
    const programWorkout = generateProgramWorkout(program);
    setCurrentWorkout(programWorkout);
    setShowProgramsHub(false);
    setAppState('workout_preview');
  };

  const handleShowProgramsHub = () => {
    setShowProgramsHub(true);
    setAppState('programs_hub');
  };

  const handleBackFromPrograms = () => {
    setShowProgramsHub(false);
    setAppState('main');
  };

  const handleStartOneOffWorkout = (workoutConfig) => {
    setWorkoutType('oneoff');
    // Generate workout based on configuration (placeholder for now)
    const oneOffWorkout = generateOneOffWorkout(workoutConfig);
    setCurrentWorkout(oneOffWorkout);
    setAppState('workout_preview');
  };

  const handleStartWorkout = () => {
    setAppState('workout_execution');
  };

  const handleWorkoutComplete = (workoutData) => {
    // Save workout data (in real app, this would go to database)
    console.log('Workout completed:', workoutData);
    
    // Return to main dashboard
    setAppState('main');
    setCurrentWorkout(null);
    setSelectedProgram(null);
    setWorkoutType(null);
    setActiveTab('home');
  };

  const handleWorkoutExit = () => {
    setAppState('main');
    setCurrentWorkout(null);
    setSelectedProgram(null);
    setWorkoutType(null);
    setShowProgramsHub(false);
    setActiveTab('home');
  };

  // Navigation handlers
  const handleTabChange = (tab) => {
    if (appState === 'main') {
      setActiveTab(tab);
    }
  };

  // Simplified render logic
  const renderContent = () => {
    switch (appState) {
      case 'auth':
        return (
          <AuthScreen 
            onLogin={handleLogin}
          />
        );
      
      case 'programs_hub':
        return (
          <ProgramsHub 
            onStartProgram={handleStartProgram}
            onBack={handleBackFromPrograms}
          />
        );
      
      case 'workout_preview':
        return (
          <WorkoutDisplay 
            workout={currentWorkout}
            workoutType={workoutType}
            selectedProgram={selectedProgram}
            onStart={handleStartWorkout}
            onExit={handleWorkoutExit}
          />
        );
      
      case 'workout_execution':
        return (
          <WorkoutExecution 
            workout={currentWorkout}
            workoutType={workoutType}
            selectedProgram={selectedProgram}
            onComplete={handleWorkoutComplete}
            onExit={handleWorkoutExit}
          />
        );
      
      case 'main':
        return (
          <div className="app-container">
            <div className="main-content">
              {renderMainContent()}
            </div>
            <BottomNavigation 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
            />
          </div>
        );
      
      default:
        return <div>Loading...</div>;
    }
  };

  // Render main app content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            user={currentUser}
            onStartProgram={handleShowProgramsHub}
            onStartOneOffWorkout={handleStartOneOffWorkout}
            onLogout={handleLogout}
          />
        );
      case 'training':
        return (
          <TrainingHub 
            onStartProgram={handleShowProgramsHub}
            onStartOneOffWorkout={handleStartOneOffWorkout}
          />
        );
      case 'progress':
        return (
          <ProgressDashboard 
            user={currentUser}
          />
        );
      case 'profile':
        return (
          <UserProfile 
            user={currentUser}
            onLogout={handleLogout}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  // Placeholder workout generation functions (will be enhanced later)
  const generateProgramWorkout = (program) => {
    // Placeholder: Generate workout based on program
    return {
      id: Date.now(),
      type: 'program',
      programName: program.name,
      title: `${program.name} - Week ${program.currentWeek}, Day ${program.currentDay}`,
      duration: program.sessionDuration || 30,
      exercises: [
        { name: 'Placeholder Exercise 1', duration: 10, description: 'Program-based exercise' },
        { name: 'Placeholder Exercise 2', duration: 15, description: 'Program-based exercise' },
        { name: 'Placeholder Exercise 3', duration: 5, description: 'Program-based exercise' }
      ]
    };
  };

  const generateOneOffWorkout = (config) => {
    // Placeholder: Generate workout based on configuration
    return {
      id: Date.now(),
      type: 'oneoff',
      title: `${config.category} Focus Session`,
      duration: config.duration || 30,
      difficulty: config.difficulty || 'intermediate',
      exercises: [
        { name: 'Placeholder Drill 1', duration: 10, description: `${config.category} focused drill` },
        { name: 'Placeholder Drill 2', duration: 15, description: `${config.category} focused drill` },
        { name: 'Placeholder Drill 3', duration: 5, description: `${config.category} focused drill` }
      ]
    };
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
};

// Dashboard Component (Home Tab) - Updated for simplified flow
const Dashboard = ({ user, onStartProgram, onStartOneOffWorkout, onLogout }) => {
  const [currentStreak, setCurrentStreak] = useState(3); // Mock data - would come from backend
  const [totalWorkouts, setTotalWorkouts] = useState(12); // Mock data
  const [weeklyGoal, setWeeklyGoal] = useState(4); // Mock data
  const [weeklyProgress, setWeeklyProgress] = useState(2); // Mock data

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'Catcher'}!</h1>
          <p className="date">{today}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{currentStreak}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div className="stat-card workouts">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <h3>{totalWorkouts}</h3>
            <p>Total Workouts</p>
          </div>
        </div>

        <div className="stat-card weekly">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{weeklyProgress}/{weeklyGoal}</h3>
            <p>This Week</p>
          </div>
        </div>
      </div>

      <div className="main-action">
        <h2>Ready to Train?</h2>
        <p>Choose your training path</p>
        <div className="training-options">
          <button className="start-program-btn" onClick={onStartProgram}>
            <span className="btn-icon">🏆</span>
            Browse Programs
          </button>
          <button className="start-oneoff-btn" onClick={() => onStartOneOffWorkout({ category: 'Receiving & Framing', duration: 30, difficulty: 'intermediate' })}>
            <span className="btn-icon">⚡</span>
            Quick Workout
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">💪</div>
            <div className="activity-content">
              <p><strong>Receiving Focus Workout</strong></p>
              <p className="activity-meta">Yesterday • 30 minutes • Completed</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">⚙️</div>
            <div className="activity-content">
              <p><strong>Throwing Mechanics Session</strong></p>
              <p className="activity-meta">2 days ago • 25 minutes • Completed</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🧠</div>
            <div className="activity-content">
              <p><strong>Game Management Training</strong></p>
              <p className="activity-meta">3 days ago • 20 minutes • Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'training', label: 'Training', icon: '💪' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="bottom-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// Updated TrainingHub component for new flow
const TrainingHub = ({ onStartProgram, onStartOneOffWorkout }) => (
  <div className="training-hub">
    <h2>Training Hub</h2>
    <div className="training-sections">
      <div className="training-section">
        <h3>📚 Programs</h3>
        <p>Structured multi-week training plans</p>
        <button className="btn-primary" onClick={onStartProgram}>
          Browse Programs
        </button>
      </div>
      <div className="training-section">
        <h3>⚡ Quick Workouts</h3>
        <p>Focus on specific skills today</p>
        <button className="btn-secondary" onClick={() => onStartOneOffWorkout({ category: 'Blocking & Recovery', duration: 30 })}>
          Create Workout
        </button>
      </div>
    </div>
  </div>
);

const ProgressDashboard = ({ user }) => (
  <div className="progress-dashboard">
    <h2>Progress Dashboard</h2>
    <p>Track your improvement over time</p>
  </div>
);

const UserProfile = ({ user, onLogout }) => (
  <div className="user-profile">
    <h2>Profile Settings</h2>
    <p>Manage your account and preferences</p>
    <button className="btn-secondary" onClick={onLogout}>
      Logout
    </button>
  </div>
);

export default App;