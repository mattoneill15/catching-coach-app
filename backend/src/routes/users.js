/**
 * User Management Routes
 * Handles user profile operations and data management
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT user_id, name, email, age, height, weight, primary_position,
              experience_level, years_catching, fastest_velocity_caught,
              goals, equipment_access, training_preferences, created_at, updated_at
       FROM user_profiles WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      experience_level,
      years_catching,
      fastest_velocity_caught,
      goals,
      equipment_access,
      training_preferences
    } = req.body;

    const updateQuery = `
      UPDATE user_profiles SET
        name = COALESCE($2, name),
        age = COALESCE($3, age),
        height = COALESCE($4, height),
        weight = COALESCE($5, weight),
        experience_level = COALESCE($6, experience_level),
        years_catching = COALESCE($7, years_catching),
        fastest_velocity_caught = COALESCE($8, fastest_velocity_caught),
        goals = COALESCE($9, goals),
        equipment_access = COALESCE($10, equipment_access),
        training_preferences = COALESCE($11, training_preferences),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING user_id, name, email, age, experience_level, updated_at
    `;

    const result = await query(updateQuery, [
      req.user.userId,
      name,
      age,
      height,
      weight,
      experience_level,
      years_catching,
      fastest_velocity_caught,
      goals ? JSON.stringify(goals) : null,
      equipment_access ? JSON.stringify(equipment_access) : null,
      training_preferences ? JSON.stringify(training_preferences) : null
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's workout history
router.get('/workout-history', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(
      `SELECT session_id, workout_type, planned_duration, actual_duration, 
              completion_status, completed_drills, skills_focused, 
              started_at, completed_at, user_notes
       FROM workout_sessions 
       WHERE user_id = $1 AND completion_status = 'completed'
       ORDER BY completed_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    // Transform the data to match frontend expectations
    const workouts = result.rows.map(workout => {
      let programInfo = null;
      
      // Try to parse program info from user_notes if it's a program workout
      if (workout.workout_type === 'program' && workout.user_notes) {
        try {
          const notes = JSON.parse(workout.user_notes);
          if (notes.program_id) {
            programInfo = {
              program_id: notes.program_id,
              program_name: notes.program_name,
              session_number: notes.session_number,
              session_title: notes.session_title
            };
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      return {
        session_id: workout.session_id,
        workout_type: workout.workout_type,
        duration_minutes: workout.actual_duration || workout.planned_duration,
        actual_duration: workout.actual_duration,
        planned_duration: workout.planned_duration,
        completion_status: workout.completion_status,
        completed_drills: workout.completed_drills,
        skills_focused: workout.skills_focused,
        started_at: workout.started_at,
        completed_at: workout.completed_at,
        program_name: programInfo?.program_name,
        session_title: programInfo?.session_title
      };
    });

    res.json({ workouts });

  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ error: 'Failed to get workout history' });
  }
});

// Get user's progress stats
router.get('/progress-stats', authenticateToken, async (req, res) => {
  try {
    // Get basic workout stats
    const workoutStats = await query(
      `SELECT 
         COUNT(*) as total_workouts,
         COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_workouts,
         AVG(actual_duration) as avg_duration,
         MAX(completed_at) as last_workout_date
       FROM workout_sessions 
       WHERE user_id = $1`,
      [req.user.userId]
    );

    // Get current streak (consecutive days with workouts)
    const streakQuery = `
      WITH daily_workouts AS (
        SELECT DATE(completed_at) as workout_date
        FROM workout_sessions 
        WHERE user_id = $1 AND completion_status = 'completed' AND completed_at IS NOT NULL
        GROUP BY DATE(completed_at)
        ORDER BY DATE(completed_at) DESC
      ),
      streak_calc AS (
        SELECT workout_date,
               ROW_NUMBER() OVER (ORDER BY workout_date DESC) as rn,
               workout_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY workout_date DESC) - 1) as streak_date
        FROM daily_workouts
      )
      SELECT COUNT(*) as current_streak
      FROM streak_calc
      WHERE streak_date = (SELECT MAX(streak_date) FROM streak_calc)
    `;

    const streakResult = await query(streakQuery, [req.user.userId]);

    // Get recent skills assessment if available
    const latestAssessment = await query(
      `SELECT assessment_id, created_at
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.userId]
    );

    const stats = workoutStats.rows[0];
    const streak = streakResult.rows[0]?.current_streak || 0;
    const assessment = latestAssessment.rows[0] || null;

    res.json({
      total_workouts: parseInt(stats.total_workouts),
      completed_workouts: parseInt(stats.completed_workouts),
      avg_duration: parseFloat(stats.avg_duration) || 0,
      current_streak: parseInt(streak),
      last_workout_date: stats.last_workout_date,
      latest_assessment: assessment
    });

  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ error: 'Failed to get progress stats' });
  }
});

export default router;
