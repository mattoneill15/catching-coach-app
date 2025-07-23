-- ===========================================
-- CATCHING COACH APP - DATABASE SCHEMA
-- Part 5: Progress Tracking Table (Final Table!)
-- ===========================================

-- This table tracks user improvement over time across all skill categories
-- Provides data for progress visualization and AI coach optimization
CREATE TABLE progress_tracking (
    -- Primary identifier for each progress record
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links to which user this progress belongs to
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- ===========================================
    -- PROGRESS PERIOD DEFINITION
    -- ===========================================
    
    -- What time period this progress record covers
    tracking_period VARCHAR(20) NOT NULL CHECK (
        tracking_period IN ('daily', 'weekly', 'monthly', 'milestone', 'assessment_comparison')
    ),
    
    -- Start date of the tracking period
    period_start_date DATE NOT NULL,
    
    -- End date of the tracking period  
    period_end_date DATE NOT NULL,
    
    -- Week number (1-52) for weekly tracking
    week_number INTEGER CHECK (week_number BETWEEN 1 AND 53),
    
    -- Month number (1-12) for monthly tracking
    month_number INTEGER CHECK (month_number BETWEEN 1 AND 12),
    
    -- Year for the tracking period
    year_number INTEGER NOT NULL,
    
    -- ===========================================
    -- SKILLS IMPROVEMENT TRACKING
    -- ===========================================
    
    -- Skill scores at the start of this period (from skills assessment)
    start_scores JSONB NOT NULL,
    -- Example: {
    --   "receiving_glove_move": 6,
    --   "receiving_glove_load": 5,
    --   "throwing_footwork": 7,
    --   "blocking_overall": 4,
    --   etc...
    -- }
    
    -- Skill scores at the end of this period (from skills assessment)
    end_scores JSONB,
    -- Same structure as start_scores, null if period not complete
    
    -- Calculated improvement for each skill (end_score - start_score)
    skill_improvements JSONB,
    -- Example: {
    --   "receiving_glove_move": 1,    -- improved from 6 to 7
    --   "receiving_glove_load": 0,    -- stayed the same
    --   "throwing_footwork": -1,      -- got worse (maybe over-training?)
    --   "blocking_overall": 2         -- big improvement from 4 to 6
    -- }
    
    -- Category averages at start of period
    start_category_averages JSONB NOT NULL,
    -- Example: {"receiving": 5.5, "throwing": 6.8, "blocking": 4.0, "education": 6.2}
    
    -- Category averages at end of period
    end_category_averages JSONB,
    -- Same structure as start_category_averages
    
    -- Which category improved the most this period
    most_improved_category VARCHAR(20),
    
    -- Which category needs the most attention
    focus_area_next_period VARCHAR(20),
    
    -- ===========================================
    -- TRAINING ACTIVITY SUMMARY
    -- ===========================================
    
    -- Total number of workouts completed this period
    workouts_completed INTEGER DEFAULT 0,
    
    -- Total training time (in minutes) this period
    total_training_minutes INTEGER DEFAULT 0,
    
    -- Average workout duration this period
    average_workout_duration DECIMAL(5,1),
    
    -- Workout frequency (workouts per week)
    workout_frequency DECIMAL(3,1),
    
    -- Most frequently trained category
    most_trained_category VARCHAR(20),
    
    -- Breakdown of training time by category
    training_time_by_category JSONB DEFAULT '{}',
    -- Example: {"receiving": 120, "throwing": 180, "blocking": 240, "education": 60}
    
    -- Total number of drills practiced
    total_drills_practiced INTEGER DEFAULT 0,
    
    -- Most practiced drill this period
    most_practiced_drill VARCHAR(100),
    
    -- Number of videos uploaded for progress tracking
    videos_uploaded INTEGER DEFAULT 0,
    
    -- ===========================================
    -- PERFORMANCE METRICS
    -- ===========================================
    
    -- Average workout completion rate (percentage)
    average_completion_rate DECIMAL(5,1),
    
    -- Average user satisfaction rating (1-10)
    average_satisfaction DECIMAL(3,1),
    
    -- Average perceived difficulty (1-10)
    average_difficulty DECIMAL(3,1),
    
    -- Average effectiveness rating (1-10)
    average_effectiveness DECIMAL(3,1),
    
    -- Consistency score (how regularly they trained)
    consistency_score DECIMAL(3,1),
    -- Calculated based on workout distribution throughout the period
    
    -- ===========================================
    -- MILESTONE ACHIEVEMENTS
    -- ===========================================
    
    -- Milestones achieved during this period
    milestones_achieved JSONB DEFAULT '[]',
    -- Example: [
    --   {"milestone": "first_week_complete", "date": "2024-01-15", "description": "Completed first week of training"},
    --   {"milestone": "blocking_breakthrough", "date": "2024-01-18", "description": "Blocking score improved by 2 points"},
    --   {"milestone": "consistency_champion", "date": "2024-01-20", "description": "Worked out 5 days this week"}
    -- ]
    
    -- Personal bests achieved
    personal_bests JSONB DEFAULT '[]',
    -- Example: [
    --   {"category": "longest_workout", "value": 75, "unit": "minutes", "date": "2024-01-16"},
    --   {"category": "most_drills_in_session", "value": 12, "unit": "drills", "date": "2024-01-19"}
    -- ]
    
    -- Goals achieved during this period
    goals_achieved JSONB DEFAULT '[]',
    -- Links to user goals that were completed
    
    -- ===========================================
    -- AI COACH INSIGHTS
    -- ===========================================
    
    -- AI's analysis of what training approaches worked best
    effective_strategies JSONB DEFAULT '[]',
    -- Example: [
    --   {"strategy": "blocking_focus", "effectiveness": 8.5, "evidence": "2_point_improvement"},
    --   {"strategy": "morning_workouts", "effectiveness": 7.2, "evidence": "higher_completion_rates"}
    -- ]
    
    -- AI's recommendations for next period
    ai_recommendations JSONB DEFAULT '[]',
    -- Example: [
    --   {"category": "receiving", "recommendation": "increase_glove_move_practice", "priority": "high"},
    --   {"category": "schedule", "recommendation": "maintain_current_frequency", "priority": "medium"}
    -- ]
    
    -- Patterns the AI identified in user behavior
    behavior_patterns JSONB DEFAULT '{}',
    -- Example: {
    --   "best_workout_time": "morning",
    --   "preferred_workout_length": 30,
    --   "skip_tendency": "education_drills",
    --   "strength_area": "blocking"
    -- }
    
    -- ===========================================
    -- COMPARATIVE ANALYSIS
    -- ===========================================
    
    -- How this user compares to others at similar level
    peer_comparison JSONB DEFAULT '{}',
    -- Example: {
    --   "percentile_overall": 75,
    --   "percentile_by_category": {"receiving": 80, "throwing": 65, "blocking": 90, "education": 70},
    --   "improvement_rate_vs_peers": "above_average"
    -- }
    
    -- Expected vs. actual progress
    progress_vs_expected JSONB DEFAULT '{}',
    -- Example: {
    --   "expected_improvement": 1.2,
    --   "actual_improvement": 1.8,
    --   "variance": 0.6,
    --   "assessment": "exceeding_expectations"
    -- }
    
    -- ===========================================
    -- CHALLENGE TRACKING
    -- ===========================================
    
    -- Challenges or struggles identified this period
    challenges_identified JSONB DEFAULT '[]',
    -- Example: [
    --   {"challenge": "consistency", "severity": "medium", "solutions_tried": ["reminder_notifications"]},
    --   {"challenge": "blocking_plateau", "severity": "low", "solutions_tried": ["drill_variation"]}
    -- ]
    
    -- Solutions implemented and their effectiveness
    solutions_implemented JSONB DEFAULT '[]',
    -- Example: [
    --   {"solution": "shorter_workouts", "effectiveness": 7, "outcome": "improved_completion_rate"},
    --   {"solution": "video_feedback", "effectiveness": 9, "outcome": "faster_skill_development"}
    -- ]
    
    -- ===========================================
    -- MOTIVATION & ENGAGEMENT
    -- ===========================================
    
    -- User engagement level (1-10)
    engagement_level DECIMAL(3,1),
    
    -- Motivation factors that worked well
    effective_motivators JSONB DEFAULT '[]',
    -- Example: ["progress_visualization", "milestone_rewards", "video_comparison"]
    
    -- Signs of declining motivation (if any)
    motivation_concerns JSONB DEFAULT '[]',
    -- Example: ["decreased_frequency", "lower_ratings", "skipped_sessions"]
    
    -- ===========================================
    -- METADATA
    -- ===========================================
    
    -- Whether this progress period is complete
    is_complete BOOLEAN DEFAULT FALSE,
    
    -- Confidence level in the progress data (1-10)
    data_confidence DECIMAL(3,1) DEFAULT 8.0,
    
    -- When this progress record was created
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- When this progress record was last updated
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Notes from the user about this period
    user_notes TEXT,
    
    -- System notes about data quality or issues
    system_notes TEXT
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Index to quickly find progress records for a user
CREATE INDEX idx_progress_tracking_user_id ON progress_tracking(user_id);

-- Index to find progress by time period
CREATE INDEX idx_progress_tracking_period ON progress_tracking(tracking_period, year_number, month_number);

-- Index to find recent progress records
CREATE INDEX idx_progress_tracking_recent ON progress_tracking(user_id, period_end_date DESC);

-- Index to find completed progress periods
CREATE INDEX idx_progress_tracking_complete ON progress_tracking(is_complete) WHERE is_complete = TRUE;

-- Index for finding weekly progress
CREATE INDEX idx_progress_tracking_weekly ON progress_tracking(user_id, week_number, year_number) WHERE tracking_period = 'weekly';

-- Index for finding monthly progress
CREATE INDEX idx_progress_tracking_monthly ON progress_tracking(user_id, month_number, year_number) WHERE tracking_period = 'monthly';

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to calculate overall improvement rate for a user
CREATE OR REPLACE FUNCTION calculate_improvement_rate(user_uuid UUID, months_back INTEGER DEFAULT 3)
RETURNS DECIMAL(4,2) AS $$
DECLARE
    total_improvement DECIMAL(4,2);
    periods_count INTEGER;
    improvement_rate DECIMAL(4,2);
BEGIN
    -- Sum all skill improvements over the specified period
    SELECT 
        COALESCE(AVG(
            (skill_improvements->>'receiving_glove_move')::DECIMAL +
            (skill_improvements->>'receiving_glove_load')::DECIMAL +
            (skill_improvements->>'receiving_setups')::DECIMAL +
            (skill_improvements->>'receiving_presentation')::DECIMAL +
            (skill_improvements->>'throwing_footwork')::DECIMAL +
            (skill_improvements->>'throwing_exchange')::DECIMAL +
            (skill_improvements->>'throwing_arm_strength')::DECIMAL +
            (skill_improvements->>'throwing_accuracy')::DECIMAL +
            (skill_improvements->>'blocking_overall')::DECIMAL +
            (skill_improvements->>'education_pitch_calling')::DECIMAL +
            (skill_improvements->>'education_scouting_reports')::DECIMAL +
            (skill_improvements->>'education_umpire_relations')::DECIMAL +
            (skill_improvements->>'education_pitcher_relations')::DECIMAL
        ), 0),
        COUNT(*)
    INTO total_improvement, periods_count
    FROM progress_tracking 
    WHERE user_id = user_uuid 
    AND is_complete = TRUE
    AND skill_improvements IS NOT NULL
    AND period_end_date >= NOW() - INTERVAL '1 month' * months_back;
    
    -- Calculate rate per month
    IF periods_count > 0 THEN
        improvement_rate := total_improvement / 13.0; -- Average across 13 skills
    ELSE
        improvement_rate := 0.0;
    END IF;
    
    RETURN improvement_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to find user's strongest improving category
CREATE OR REPLACE FUNCTION find_strongest_improving_category(user_uuid UUID, months_back INTEGER DEFAULT 3)
RETURNS TEXT AS $$
DECLARE
    receiving_avg DECIMAL(4,2);
    throwing_avg DECIMAL(4,2);
    blocking_avg DECIMAL(4,2);
    education_avg DECIMAL(4,2);
    strongest_category TEXT;
    highest_improvement DECIMAL(4,2) := -999;
BEGIN
    -- Calculate average improvement for each category
    SELECT 
        AVG(
            (skill_improvements->>'receiving_glove_move')::DECIMAL +
            (skill_improvements->>'receiving_glove_load')::DECIMAL +
            (skill_improvements->>'receiving_setups')::DECIMAL +
            (skill_improvements->>'receiving_presentation')::DECIMAL
        ) / 4.0
    INTO receiving_avg
    FROM progress_tracking 
    WHERE user_id = user_uuid 
    AND is_complete = TRUE
    AND skill_improvements IS NOT NULL
    AND period_end_date >= NOW() - INTERVAL '1 month' * months_back;
    
    SELECT 
        AVG(
            (skill_improvements->>'throwing_footwork')::DECIMAL +
            (skill_improvements->>'throwing_exchange')::DECIMAL +
            (skill_improvements->>'throwing_arm_strength')::DECIMAL +
            (skill_improvements->>'throwing_accuracy')::DECIMAL
        ) / 4.0
    INTO throwing_avg
    FROM progress_tracking 
    WHERE user_id = user_uuid 
    AND is_complete = TRUE
    AND skill_improvements IS NOT NULL
    AND period_end_date >= NOW() - INTERVAL '1 month' * months_back;
    
    SELECT 
        AVG((skill_improvements->>'blocking_overall')::DECIMAL)
    INTO blocking_avg
    FROM progress_tracking 
    WHERE user_id = user_uuid 
    AND is_complete = TRUE
    AND skill_improvements IS NOT NULL
    AND period_end_date >= NOW() - INTERVAL '1 month' * months_back;
    
    SELECT 
        AVG(
            (skill_improvements->>'education_pitch_calling')::DECIMAL +
            (skill_improvements->>'education_scouting_reports')::DECIMAL +
            (skill_improvements->>'education_umpire_relations')::DECIMAL +
            (skill_improvements->>'education_pitcher_relations')::DECIMAL
        ) / 4.0
    INTO education_avg
    FROM progress_tracking 
    WHERE user_id = user_uuid 
    AND is_complete = TRUE
    AND skill_improvements IS NOT NULL
    AND period_end_date >= NOW() - INTERVAL '1 month' * months_back;
    
    -- Find the highest improving category
    IF COALESCE(receiving_avg, -999) > highest_improvement THEN
        highest_improvement := receiving_avg;
        strongest_category := 'receiving';
    END IF;
    
    IF COALESCE(throwing_avg, -999) > highest_improvement THEN
        highest_improvement := throwing_avg;
        strongest_category := 'throwing';
    END IF;
    
    IF COALESCE(blocking_avg, -999) > highest_improvement THEN
        highest_improvement := blocking_avg;
        strongest_category := 'blocking';
    END IF;
    
    IF COALESCE(education_avg, -999) > highest_improvement THEN
        highest_improvement := education_avg;
        strongest_category := 'education';
    END IF;
    
    RETURN strongest_category;
END;
$$ LANGUAGE plpgsql;

-- Function to get progress summary for a user
CREATE OR REPLACE FUNCTION get_progress_summary(user_uuid UUID)
RETURNS TABLE(
    total_workouts INTEGER,
    total_training_hours DECIMAL(6,1),
    improvement_rate DECIMAL(4,2),
    strongest_category TEXT,
    current_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(pt.workouts_completed), 0)::INTEGER as total_workouts,
        COALESCE(SUM(pt.total_training_minutes), 0)::DECIMAL / 60.0 as total_training_hours,
        calculate_improvement_rate(user_uuid, 6) as improvement_rate,
        find_strongest_improving_category(user_uuid, 6) as strongest_category,
        -- Calculate current workout streak (simplified version)
        (SELECT COUNT(*) FROM workout_sessions ws 
         WHERE ws.user_id = user_uuid 
         AND ws.completion_status = 'completed'
         AND ws.started_at >= NOW() - INTERVAL '7 days')::INTEGER as current_streak
    FROM progress_tracking pt
    WHERE pt.user_id = user_uuid
    AND pt.is_complete = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- EXPLANATION OF KEY CONCEPTS:
-- ===========================================

/*
PROGRESS TRACKING PURPOSE:
This table is the "memory" of user improvement. It takes snapshots of progress
at different time intervals and calculates improvement rates, identifies patterns,
and helps the AI coach optimize training recommendations.

TIME PERIODS:
- daily: Daily progress snapshots (for intensive tracking)
- weekly: Weekly summaries (most common)
- monthly: Monthly overviews (for long-term trends)
- milestone: Special achievements or breakthroughs
- assessment_comparison: Before/after major assessments

IMPROVEMENT CALCULATION:
skill_improvements stores the difference between start and end scores:
- Positive values = improvement
- Zero = no change  
- Negative values = decline (might indicate over-training or plateau)

AI LEARNING:
The AI uses this data to:
- Identify which training approaches work best for each user
- Detect plateaus or declining motivation
- Recommend adjustments to training plans
- Celebrate achievements and milestones

EXAMPLE PROGRESS RECORD (Weekly):
progress_id: abc123...
user_id: user123...
tracking_period: "weekly"
period_start_date: 2024-01-15
period_end_date: 2024-01-21
week_number: 3
year_number: 2024
start_scores: {"receiving_glove_move": 6, "blocking_overall": 4, ...}
end_scores: {"receiving_glove_move": 7, "blocking_overall": 6, ...}
skill_improvements: {"receiving_glove_move": 1, "blocking_overall": 2, ...}
workouts_completed: 3
total_training_minutes: 135
most_improved_category: "blocking"
milestones_achieved: [{"milestone": "blocking_breakthrough", "date": "2024-01-18"}]
ai_recommendations: [{"category": "blocking", "recommendation": "continue_current_approach"}]

This shows a great week where the user improved blocking by 2 points!
*/