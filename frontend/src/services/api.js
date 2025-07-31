/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('catching_coach_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await handleResponse(response);
    
    // Store token if registration successful
    if (data.token) {
      localStorage.setItem('catching_coach_token', data.token);
      localStorage.setItem('catching_coach_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Login user
  login: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await handleResponse(response);
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('catching_coach_token', data.token);
      localStorage.setItem('catching_coach_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Verify current session
  verify: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('catching_coach_token');
    localStorage.removeItem('catching_coach_user');
  }
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  // Get workout history
  getWorkoutHistory: async (limit = 10, offset = 0) => {
    const response = await fetch(
      `${API_BASE_URL}/users/workout-history?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  // Get progress stats
  getProgressStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/progress-stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Workout API
export const workoutAPI = {
  // Generate new workout
  generate: async (duration, equipment, preferences = {}) => {
    const response = await fetch(`${API_BASE_URL}/workouts/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ duration, equipment, preferences })
    });
    return handleResponse(response);
  },

  // Start workout session
  start: async (workoutData, workoutType = 'oneoff') => {
    const response = await fetch(`${API_BASE_URL}/workouts/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        workout_data: workoutData, 
        workout_type: workoutType 
      })
    });
    return handleResponse(response);
  },

  // Complete workout session
  complete: async (sessionId, duration, drillsCompleted, skillsFocused, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/workouts/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        session_id: sessionId,
        duration_minutes: duration,
        drills_completed: drillsCompleted,
        skills_focused: skillsFocused,
        completion_notes: notes
      })
    });
    return handleResponse(response);
  },

  // Get workout session details
  getSession: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/workouts/session/${sessionId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get available programs
  getPrograms: async () => {
    const response = await fetch(`${API_BASE_URL}/workouts/programs`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Skills API
export const skillsAPI = {
  // Create skills assessment
  createAssessment: async (skillsData) => {
    const response = await fetch(`${API_BASE_URL}/skills/assessment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(skillsData)
    });
    return handleResponse(response);
  },

  // Get latest skills assessment
  getLatestAssessment: async () => {
    const response = await fetch(`${API_BASE_URL}/skills/assessment/latest`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get all assessments
  getAllAssessments: async (limit = 10, offset = 0) => {
    const response = await fetch(
      `${API_BASE_URL}/skills/assessments?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  // Get skills progress
  getProgress: async () => {
    const response = await fetch(`${API_BASE_URL}/skills/progress`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get skills breakdown
  getBreakdown: async () => {
    const response = await fetch(`${API_BASE_URL}/skills/breakdown`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  return handleResponse(response);
};

export default {
  auth: authAPI,
  user: userAPI,
  workout: workoutAPI,
  skills: skillsAPI,
  healthCheck
};
