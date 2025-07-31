/**
 * Workout Routes
 * Handles workout generation, execution, and management
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from './auth.js';
import WorkoutGenerationAlgorithm from '../WorkoutGenerationAlgorithm.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const workoutGenerator = new WorkoutGenerationAlgorithm();

// Generate a new workout
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { duration, equipment, preferences = {} } = req.body;

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' });
    }

    // Get user profile
    const userResult = await query(
      `SELECT user_id, name, age, experience_level, years_catching,
              goals, equipment_access, training_preferences
       FROM user_profiles WHERE user_id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = userResult.rows[0];

    // Get latest skills assessment
    const assessmentResult = await query(
      `SELECT assessment_id, receiving_glove_move, receiving_glove_load, receiving_setups, receiving_presentation,
              throwing_footwork, throwing_exchange, throwing_arm_strength, throwing_accuracy, blocking_overall,
              education_pitch_calling, education_scouting_reports, education_umpire_relations, education_pitcher_relations,
              created_at
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.userId]
    );

    let skillsAssessment = null;
    if (assessmentResult.rows.length > 0) {
      skillsAssessment = assessmentResult.rows[0];
    } else {
      // Create default assessment for new users
      skillsAssessment = {
        receiving_glove_move: 5,
        receiving_glove_load: 5,
        receiving_setups: 5,
        receiving_presentation: 5,
        throwing_footwork: 5,
        throwing_exchange: 5,
        throwing_arm_strength: 5,
        throwing_accuracy: 5,
        blocking_overall: 5,
        education_pitch_calling: 5,
        education_scouting_reports: 5,
        education_umpire_relations: 5,
        education_pitcher_relations: 5,
        created_at: new Date()
      };
    }

    // Use provided equipment or user's default equipment
    const availableEquipment = equipment || userProfile.equipment_access || {};

    // Generate workout using the AI algorithm
    const workout = await workoutGenerator.generateWorkout(
      userProfile,
      skillsAssessment,
      availableEquipment,
      duration,
      { ...userProfile.training_preferences, ...preferences }
    );

    res.json({
      message: 'Workout generated successfully',
      workout,
      user_profile: {
        name: userProfile.name,
        experience_level: userProfile.experience_level
      },
      assessment_date: skillsAssessment.created_at
    });

  } catch (error) {
    console.error('Workout generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate workout',
      details: error.message 
    });
  }
});

// Start a workout session
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { workout_data, workout_type = 'oneoff' } = req.body;

    if (!workout_data) {
      return res.status(400).json({ error: 'Workout data is required' });
    }

    const sessionId = uuidv4();
    
    // Calculate planned duration from workout structure
    let plannedDuration = 0;
    
    // Try different ways to get duration from workout data
    if (workout_data.duration) {
      plannedDuration = workout_data.duration;
    } else if (workout_data.time_allocation) {
      plannedDuration = Object.values(workout_data.time_allocation)
        .reduce((sum, time) => sum + time, 0);
    } else if (workout_data.phases) {
      plannedDuration = workout_data.phases
        .reduce((sum, phase) => sum + (phase.duration || 0), 0);
    } else {
      // Fallback to a default duration if none found
      plannedDuration = 30;
    }
    
    // Ensure duration is at least 1 to satisfy database constraint
    if (plannedDuration <= 0) {
      plannedDuration = 30;
    }

    const insertQuery = `
      INSERT INTO workout_sessions (
        session_id, user_id, planned_duration,
        workout_structure, completion_status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING session_id, started_at
    `;

    const result = await query(insertQuery, [
      sessionId,
      req.user.userId,
      plannedDuration,
      JSON.stringify(workout_data),
      'in_progress'
    ]);

    res.json({
      message: 'Workout session started',
      session: {
        session_id: result.rows[0].session_id,
        started_at: result.rows[0].started_at,
        planned_duration: plannedDuration
      }
    });

  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({ error: 'Failed to start workout session' });
  }
});

// Complete a workout session
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { 
      session_id, 
      duration_minutes, 
      drills_completed, 
      skills_focused,
      completion_notes 
    } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const updateQuery = `
      UPDATE workout_sessions SET
        actual_duration = $3,
        completed_drills = $4,
        user_notes = $5,
        completion_status = 'completed',
        completed_at = NOW()
      WHERE session_id = $1 AND user_id = $2
      RETURNING session_id, actual_duration, completed_at
    `;

    const result = await query(updateQuery, [
      session_id,
      req.user.userId,
      duration_minutes,
      JSON.stringify(drills_completed || []),
      completion_notes
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    res.json({
      message: 'Workout completed successfully',
      session: result.rows[0]
    });

  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
});

// Get workout session details
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await query(
      `SELECT session_id, workout_type, planned_duration_minutes, duration_minutes,
              workout_structure, drills_completed, skills_focused, completion_notes,
              session_status, completion_status, created_at, completed_at
       FROM workout_sessions 
       WHERE session_id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    res.json({ session: result.rows[0] });

  } catch (error) {
    console.error('Get workout session error:', error);
    res.status(500).json({ error: 'Failed to get workout session' });
  }
});

// Get available programs (placeholder for future expansion)
router.get('/programs', authenticateToken, async (req, res) => {
  try {
    // For now, return a basic program structure
    const programs = [
      {
        id: 'framing-fundamentals',
        name: 'Framing Fundamentals',
        description: 'Master the art of pitch framing with progressive drills',
        duration_weeks: 4,
        sessions_per_week: 3,
        difficulty: 'beginner',
        focus_areas: ['receiving', 'presentation'],
        equipment_required: ['tennis_balls', 'catchers_gear']
      },
      {
        id: 'blocking-mastery',
        name: 'Blocking Mastery',
        description: 'Develop elite blocking skills and recovery techniques',
        duration_weeks: 6,
        sessions_per_week: 2,
        difficulty: 'intermediate',
        focus_areas: ['blocking'],
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate']
      }
    ];

    res.json({ programs });

  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ error: 'Failed to get programs' });
  }
});

export default router;
