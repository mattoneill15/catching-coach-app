import React, { useState, useEffect } from 'react';
import './App.css';

// Import your existing components
import AuthScreen from './AuthScreen.js';
import IntakeQuestionnaire from './IntakeQuestionnaire.js';
import SkillsAssessmentForm from './SkillsAssessmentForm.js';
import DailyCheckin from './DailyCheckin.js';
import WorkoutDisplay from './WorkoutDisplay.js';
import WorkoutExecution from './WorkoutExecution.js';

const App = () => {
  // Main app state management
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [skillsAssessment, setSkillsAssessment] = useState(null);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState('auth'); // auth, onboarding, main, training, workout_execution

  // App state flow: auth → onboarding → main → training → workout_execution
  const [onboardingStep, setOnboardingStep] = useState('intake'); // intake, assessment, complete
  const [trainingStep, setTrainingStep] = useState('checkin'); // checkin, display, execution

  // User session management
  useEffect(() => {
    // Check for existing user session (in a real app, this would be from localStorage or API)
    const savedUser = localStorage.getItem('catching_coach_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        if (userData.profileComplete) {
          setAppState('main');
        } else {
          setAppState('onboarding');
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('catching_coach_user');
      }
    }
  }, []);

  // Authentication handlers
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('catching_coach_user', JSON.stringify(userData));
    
    if (userData.profileComplete) {
      setAppState('main');
    } else {
      setAppState('onboarding');
      setOnboardingStep('intake');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setSkillsAssessment(null);
    setCurrentWorkout(null);
    setActiveTab('home');
    setAppState('auth');
    localStorage.removeItem('catching_coach_user');
  };

  // Onboarding handlers
  const handleIntakeComplete = (intakeData) => {
    setUserProfile(intakeData);
    setOnboardingStep('assessment');
  };

  const handleAssessmentComplete = (assessmentData) => {
    setSkillsAssessment(assessmentData);
    
    // Update user as profile complete
    const updatedUser = { ...currentUser, profileComplete: true };
    setCurrentUser(updatedUser);
    localStorage.setItem('catching_coach_user', JSON.stringify(updatedUser));
    
    setAppState('main');
    setActiveTab('home');
  };

  // Training flow handlers
  const handleStartTraining = () => {
    setAppState('training');
    setTrainingStep('checkin');
    setActiveTab('training');
  };

  const handleCheckinComplete = (checkinData, generatedWorkout) => {
    setCurrentWorkout(generatedWorkout);
    setTrainingStep('display');
  };

  const handleStartWorkout = () => {
    setTrainingStep('execution');
  };

  const handleWorkoutComplete = (workoutData) => {
    // Save workout data (in real app, this would go to database)
    console.log('Workout completed:', workoutData);
    
    // Return to main dashboard
    setAppState('main');
    setTrainingStep('checkin');
    setCurrentWorkout(null);
    setActiveTab('home');
  };

  const handleWorkoutExit = () => {
    setAppState('main');
    setTrainingStep('checkin');
    setCurrentWorkout(null);
    setActiveTab('home');
  };

  // Navigation handlers
  const handleTabChange = (tab) => {
    if (appState === 'main') {
      setActiveTab(tab);
    }
  };

  // Render different app states
  const renderContent = () => {
    switch (appState) {
      case 'auth':
        return (
          <AuthScreen 
            onLogin={handleLogin}
            onSignup={handleLogin}
          />
        );

      case 'onboarding':
        return (
          <div className="onboarding-container">
            {onboardingStep === 'intake' && (
              <IntakeQuestionnaire 
                onComplete={handleIntakeComplete}
              />
            )}
            {onboardingStep === 'assessment' && (
              <SkillsAssessmentForm 
                userProfile={userProfile}
                onComplete={handleAssessmentComplete}
              />
            )}
          </div>
        );

      case 'training':
        return (
          <div className="training-container">
            {trainingStep === 'checkin' && (
              <DailyCheckin 
                userProfile={userProfile}
                onComplete={handleCheckinComplete}
                onCancel={() => setAppState('main')}
              />
            )}
            {trainingStep === 'display' && (
              <WorkoutDisplay 
                workout={currentWorkout}
                onStartWorkout={handleStartWorkout}
                onRegenerateWorkout={() => setTrainingStep('checkin')}
                onBackToDashboard={() => setAppState('main')}
              />
            )}
          </div>
        );

      case 'workout_execution':
        return (
          <WorkoutExecution 
            workout={currentWorkout}
            onWorkoutComplete={handleWorkoutComplete}
            onWorkoutExit={handleWorkoutExit}
          />
        );

      case 'main':
        return (
          <div className="main-app">
            <div className="app-content">
              {renderMainContent()}
            </div>
            <BottomNavigation 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        );

      default:
        return <div className="loading">Loading...</div>;
    }
  };

  // Render main app content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            user={currentUser}
            userProfile={userProfile}
            onStartTraining={handleStartTraining}
            onLogout={handleLogout}
          />
        );

      case 'training':
        return (
          <TrainingHub 
            userProfile={userProfile}
            onStartNewWorkout={handleStartTraining}
          />
        );

      case 'progress':
        return (
          <ProgressDashboard 
            user={currentUser}
            userProfile={userProfile}
          />
        );

      case 'profile':
        return (
          <UserProfile 
            user={currentUser}
            userProfile={userProfile}
            onLogout={handleLogout}
          />
        );

      default:
        return <Dashboard user={currentUser} onStartTraining={handleStartTraining} />;
    }
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
};

// Dashboard Component (Home Tab)
const Dashboard = ({ user, userProfile, onStartTraining, onLogout }) => {
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
        <p>Get your personalized catching workout powered by AI</p>
        <button className="start-training-btn" onClick={onStartTraining}>
          <span className="btn-icon">🚀</span>
          Start Training Session
        </button>
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

// Placeholder components for other tabs (we'll build these next)
const TrainingHub = ({ onStartNewWorkout }) => (
  <div className="training-hub">
    <h2>Training Hub</h2>
    <p>Your workout history and training plans</p>
    <button className="btn-primary" onClick={onStartNewWorkout}>
      Start New Workout
    </button>
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