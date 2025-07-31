/**
 * Skills Assessment Routes
 * Handles skills evaluation and assessment management
 */

import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create a new skills assessment
router.post('/assessment', authenticateToken, async (req, res) => {
  try {
    const {
      receiving_glove_move,
      receiving_glove_load,
      receiving_setups,
      receiving_presentation,
      throwing_footwork,
      throwing_exchange,
      throwing_arm_strength,
      throwing_accuracy,
      blocking_overall,
      education_pitch_calling,
      education_scouting_reports,
      education_umpire_relations,
      education_pitcher_relations,
      assessment_notes,
      assessment_type
    } = req.body;

    // Validate required fields (all skill scores)
    const requiredSkills = [
      'receiving_glove_move', 'receiving_glove_load', 'receiving_setups', 'receiving_presentation',
      'throwing_footwork', 'throwing_exchange', 'throwing_arm_strength', 'throwing_accuracy',
      'blocking_overall', 'education_pitch_calling', 'education_scouting_reports',
      'education_umpire_relations', 'education_pitcher_relations'
    ];

    const missingSkills = requiredSkills.filter(skill => 
      req.body[skill] === undefined || req.body[skill] === null
    );

    if (missingSkills.length > 0) {
      return res.status(400).json({
        error: 'Missing skill assessments',
        missing_skills: missingSkills
      });
    }

    // Calculate overall score (average of all skills)
    const skillScores = [
      receiving_glove_move, receiving_glove_load, receiving_setups, receiving_presentation,
      throwing_footwork, throwing_exchange, throwing_arm_strength, throwing_accuracy,
      blocking_overall, education_pitch_calling, education_scouting_reports,
      education_umpire_relations, education_pitcher_relations
    ];

    const overallScore = skillScores.reduce((sum, score) => sum + score, 0) / skillScores.length;

    const assessmentId = uuidv4();

    const insertQuery = `
      INSERT INTO skills_assessments (
        assessment_id, user_id, receiving_glove_move, receiving_glove_load, receiving_setups, receiving_presentation,
        throwing_footwork, throwing_exchange, throwing_arm_strength, throwing_accuracy, blocking_overall,
        education_pitch_calling, education_scouting_reports, education_umpire_relations, education_pitcher_relations,
        assessment_type, notes, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
      )
      RETURNING assessment_id, created_at
    `;

    const result = await query(insertQuery, [
      assessmentId,
      req.user.userId,
      receiving_glove_move,
      receiving_glove_load,
      receiving_setups,
      receiving_presentation,
      throwing_footwork,
      throwing_exchange,
      throwing_arm_strength,
      throwing_accuracy,
      blocking_overall,
      education_pitch_calling,
      education_scouting_reports,
      education_umpire_relations,
      education_pitcher_relations,
      assessment_type || 'self_rated',
      assessment_notes || ''
    ]);

    // Fetch the complete assessment data that was just created
    const fullAssessmentResult = await query(
      `SELECT assessment_id, receiving_glove_move, receiving_glove_load, receiving_setups, receiving_presentation,
              throwing_footwork, throwing_exchange, throwing_arm_strength, throwing_accuracy, blocking_overall,
              education_pitch_calling, education_scouting_reports, education_umpire_relations, education_pitcher_relations,
              assessment_type, notes, created_at
       FROM skills_assessments 
       WHERE assessment_id = $1`,
      [result.rows[0].assessment_id]
    );

    res.status(201).json({
      message: 'Skills assessment created successfully',
      assessment: fullAssessmentResult.rows[0]
    });

  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create skills assessment' });
  }
});

// Get user's latest skills assessment
router.get('/assessment/latest', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT assessment_id, receiving_glove_move, receiving_glove_load, receiving_setups, receiving_presentation,
              throwing_footwork, throwing_exchange, throwing_arm_strength, throwing_accuracy, blocking_overall,
              education_pitch_calling, education_scouting_reports, education_umpire_relations, education_pitcher_relations,
              assessment_type, notes, created_at
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No skills assessment found',
        message: 'User needs to complete initial skills assessment'
      });
    }

    res.json({ assessment: result.rows[0] });

  } catch (error) {
    console.error('Get latest assessment error:', error);
    res.status(500).json({ error: 'Failed to get latest assessment' });
  }
});

