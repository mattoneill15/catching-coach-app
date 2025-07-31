import React, { useState, useEffect } from 'react';
import './App.css';

// Import components
import AuthScreen from './AuthScreen.js';
import WorkoutDisplay from './WorkoutDisplay.js';
import ProgramWorkoutDisplay from './ProgramWorkoutDisplay.js';
import WorkoutExecution from './WorkoutExecution.js';
import ProgramWorkoutExecution from './ProgramWorkoutExecution.js';
import ProgramsHub from './ProgramsHub.js';
import IntakeQuestionnaire from './IntakeQuestionnaire.js';
import SkillsAssessmentForm from './SkillsAssessmentForm.js';

// Import API hooks and service
import { useAuth, useWorkoutGeneration, useWorkoutSession, useSkillsAssessment, useUserProgress } from '../hooks/useAPI.js';
import api from '../services/api.js';

const App = () => {
  // Real authentication and API integration
  const { user: currentUser, loading: authLoading, login, register, logout, isAuthenticated } = useAuth();
  const { generateWorkout, workout: generatedWorkout, loading: workoutLoading } = useWorkoutGeneration();
  const { start: startWorkoutSession, complete: completeWorkoutSession, currentSession } = useWorkoutSession();
  const { latestAssessment, fetchLatest: fetchLatestAssessment, create: createAssessment } = useSkillsAssessment();
  const { stats: progressStats, fetchStats: fetchProgressStats } = useUserProgress();
  
  // App state management
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState('loading'); // loading, auth, onboarding, main, etc.
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [workoutType, setWorkoutType] = useState(null); // 'program' or 'oneoff'
  const [showProgramsHub, setShowProgramsHub] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Real authentication flow: loading → auth → [onboarding] → main → workout flows

  // Initialize app state based on authentication
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        // Check if user needs onboarding (skills assessment)
        checkOnboardingStatus();
      } else {
        setAppState('auth');
      }
    }
  }, [authLoading, isAuthenticated]);

  const checkOnboardingStatus = async () => {
    try {
      await fetchLatestAssessment();
      setAppState('main');
    } catch (error) {
      // No skills assessment found - user needs onboarding
      setNeedsOnboarding(true);
      setAppState('onboarding');
    }
  };

  // Real authentication handlers
  const handleLogin = async (email) => {
    try {
      await login(email);
      // Auth hook will update user state, useEffect will handle app state
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await register(userData);
      setNeedsOnboarding(true);
      setAppState('onboarding');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentWorkout(null);
    setSelectedProgram(null);
    setWorkoutType(null);
    setActiveTab('home');
    setAppState('auth');
    setNeedsOnboarding(false);
  };

  // Onboarding handlers
  const handleCompleteIntake = async (intakeData) => {
    try {
      // Save intake data to user profile
      const profileUpdate = {
        name: currentUser?.name, // Keep existing name
        age: parseInt(intakeData.age) || null,
        experience_level: intakeData.experience_level,
        years_catching: parseInt(intakeData.years_experience) || null, // Backend expects years_catching
        goals: intakeData.goals || [],
        equipment_access: intakeData.equipment_access || [],
        training_preferences: {
          preferred_session_length: intakeData.preferred_session_length,
          training_frequency: intakeData.training_frequency,
          training_focus: intakeData.training_focus,
          position: intakeData.position,
          school_team: intakeData.school_team
        }
      };
      
      // Call API to update user profile
      await api.user.updateProfile(profileUpdate);
      
      // Move to skills assessment
      setAppState('skills_assessment');
    } catch (error) {
      console.error('Failed to save intake data:', error);
      throw error; // This will be caught by IntakeQuestionnaire and show error message
    }
  };

  const handleCompleteSkillsAssessment = async (skillsData) => {
    try {
      // Frontend field names match database schema, so pass through directly
      const assessmentData = {
        ...skillsData,
        assessment_notes: skillsData.assessment_notes || '',
        assessment_type: 'self_rated' // Must match database constraint
      };
      
      // Create assessment and get the complete data back
      const response = await createAssessment(assessmentData);
      
      // The assessment data is automatically managed by the useSkillsAssessment hook
      // No need to manually store it in state
      
      setNeedsOnboarding(false);
      setAppState('main');
    } catch (error) {
      console.error('Failed to save skills assessment:', error);
      throw error;
    }
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
    setActiveTab('training'); // Return to training tab when backing out of programs
  };

  const handleStartOneOffWorkout = async (workoutConfig) => {
    try {
      setWorkoutType('oneoff');
      // Generate workout using real AI algorithm
      const result = await generateWorkout(
        workoutConfig.duration || 30,
        workoutConfig.equipment || currentUser?.equipment_access || {},
        workoutConfig.preferences || {}
      );
      setCurrentWorkout(result.workout);
      setAppState('workout_preview');
    } catch (error) {
      console.error('Failed to generate workout:', error);
      // Fallback to basic workout structure
      const fallbackWorkout = generateFallbackWorkout(workoutConfig);
      setCurrentWorkout(fallbackWorkout);
      setAppState('workout_preview');
    }
  };

  const handleStartWorkout = async () => {
    try {
      // Start workout session in database
      await startWorkoutSession(currentWorkout, workoutType);
      setAppState('workout_execution');
    } catch (error) {
      console.error('Failed to start workout session:', error);
      // Continue anyway - we can still track locally
      setAppState('workout_execution');
    }
  };

  const handleWorkoutComplete = async (workoutData) => {
    try {
      // Save workout completion to database
      if (currentSession) {
        await completeWorkoutSession(
          currentSession.session_id,
          workoutData.duration,
          workoutData.drillsCompleted || [],
          workoutData.skillsFocused || [],
          workoutData.notes || ''
        );
      }
      
      // Refresh progress stats
      await fetchProgressStats();
      
      console.log('Workout completed and saved:', workoutData);
    } catch (error) {
      console.error('Failed to save workout completion:', error);
    } finally {
      // Return to main dashboard regardless of save success
      setAppState('main');
      setCurrentWorkout(null);
      setSelectedProgram(null);
      setWorkoutType(null);
      setActiveTab('home');
    }
  };

  const handleWorkoutExit = () => {
    console.log('🏠 handleWorkoutExit called - navigating back to dashboard');
    console.log('Current appState:', appState);
    setAppState('main');
    setCurrentWorkout(null);
    setSelectedProgram(null);
    setWorkoutType(null);
    setShowProgramsHub(false);
    setActiveTab('home');
    console.log('🏠 Navigation state updated - should return to dashboard');
  };

  // Navigation handlers
  const handleTabChange = (tab) => {
    if (appState === 'main') {
      setActiveTab(tab);
    }
  };

  // Enhanced render logic with onboarding
  const renderContent = () => {
    if (authLoading || appState === 'loading') {
      return (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Catching Coach...</p>
        </div>
      );
    }

    if (appState === 'auth') {
      return (
        <AuthScreen 
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );
    }

    if (appState === 'onboarding') {
      return (
        <IntakeQuestionnaire 
          userProfile={currentUser}
          onIntakeComplete={handleCompleteIntake}
        />
      );
    }

    if (appState === 'skills_assessment') {
      return (
        <SkillsAssessmentForm 
          userProfile={currentUser}
          onAssessmentComplete={handleCompleteSkillsAssessment}
        />
      );
    }

    if (appState === 'programs_hub') {
      return (
        <ProgramsHub 
          onStartProgram={handleStartProgram}
          onBack={handleBackFromPrograms}
        />
      );
    }

    if (appState === 'workout_preview') {
      if (workoutType === 'program') {
        return (
          <ProgramWorkoutDisplay 
            program={selectedProgram}
            workout={currentWorkout}
            onStart={handleStartWorkout}
            onBackToDashboard={handleWorkoutExit}
            loading={workoutLoading}
          />
        );
      } else {
        return (
          <WorkoutDisplay 
            workout={currentWorkout}
            onStart={handleStartWorkout}
            onBackToDashboard={handleWorkoutExit}
            loading={workoutLoading}
          />
        );
      }
    }

    if (appState === 'workout_execution') {
      if (workoutType === 'program') {
        return (
          <ProgramWorkoutExecution 
            program={selectedProgram}
            workout={currentWorkout}
            session={currentSession}
            onWorkoutComplete={handleWorkoutComplete}
            onWorkoutExit={handleWorkoutExit}
          />
        );
      } else {
        return (
          <WorkoutExecution 
            workout={currentWorkout}
            session={currentSession}
            onComplete={handleWorkoutComplete}
            onWorkoutExit={handleWorkoutExit}
          />
        );
      }
    }

    // Main app with bottom navigation
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
            progressStats={progressStats}
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

  // Fallback workout generation for error cases
  const generateFallbackWorkout = (config) => {
    return {
      fallback: true,
      message: "Generated basic workout due to connection issue",
      workout: {
        warmup: {
          total_duration: Math.max(2, Math.floor((config.duration || 30) * 0.15)),
          drills: [{
            name: "Basic Warmup",
            instructions: "Light stretching and movement to prepare for training",
            duration: Math.max(2, Math.floor((config.duration || 30) * 0.15))
          }]
        },
        main_work: {
          total_duration: Math.floor((config.duration || 30) * 0.7),
          drills: [{
            name: "General Catching Practice",
            instructions: "Work on basic catching fundamentals with available equipment",
            duration: Math.floor((config.duration || 30) * 0.7)
          }]
        },
        cooldown: {
          total_duration: Math.max(1, Math.floor((config.duration || 30) * 0.15)),
          drills: [{
            name: "Light Stretching",
            instructions: "Gentle stretching to cool down",
            duration: Math.max(1, Math.floor((config.duration || 30) * 0.15))
          }]
        }
      }
    };
  };

  // Real workout generation from program data
  const generateProgramWorkout = (program) => {
    // Calculate which session to show based on current week and day
    const sessionIndex = ((program.currentWeek - 1) * 3) + (program.currentDay - 1);
    const session = program.sessions?.[sessionIndex];
    
    if (!session) {
      // Fallback for programs without detailed sessions
      return {
        id: Date.now(),
        type: 'program',
        programName: program.name,
        title: `${program.name} - Week ${program.currentWeek}, Day ${program.currentDay}`,
        duration: program.sessionDuration || 30,
        exercises: [
          { name: 'Program Exercise', duration: 20, description: 'Complete the assigned drills for this session' }
        ]
      };
    }
    
    // Generate workout from real session data
    return {
      id: Date.now(),
      type: 'program',
      programName: program.name,
      sessionId: session.id,
      title: `${program.name} - Week ${session.week}, Session ${session.id}`,
      sessionTitle: session.title,
      duration: session.duration,
      learningObjectives: session.learningObjectives,
      exercises: session.drills.map(drill => ({
        name: drill.name,
        duration: drill.duration,
        repetitions: drill.repetitions,
        equipment: drill.equipment,
        instructions: drill.instructions,
        coachingPoints: drill.coachingPoints,
        scenarios: drill.scenarios || []
      }))
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

// Progress Dashboard Component
const ProgressDashboard = ({ user, progressStats }) => {
  const stats = progressStats || {
    total_workouts: 0,
    current_streak: 0,
    completed_workouts: 0
  };

  return (
    <div className="progress-dashboard">
      <div className="progress-header">
        <h1>Your Progress</h1>
        <p>Track your catching development journey</p>
      </div>
      
      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.completed_workouts}</div>
          <div className="stat-label">Workouts Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats.current_streak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{stats.total_workouts}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
      </div>
      
      <div className="progress-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {stats.last_workout_date ? (
            <div className="activity-item">
              <span className="activity-icon">🥎</span>
              <div className="activity-details">
                <div className="activity-title">Last Workout</div>
                <div className="activity-time">
                  {new Date(stats.last_workout_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="activity-item">
              <span className="activity-icon">🎯</span>
              <div className="activity-details">
                <div className="activity-title">Ready to start your first workout?</div>
                <div className="activity-time">Let's get training!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// User Profile Component
const UserProfile = ({ user, onLogout }) => (
  <div className="user-profile">
    <div className="profile-header">
      <div className="profile-avatar">
        <span className="avatar-icon">👤</span>
      </div>
      <div className="profile-info">
        <h2>{user?.name || 'Demo User'}</h2>
        <p className="profile-email">{user?.email || 'demo@catchingcoach.com'}</p>
      </div>
    </div>
    
    <div className="profile-sections">
      <div className="profile-section">
        <h3>Account Settings</h3>
        <div className="setting-item">
          <span className="setting-icon">📧</span>
          <span className="setting-label">Email Notifications</span>
          <span className="setting-value">Enabled</span>
        </div>
        <div className="setting-item">
          <span className="setting-icon">🔔</span>
          <span className="setting-label">Workout Reminders</span>
          <span className="setting-value">Daily at 6:00 PM</span>
        </div>
      </div>
      
      <div className="profile-section">
        <h3>Training Preferences</h3>
        <div className="setting-item">
          <span className="setting-icon">⏱️</span>
          <span className="setting-label">Default Session Length</span>
          <span className="setting-value">30 minutes</span>
        </div>
        <div className="setting-item">
          <span className="setting-icon">🎯</span>
          <span className="setting-label">Skill Focus</span>
          <span className="setting-value">All-Around</span>
        </div>
      </div>
    </div>
    
    <div className="profile-actions">
      <button className="logout-btn" onClick={onLogout}>
        <span className="btn-icon">🚪</span>
        Logout
      </button>
    </div>
  </div>
);

export default App;