/**
 * Authentication Routes
 * Handles user login, registration, and session management
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
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

    // Validate required fields
    if (!name || !email || !age) {
      return res.status(400).json({
        error: 'Name, email, and age are required'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM user_profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const userId = uuidv4();
    const insertQuery = `
      INSERT INTO user_profiles (
        user_id, name, email, age, height, weight, experience_level,
        years_catching, fastest_velocity_caught, goals, equipment_access,
        training_preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING user_id, name, email, age, experience_level, created_at
    `;

    const result = await query(insertQuery, [
      userId,
      name,
      email,
      age,
      height || null,
      weight || null,
      experience_level || 'high_school',
      years_catching || 0,
      fastest_velocity_caught || null,
      JSON.stringify(goals || []),
      JSON.stringify(equipment_access || {}),
      JSON.stringify(training_preferences || {})
    ]);

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        age: user.age,
        experience_level: user.experience_level,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register user'
    });
  }
});

// Login user (simplified - no password for demo)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Find user by email
    const result = await query(
      `SELECT user_id, name, email, age, experience_level, 
              goals, equipment_access, training_preferences, created_at
       FROM user_profiles WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        age: user.age,
        experience_level: user.experience_level,
        goals: user.goals,
        equipment_access: user.equipment_access,
        training_preferences: user.training_preferences,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login'
    });
  }
});

// Verify token middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Verify current session
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT user_id, name, email, age, experience_level, 
              goals, equipment_access, training_preferences, created_at
       FROM user_profiles WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        age: user.age,
        experience_level: user.experience_level,
        goals: user.goals,
        equipment_access: user.equipment_access,
        training_preferences: user.training_preferences,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

export default router;
