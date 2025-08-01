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
    const { workout_data, workout_type = 'oneoff', program_info } = req.body;

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

    // Prepare program tracking info
    const programNotes = program_info ? JSON.stringify({
      program_id: program_info.program_id,
      program_name: program_info.program_name,
      session_number: program_info.session_number,
      session_title: program_info.session_title
    }) : null;

    const insertQuery = `
      INSERT INTO workout_sessions (
        session_id, user_id, planned_duration,
        workout_structure, completion_status, user_notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING session_id, started_at
    `;

    const result = await query(insertQuery, [
      sessionId,
      req.user.userId,
      plannedDuration,
      JSON.stringify(workout_data),
      'in_progress',
      programNotes
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

// Complete a workout session with program progression
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { 
      session_id, 
      duration_minutes, 
      drills_completed, 
      skills_focused,
      completion_notes,
      workout_data,
      program_info 
    } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get the current session details
    const sessionResult = await query(
      `SELECT session_id, user_id, workout_type, user_notes, workout_structure
       FROM workout_sessions 
       WHERE session_id = $1`,
      [session_id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    const session = sessionResult.rows[0];
    let programProgressInfo = null;
    let nextWorkout = null;

    // Handle program progression if this is a program workout
    if (session.workout_type === 'program' && program_info) {
      programProgressInfo = await handleProgramProgression(
        session.user_id, 
        program_info, 
        duration_minutes,
        drills_completed,
        skills_focused
      );
      
      // Generate next workout if program continues
      if (!programProgressInfo.program_completed) {
        nextWorkout = await generateNextProgramWorkout(
          session.user_id,
          program_info.program_id,
          programProgressInfo.next_session_number
        );
      }
    }

    // Update the workout session with completion data
    const updateResult = await query(
      `UPDATE workout_sessions 
       SET completion_status = 'completed',
           completed_at = NOW(),
           actual_duration = $2,
           completed_drills = $3,
           user_notes = $4,
           skills_focused = $5
       WHERE session_id = $1
       RETURNING session_id, user_id, workout_type, completed_at, actual_duration`,
      [
        session_id, 
        duration_minutes, 
        JSON.stringify(drills_completed || []), 
        completion_notes || '',
        JSON.stringify(skills_focused || [])
      ]
    );

    // Update user's progress stats
    await updateUserProgressStats(session.user_id, duration_minutes, skills_focused);

    res.json({
      message: 'Workout completed successfully',
      session: updateResult.rows[0],
      program_progress: programProgressInfo,
      next_workout: nextWorkout,
      completion_summary: {
        duration_minutes,
        drills_completed: drills_completed?.length || 0,
        skills_focused: skills_focused || [],
        program_completed: programProgressInfo?.program_completed || false
      }
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

// Get program progress for a user
router.get('/program-progress/:program_id', authenticateToken, async (req, res) => {
  try {
    const { program_id } = req.params;
    
    // Get all completed sessions for this program
    const completedSessions = await query(
      `SELECT user_notes, completed_at, actual_duration
       FROM workout_sessions 
       WHERE user_id = $1 
         AND completion_status = 'completed'
         AND user_notes IS NOT NULL
         AND user_notes::text LIKE '%"program_id":"' || $2 || '"%'
       ORDER BY completed_at ASC`,
      [req.user.userId, program_id]
    );

    // Parse program info from completed sessions
    const completedSessionNumbers = [];
    let programName = null;
    
    completedSessions.rows.forEach(session => {
      try {
        const programInfo = JSON.parse(session.user_notes);
        if (programInfo.program_id === program_id) {
          completedSessionNumbers.push(programInfo.session_number);
          if (!programName) programName = programInfo.program_name;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Determine next session number
    const nextSessionNumber = completedSessionNumbers.length > 0 
      ? Math.max(...completedSessionNumbers) + 1 
      : 1;

    res.json({
      program_id,
      program_name: programName,
      completed_sessions: completedSessionNumbers.sort((a, b) => a - b),
      next_session_number: nextSessionNumber,
      total_completed: completedSessionNumbers.length
    });

  } catch (error) {
    console.error('Get program progress error:', error);
    res.status(500).json({ error: 'Failed to get program progress' });
  }
});

// Helper function to handle program progression
async function handleProgramProgression(userId, programInfo, durationMinutes, drillsCompleted, skillsFocused) {
  try {
    const { program_id, program_name, session_number, session_title } = programInfo;
    
    // Get program definition to check total sessions
    const programDefinitions = {
      'framing-fundamentals': { total_sessions: 12, sessions_per_week: 3 },
      'blocking-mastery': { total_sessions: 12, sessions_per_week: 2 },
      'throwing-mechanics': { total_sessions: 8, sessions_per_week: 2 }
    };
    
    const programDef = programDefinitions[program_id] || { total_sessions: 12, sessions_per_week: 3 };
    
    // Record program session completion
    await query(
      `INSERT INTO progress_tracking (
        user_id, tracking_type, skill_category, metric_name, 
        metric_value, session_context, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        userId,
        'program_progress',
        'overall',
        'session_completed',
        session_number,
        JSON.stringify({
          program_id,
          program_name,
          session_title,
          duration_minutes: durationMinutes,
          drills_completed: drillsCompleted?.length || 0,
          skills_focused: skillsFocused || []
        })
      ]
    );
    
    // Get all completed sessions for this program
    const completedSessions = await query(
      `SELECT metric_value as session_number
       FROM progress_tracking 
       WHERE user_id = $1 
         AND tracking_type = 'program_progress'
         AND metric_name = 'session_completed'
         AND session_context::text LIKE '%"program_id":"' || $2 || '"%'
       ORDER BY metric_value ASC`,
      [userId, program_id]
    );
    
    const completedSessionNumbers = completedSessions.rows.map(row => parseInt(row.session_number));
    const nextSessionNumber = Math.max(...completedSessionNumbers, 0) + 1;
    const programCompleted = nextSessionNumber > programDef.total_sessions;
    
    return {
      program_id,
      program_name,
      completed_sessions: completedSessionNumbers,
      next_session_number: programCompleted ? null : nextSessionNumber,
      total_sessions: programDef.total_sessions,
      program_completed: programCompleted,
      completion_percentage: Math.min(100, (completedSessionNumbers.length / programDef.total_sessions) * 100)
    };
    
  } catch (error) {
    console.error('Program progression error:', error);
    throw error;
  }
}

// Helper function to generate next workout in program sequence
async function generateNextProgramWorkout(userId, programId, sessionNumber) {
  try {
    // Get user profile and skills assessment for workout generation
    const userResult = await query(
      `SELECT user_id, name, age, experience_level, years_catching,
              goals, equipment_access, training_preferences
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const userProfile = userResult.rows[0];
    
    // Get latest skills assessment
    const assessmentResult = await query(
      `SELECT assessment_id, receiving_glove_move, receiving_glove_load, receiving_setups, receiving_presentation,
              throwing_footwork, throwing_exchange, throwing_arm_strength, throwing_accuracy, blocking_overall,
              education_pitch_calling, education_scouting_reports, education_umpire_relations, education_pitcher_relations
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );
    
    let skillsAssessment = null;
    if (assessmentResult.rows.length > 0) {
      skillsAssessment = assessmentResult.rows[0];
    } else {
      // Default assessment for new users
      skillsAssessment = {
        receiving_glove_move: 5, receiving_glove_load: 5, receiving_setups: 5, receiving_presentation: 5,
        throwing_footwork: 5, throwing_exchange: 5, throwing_arm_strength: 5, throwing_accuracy: 5,
        blocking_overall: 5, education_pitch_calling: 5, education_scouting_reports: 5,
        education_umpire_relations: 5, education_pitcher_relations: 5
      };
    }
    
    // Program-specific workout generation logic
    const programWorkouts = {
      'framing-fundamentals': generateFramingWorkout,
      'blocking-mastery': generateBlockingWorkout,
      'throwing-mechanics': generateThrowingWorkout
    };
    
    const generateWorkoutFn = programWorkouts[programId] || generateFramingWorkout;
    const nextWorkout = await generateWorkoutFn(userProfile, skillsAssessment, sessionNumber);
    
    return {
      ...nextWorkout,
      program_info: {
        program_id: programId,
        session_number: sessionNumber,
        session_title: nextWorkout.title || `Session ${sessionNumber}`
      }
    };
    
  } catch (error) {
    console.error('Next workout generation error:', error);
    throw error;
  }
}

// Helper function to update user progress stats
async function updateUserProgressStats(userId, durationMinutes, skillsFocused) {
  try {
    // Update workout count and streak
    await query(
      `INSERT INTO progress_tracking (
        user_id, tracking_type, skill_category, metric_name, 
        metric_value, session_context, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        userId,
        'workout_completion',
        'overall',
        'workout_completed',
        durationMinutes,
        JSON.stringify({ skills_focused: skillsFocused || [] })
      ]
    );
    
    // Update skill-specific progress if skills were focused
    if (skillsFocused && skillsFocused.length > 0) {
      for (const skill of skillsFocused) {
        await query(
          `INSERT INTO progress_tracking (
            user_id, tracking_type, skill_category, metric_name, 
            metric_value, session_context, recorded_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            userId,
            'skill_focus',
            skill,
            'skill_practiced',
            1,
            JSON.stringify({ duration_minutes: durationMinutes })
          ]
        );
      }
    }
    
  } catch (error) {
    console.error('Progress stats update error:', error);
    throw error;
  }
}

// Program-specific workout generators
async function generateFramingWorkout(userProfile, skillsAssessment, sessionNumber) {
  const workoutGenerator = new WorkoutGenerationAlgorithm();
  
  // Progressive difficulty based on session number
  const difficulty = sessionNumber <= 4 ? 'beginner' : sessionNumber <= 8 ? 'intermediate' : 'advanced';
  
  const preferences = {
    focus_area: 'receiving',
    difficulty_level: difficulty,
    session_number: sessionNumber
  };
  
  return await workoutGenerator.generateWorkout(
    userProfile,
    skillsAssessment,
    userProfile.equipment_access || {},
    30, // Default 30 minutes
    preferences
  );
}

async function generateBlockingWorkout(userProfile, skillsAssessment, sessionNumber) {
  const workoutGenerator = new WorkoutGenerationAlgorithm();
  
  const difficulty = sessionNumber <= 4 ? 'beginner' : sessionNumber <= 8 ? 'intermediate' : 'advanced';
  
  const preferences = {
    focus_area: 'blocking',
    difficulty_level: difficulty,
    session_number: sessionNumber
  };
  
  return await workoutGenerator.generateWorkout(
    userProfile,
    skillsAssessment,
    userProfile.equipment_access || {},
    30,
    preferences
  );
}

async function generateThrowingWorkout(userProfile, skillsAssessment, sessionNumber) {
  const workoutGenerator = new WorkoutGenerationAlgorithm();
  
  const difficulty = sessionNumber <= 3 ? 'beginner' : sessionNumber <= 6 ? 'intermediate' : 'advanced';
  
  const preferences = {
    focus_area: 'throwing',
    difficulty_level: difficulty,
    session_number: sessionNumber
  };
  
  return await workoutGenerator.generateWorkout(
    userProfile,
    skillsAssessment,
    userProfile.equipment_access || {},
    25,
    preferences
  );
}

export default router;
