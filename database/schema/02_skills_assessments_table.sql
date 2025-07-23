-- ===========================================
-- CATCHING COACH APP - DATABASE SCHEMA
-- Part 2: Skills Assessments Table
-- ===========================================

-- This table stores the 13-category skills assessment (1-10 ratings)
-- Each user can have multiple assessments over time to track improvement
CREATE TABLE skills_assessments (
    -- Primary identifier for each assessment
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links to which user this assessment belongs to
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- ===========================================
    -- RECEIVING SKILLS (4 subcategories)
    -- ===========================================
    
    -- How well they move their glove to receive pitches
    receiving_glove_move INTEGER NOT NULL CHECK (receiving_glove_move BETWEEN 1 AND 10),
    
    -- How well they load/position their glove before the pitch
    receiving_glove_load INTEGER NOT NULL CHECK (receiving_glove_load BETWEEN 1 AND 10),
    
    -- How well they set up behind the plate (stance, positioning)
    receiving_setups INTEGER NOT NULL CHECK (receiving_setups BETWEEN 1 AND 10),
    
    -- How well they present pitches to the umpire (framing)
    receiving_presentation INTEGER NOT NULL CHECK (receiving_presentation BETWEEN 1 AND 10),
    
    -- ===========================================
    -- THROWING SKILLS (4 subcategories)  
    -- ===========================================
    
    -- Footwork when throwing to second base
    throwing_footwork INTEGER NOT NULL CHECK (throwing_footwork BETWEEN 1 AND 10),
    
    -- How quickly/cleanly they exchange ball from glove to hand
    throwing_exchange INTEGER NOT NULL CHECK (throwing_exchange BETWEEN 1 AND 10),
    
    -- Raw arm strength (how hard they can throw)
    throwing_arm_strength INTEGER NOT NULL CHECK (throwing_arm_strength BETWEEN 1 AND 10),
    
    -- How accurately they throw to bases
    throwing_accuracy INTEGER NOT NULL CHECK (throwing_accuracy BETWEEN 1 AND 10),
    
    -- ===========================================
    -- BLOCKING SKILLS (1 category)
    -- ===========================================
    
    -- Overall blocking ability (stopping balls in the dirt)
    blocking_overall INTEGER NOT NULL CHECK (blocking_overall BETWEEN 1 AND 10),
    
    -- ===========================================
    -- EDUCATION/MENTAL GAME (4 subcategories)
    -- ===========================================
    
    -- Ability to call pitches and manage game strategy
    education_pitch_calling INTEGER NOT NULL CHECK (education_pitch_calling BETWEEN 1 AND 10),
    
    -- Understanding and using scouting reports on hitters
    education_scouting_reports INTEGER NOT NULL CHECK (education_scouting_reports BETWEEN 1 AND 10),
    
    -- Communication and relationship with umpires
    education_umpire_relations INTEGER NOT NULL CHECK (education_umpire_relations BETWEEN 1 AND 10),
    
    -- Communication and relationship with pitchers
    education_pitcher_relations INTEGER NOT NULL CHECK (education_pitcher_relations BETWEEN 1 AND 10),
    
    -- ===========================================
    -- ASSESSMENT METADATA
    -- ===========================================
    
    -- Who provided the ratings
    assessment_type VARCHAR(20) DEFAULT 'self_rated' CHECK (assessment_type IN ('self_rated', 'coach_rated', 'combined')),
    
    -- Whether a coach provided input/oversight
    coach_input BOOLEAN DEFAULT FALSE,
    
    -- Optional notes about the assessment
    notes TEXT,
    
    -- When this assessment was completed
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Index to quickly find all assessments for a user
CREATE INDEX idx_skills_assessments_user_id ON skills_assessments(user_id);

-- Index to find assessments by date (for progress tracking)
CREATE INDEX idx_skills_assessments_created_at ON skills_assessments(created_at);

-- Index to find latest assessment per user
CREATE INDEX idx_skills_assessments_user_date ON skills_assessments(user_id, created_at DESC);

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to calculate receiving category average
-- This will help us determine which category needs most work
CREATE OR REPLACE FUNCTION calculate_receiving_average(assessment_id UUID)
RETURNS DECIMAL(3,1) AS $$
DECLARE
    avg_score DECIMAL(3,1);
BEGIN
    SELECT 
        ROUND(
            (receiving_glove_move + receiving_glove_load + receiving_setups + receiving_presentation) / 4.0, 
            1
        ) INTO avg_score
    FROM skills_assessments 
    WHERE skills_assessments.assessment_id = $1;
    
    RETURN avg_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate throwing category average
CREATE OR REPLACE FUNCTION calculate_throwing_average(assessment_id UUID)
RETURNS DECIMAL(3,1) AS $$
DECLARE
    avg_score DECIMAL(3,1);
BEGIN
    SELECT 
        ROUND(
            (throwing_footwork + throwing_exchange + throwing_arm_strength + throwing_accuracy) / 4.0, 
            1
        ) INTO avg_score
    FROM skills_assessments 
    WHERE skills_assessments.assessment_id = $1;
    
    RETURN avg_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate education category average
CREATE OR REPLACE FUNCTION calculate_education_average(assessment_id UUID)
RETURNS DECIMAL(3,1) AS $$
DECLARE
    avg_score DECIMAL(3,1);
BEGIN
    SELECT 
        ROUND(
            (education_pitch_calling + education_scouting_reports + education_umpire_relations + education_pitcher_relations) / 4.0, 
            1
        ) INTO avg_score
    FROM skills_assessments 
    WHERE skills_assessments.assessment_id = $1;
    
    RETURN avg_score;
END;
$$ LANGUAGE plpgsql;

-- Function to find weakest category for a user's latest assessment
-- This is CRITICAL for the AI coach - it determines workout focus
CREATE OR REPLACE FUNCTION find_weakest_category(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    latest_assessment_id UUID;
    receiving_avg DECIMAL(3,1);
    throwing_avg DECIMAL(3,1);
    blocking_score INTEGER;
    education_avg DECIMAL(3,1);
    weakest_category TEXT;
    lowest_score DECIMAL(3,1);
BEGIN
    -- Get the user's most recent assessment
    SELECT assessment_id INTO latest_assessment_id
    FROM skills_assessments 
    WHERE user_id = user_uuid 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If no assessment found, return null
    IF latest_assessment_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate category averages
    receiving_avg := calculate_receiving_average(latest_assessment_id);
    throwing_avg := calculate_throwing_average(latest_assessment_id);
    education_avg := calculate_education_average(latest_assessment_id);
    
    -- Get blocking score (no average needed, only 1 subcategory)
    SELECT blocking_overall INTO blocking_score
    FROM skills_assessments 
    WHERE assessment_id = latest_assessment_id;
    
    -- Find the lowest scoring category
    lowest_score := receiving_avg;
    weakest_category := 'receiving';
    
    IF throwing_avg < lowest_score THEN
        lowest_score := throwing_avg;
        weakest_category := 'throwing';
    END IF;
    
    IF blocking_score < lowest_score THEN
        lowest_score := blocking_score;
        weakest_category := 'blocking';
    END IF;
    
    IF education_avg < lowest_score THEN
        lowest_score := education_avg;
        weakest_category := 'education';
    END IF;
    
    RETURN weakest_category;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- EXPLANATION OF KEY CONCEPTS:
-- ===========================================

/*
CHECK CONSTRAINT: 
- Ensures values are between 1 and 10
- Database will reject any rating outside this range
- Example: receiving_glove_move INTEGER NOT NULL CHECK (receiving_glove_move BETWEEN 1 AND 10)

FOREIGN KEY RELATIONSHIPS:
- REFERENCES user_profiles(user_id) creates a link between tables
- ON DELETE CASCADE means if user is deleted, their assessments are too
- Maintains data integrity

PLPGSQL FUNCTIONS:
- Custom functions we can call to calculate averages
- Like having a built-in calculator for category scores
- find_weakest_category() is the key function for AI coach recommendations

INDEXES:
- Make database searches faster
- idx_skills_assessments_user_id helps quickly find all assessments for a user
- Critical for good app performance

EXAMPLE DATA THIS TABLE STORES:
assessment_id: 456e7890-e89b-12d3-a456-426614174111
user_id: 123e4567-e89b-12d3-a456-426614174000
receiving_glove_move: 7
receiving_glove_load: 6
receiving_setups: 8
receiving_presentation: 5
throwing_footwork: 6
throwing_exchange: 7
throwing_arm_strength: 8
throwing_accuracy: 6
blocking_overall: 4  ← WEAKEST AREA (will get most workout focus)
education_pitch_calling: 5
education_scouting_reports: 6
education_umpire_relations: 7
education_pitcher_relations: 8
assessment_type: 'self_rated'
created_at: 2024-01-15 10:30:00

In this example, blocking (score: 4) is the weakest area,
so the AI coach will focus more drills on blocking skills.
*/