// Get all user's skills assessments (for progress tracking)
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(
      `SELECT assessment_id, overall_score, created_at,
              glove_move, glove_load, setups, presentation,
              footwork, exchange, arm_strength, accuracy, blocking_overall,
              pitch_calling, scouting_reports, umpire_relations, pitcher_relations
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    res.json({ 
      assessments: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

// Get skills progress over time
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         assessment_id,
         overall_score,
         glove_move + glove_load + setups + presentation as receiving_score,
         footwork + exchange + arm_strength + accuracy as throwing_score,
         blocking_overall * 4 as blocking_score,
         pitch_calling + scouting_reports + umpire_relations + pitcher_relations as education_score,
         created_at
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at ASC`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No assessment data found',
        message: 'Complete skills assessments to track progress'
      });
    }

    // Calculate progress trends
    const assessments = result.rows;
    const latest = assessments[assessments.length - 1];
    const previous = assessments.length > 1 ? assessments[assessments.length - 2] : null;

    let trends = {};
    if (previous) {
      trends = {
        overall: latest.overall_score - previous.overall_score,
        receiving: (latest.receiving_score / 4) - (previous.receiving_score / 4),
        throwing: (latest.throwing_score / 4) - (previous.throwing_score / 4),
        blocking: (latest.blocking_score / 4) - (previous.blocking_score / 4),
        education: (latest.education_score / 4) - (previous.education_score / 4)
      };
    }

    res.json({
      assessments,
      latest_scores: {
        overall: latest.overall_score,
        receiving: latest.receiving_score / 4,
        throwing: latest.throwing_score / 4,
        blocking: latest.blocking_score / 4,
        education: latest.education_score / 4
      },
      trends,
      total_assessments: assessments.length
    });

  } catch (error) {
    console.error('Get skills progress error:', error);
    res.status(500).json({ error: 'Failed to get skills progress' });
  }
});

// Get skill category breakdown for current assessment
router.get('/breakdown', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         glove_move, glove_load, setups, presentation,
         footwork, exchange, arm_strength, accuracy,
         blocking_overall,
         pitch_calling, scouting_reports, umpire_relations, pitcher_relations,
         created_at
       FROM skills_assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No skills assessment found' });
    }

    const assessment = result.rows[0];

    // Calculate category averages
    const breakdown = {
      receiving: {
        average: (assessment.glove_move + assessment.glove_load + 
                 assessment.setups + assessment.presentation) / 4,
        skills: {
          glove_move: assessment.glove_move,
          glove_load: assessment.glove_load,
          setups: assessment.setups,
          presentation: assessment.presentation
        }
      },
      throwing: {
        average: (assessment.footwork + assessment.exchange + 
                 assessment.arm_strength + assessment.accuracy) / 4,
        skills: {
          footwork: assessment.footwork,
          exchange: assessment.exchange,
          arm_strength: assessment.arm_strength,
          accuracy: assessment.accuracy
        }
      },
      blocking: {
        average: assessment.blocking_overall,
        skills: {
          blocking_overall: assessment.blocking_overall
        }
      },
      education: {
        average: (assessment.pitch_calling + assessment.scouting_reports + 
                 assessment.umpire_relations + assessment.pitcher_relations) / 4,
        skills: {
          pitch_calling: assessment.pitch_calling,
          scouting_reports: assessment.scouting_reports,
          umpire_relations: assessment.umpire_relations,
          pitcher_relations: assessment.pitcher_relations
        }
      }
    };

    // Find weakest and strongest categories
    const categories = Object.keys(breakdown);
    const weakest = categories.reduce((min, cat) => 
      breakdown[cat].average < breakdown[min].average ? cat : min
    );
    const strongest = categories.reduce((max, cat) => 
      breakdown[cat].average > breakdown[max].average ? cat : max
    );

    res.json({
      breakdown,
      analysis: {
        weakest_category: weakest,
        strongest_category: strongest,
        assessment_date: assessment.created_at
      }
    });

  } catch (error) {
    console.error('Get skills breakdown error:', error);
    res.status(500).json({ error: 'Failed to get skills breakdown' });
  }
});

export default router;
