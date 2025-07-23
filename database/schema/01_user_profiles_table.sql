-- ===========================================
-- CATCHING COACH APP - DATABASE SCHEMA
-- Part 1: User Profiles Table
-- ===========================================

-- This table stores basic information about each user of the app
-- Think of it like a digital baseball card for each catcher
CREATE TABLE user_profiles (
    -- Primary identifier - every user gets a unique ID
    user_id UUID PRIMARY KEY,
    
    -- Basic personal information
    name VARCHAR(100) NOT NULL,                    -- User's full name
    email VARCHAR(255) UNIQUE NOT NULL,            -- Email for login (must be unique)
    age INTEGER NOT NULL,                          -- Age in years
    height VARCHAR(10),                            -- Height like "5'10""
    weight VARCHAR(10),                            -- Weight like "165 lbs"
    
    -- Catching-specific information
    primary_position VARCHAR(20) DEFAULT 'catcher', -- Position they play
    experience_level VARCHAR(20) DEFAULT 'high_school', -- Skill level
    years_catching INTEGER DEFAULT 0,              -- How many years they've been catching
    fastest_velocity_caught INTEGER,               -- Fastest pitch caught in MPH
    
    -- Goals - stored as JSON so we can have flexible goal lists
    -- Example: ["exit_velocity", "throwing_velocity", "better_blocking"]
    goals JSON DEFAULT '[]',
    
    -- Equipment they have access to - stored as JSON object
    -- Example: {"glove": true, "gear": true, "baseballs": true, "helper": false}
    equipment_access JSON DEFAULT '{}',
    
    -- Their training preferences - stored as JSON
    -- Example: {"preferred_time": 30, "focus_areas": ["receiving"], "helper_available": true}
    training_preferences JSON DEFAULT '{}',
    
    -- Automatic timestamps - the database fills these in
    created_at TIMESTAMP DEFAULT NOW(),            -- When account was created
    updated_at TIMESTAMP DEFAULT NOW()             -- When last updated
);

-- Create an index on email for faster login lookups
-- Think of an index like a phone book - it helps find things quickly
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Create an index on experience level for grouping users
CREATE INDEX idx_user_profiles_experience ON user_profiles(experience_level);

-- ===========================================
-- EXPLANATION OF KEY CONCEPTS:
-- ===========================================

-- UUID: A special type of ID that looks like: 123e4567-e89b-12d3-a456-426614174000
--       It's guaranteed to be unique across the entire world

-- VARCHAR(100): Text field that can hold up to 100 characters
-- INTEGER: Whole numbers (1, 2, 3, etc.)
-- JSON: Flexible data format that can store lists and objects
-- TIMESTAMP: Date and time information
-- DEFAULT: If no value is provided, use this default value
-- NOT NULL: This field must have a value (can't be empty)
-- UNIQUE: No two users can have the same email address

-- ===========================================
-- SAMPLE DATA THIS TABLE MIGHT CONTAIN:
-- ===========================================

/*
user_id: 123e4567-e89b-12d3-a456-426614174000
name: "Alex Rodriguez"
email: "alex.rodriguez@email.com"
age: 16
height: "5'10""
weight: "165 lbs"
experience_level: "high_school"
years_catching: 3
fastest_velocity_caught: 85
goals: ["exit_velocity", "throwing_velocity", "better_blocking"]
equipment_access: {"glove": true, "gear": true, "baseballs": true}
training_preferences: {"preferred_time": 45, "helper_available": true}
*/