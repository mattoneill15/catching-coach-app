/**
 * Custom React Hooks for API Integration
 * Provides easy-to-use hooks for API calls with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

// Generic hook for API calls with loading and error states
export const useAPICall = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
};

// Hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('catching_coach_user');
        const token = localStorage.getItem('catching_coach_token');
        
        if (savedUser && token) {
          // Verify token is still valid
          const response = await api.auth.verify();
          setUser(response.user);
        }
      } catch (err) {
        console.log('Session verification failed:', err.message);
        // Clear invalid session
        api.auth.logout();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.login(email);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setError(null);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};

// Hook for workout generation
export const useWorkoutGeneration = () => {
  const { data, loading, error, execute } = useAPICall(api.workout.generate);

  const generateWorkout = useCallback(async (duration, equipment, preferences = {}) => {
    return execute(duration, equipment, preferences);
  }, [execute]);

  return {
    workout: data?.workout,
    loading,
    error,
    generateWorkout
  };
};

// Hook for workout sessions
export const useWorkoutSession = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const { execute: startSession, loading: startLoading } = useAPICall(api.workout.start);
  const { execute: completeSession, loading: completeLoading } = useAPICall(api.workout.complete);

  const start = useCallback(async (workoutData, workoutType = 'oneoff') => {
    const response = await startSession(workoutData, workoutType);
    setCurrentSession(response.session);
    return response;
  }, [startSession]);

  const complete = useCallback(async (sessionId, duration, drillsCompleted, skillsFocused, notes = '') => {
    const response = await completeSession(sessionId, duration, drillsCompleted, skillsFocused, notes);
    setCurrentSession(null);
    return response;
  }, [completeSession]);

  return {
    currentSession,
    start,
    complete,
    loading: startLoading || completeLoading
  };
};

// Hook for skills assessment
export const useSkillsAssessment = () => {
  const { data: latestAssessment, loading, error, execute: getLatest } = useAPICall(api.skills.getLatestAssessment);
  const { execute: createAssessment, loading: createLoading } = useAPICall(api.skills.createAssessment);
  const { execute: getBreakdown } = useAPICall(api.skills.getBreakdown);

  const create = useCallback(async (skillsData) => {
    const response = await createAssessment(skillsData);
    // Refresh latest assessment after creating new one
    await getLatest();
    return response;
  }, [createAssessment, getLatest]);

  const fetchLatest = useCallback(async () => {
    return getLatest();
  }, [getLatest]);

  const fetchBreakdown = useCallback(async () => {
    return getBreakdown();
  }, [getBreakdown]);

  return {
    latestAssessment: latestAssessment?.assessment,
    loading: loading || createLoading,
    error,
    create,
    fetchLatest,
    fetchBreakdown
  };
};

// Hook for user progress
export const useUserProgress = () => {
  const { data: stats, loading, error, execute: getStats } = useAPICall(api.user.getProgressStats);
  const { execute: getHistory } = useAPICall(api.user.getWorkoutHistory);

  const fetchStats = useCallback(async () => {
    return getStats();
  }, [getStats]);

  const fetchHistory = useCallback(async (limit = 10, offset = 0) => {
    return getHistory(limit, offset);
  }, [getHistory]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    fetchHistory
  };
};

// Hook for user profile
export const useUserProfile = () => {
  const { data: profile, loading, error, execute: getProfile } = useAPICall(api.user.getProfile);
  const { execute: updateProfile, loading: updateLoading } = useAPICall(api.user.updateProfile);

  const fetch = useCallback(async () => {
    return getProfile();
  }, [getProfile]);

  const update = useCallback(async (profileData) => {
    const response = await updateProfile(profileData);
    // Refresh profile after update
    await getProfile();
    return response;
  }, [updateProfile, getProfile]);

  return {
    profile: profile?.user,
    loading: loading || updateLoading,
    error,
    fetch,
    update
  };
};
