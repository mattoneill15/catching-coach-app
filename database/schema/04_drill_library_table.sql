-- ===========================================
-- CATCHING COACH APP - DATABASE SCHEMA
-- Part 4: Drill Library Table
-- ===========================================

-- This table stores all 31 catching drills that the AI coach can recommend
-- Each drill has detailed information about equipment, difficulty, and instructions
CREATE TABLE drill_library (
    -- Primary identifier for each drill
    drill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Human-readable unique identifier (used in code and references)
    drill_code VARCHAR(50) UNIQUE NOT NULL,
    -- Example: "basic_blocking", "exchange_drill", "framing_practice"
    
    -- Display name for the drill
    drill_name VARCHAR(100) NOT NULL,
    -- Example: "Basic Blocking Fundamentals", "Quick Exchange Drill"
    
    -- ===========================================
    -- DRILL CATEGORIZATION
    -- ===========================================
    
    -- Primary skill category this drill develops
    primary_category VARCHAR(20) NOT NULL CHECK (
        primary_category IN ('receiving', 'throwing', 'blocking', 'education', 'general')
    ),
    
    -- Secondary skill categories this drill also helps with
    secondary_categories JSONB DEFAULT '[]',
    -- Example: ["throwing", "education"] - a blocking drill might also help with throwing
    
    -- Specific subcategories within the primary category
    subcategories JSONB NOT NULL,
    -- Example for receiving drill: ["glove_move", "presentation"]
    -- Example for throwing drill: ["footwork", "exchange"]
    -- Example for education drill: ["pitch_calling", "game_management"]
    
    -- ===========================================
    -- DIFFICULTY & PROGRESSION
    -- ===========================================
    
    -- Difficulty level (1=beginner, 5=advanced)
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Minimum experience level required
    min_experience VARCHAR(20) DEFAULT 'beginner' CHECK (
        min_experience IN ('beginner', 'intermediate', 'advanced', 'expert')
    ),
    
    -- Age group suitability
    age_groups JSONB NOT NULL DEFAULT '["high_school", "college"]',
    -- Example: ["middle_school", "high_school", "college", "adult"]
    
    -- Prerequisites (other drills that should be mastered first)
    prerequisites JSONB DEFAULT '[]',
    -- Example: ["basic_stance", "glove_positioning"]
    
    -- Progressive variations (easier/harder versions of this drill)
    progressions JSONB DEFAULT '{}',
    -- Example: {
    --   "easier": ["wall_blocking", "stationary_blocking"],
    --   "harder": ["reactive_blocking", "game_situation_blocking"]
    -- }
    
    -- ===========================================
    -- EQUIPMENT REQUIREMENTS
    -- ===========================================
    
    -- Essential equipment needed for this drill
    required_equipment JSONB NOT NULL,
    -- Example: ["tennis_balls", "catchers_gear"]
    
    -- Optional equipment that enhances the drill
    optional_equipment JSONB DEFAULT '[]',
    -- Example: ["cones", "l_screen", "pitching_machine"]
    
    -- Minimum space requirements
    space_requirements VARCHAR(50) DEFAULT 'small',
    -- Options: "small" (10x10), "medium" (20x20), "large" (full_field)
    
    -- Whether this can be done indoors
    indoor_suitable BOOLEAN DEFAULT TRUE,
    
    -- Whether this requires a partner/coach
    requires_partner BOOLEAN DEFAULT FALSE,
    
    -- ===========================================
    -- TIMING & STRUCTURE
    -- ===========================================
    
    -- Typical duration for this drill (in minutes)
    typical_duration INTEGER NOT NULL CHECK (typical_duration > 0),
    
    -- Minimum effective duration
    min_duration INTEGER CHECK (min_duration > 0 AND min_duration <= typical_duration),
    
    -- Maximum recommended duration
    max_duration INTEGER CHECK (max_duration >= typical_duration),
    
    -- Recommended repetitions or sets
    recommended_reps VARCHAR(100),
    -- Example: "3 sets of 10 reps", "5 minutes continuous", "until form breaks down"
    
    -- Rest periods between sets
    rest_periods VARCHAR(50),
    -- Example: "30 seconds", "1 minute", "as needed"
    
    -- ===========================================
    -- INSTRUCTIONAL CONTENT
    -- ===========================================
    
    -- Brief description of the drill
    short_description TEXT NOT NULL,
    
    -- Detailed step-by-step instructions
    detailed_instructions TEXT NOT NULL,
    
    -- Key coaching points to focus on
    coaching_points JSONB NOT NULL,
    -- Example: ["Keep eyes level", "Stay low in stance", "Quick glove-to-hand transfer"]
    
    -- Common mistakes to watch for
    common_mistakes JSONB DEFAULT '[]',
    -- Example: ["Standing up too early", "Dropping the glove", "Slow footwork"]
    
    -- Safety considerations and warnings
    safety_notes TEXT,
    
    -- ===========================================
    -- MULTIMEDIA CONTENT
    -- ===========================================
    
    -- Primary demonstration video URL
    demo_video_url VARCHAR(500),
    
    -- Video source and attribution
    video_source VARCHAR(100),
    -- Example: "YouTube - Baseball Catching Academy"
    
    -- Additional video resources
    additional_videos JSONB DEFAULT '[]',
    -- Example: [
    --   {"title": "Common Mistakes", "url": "https://...", "duration": 180},
    --   {"title": "Advanced Variation", "url": "https://...", "duration": 240}
    -- ]
    
    -- Instructional images or diagrams
    instructional_images JSONB DEFAULT '[]',
    -- Example: [
    --   {"title": "Setup Position", "url": "path/to/setup.jpg"},
    --   {"title": "Foot Positioning", "url": "path/to/feet.jpg"}
    -- ]
    
    -- ===========================================
    -- EFFECTIVENESS & ANALYTICS
    -- ===========================================
    
    -- How often this drill is used in workouts
    usage_frequency INTEGER DEFAULT 0,
    
    -- Average user rating for this drill (1-10)
    average_rating DECIMAL(3,1) DEFAULT 0.0,
    
    -- Number of users who have rated this drill
    rating_count INTEGER DEFAULT 0,
    
    -- Average effectiveness rating from users
    effectiveness_rating DECIMAL(3,1) DEFAULT 0.0,
    
    -- Tags for searching and filtering
    tags JSONB DEFAULT '[]',
    -- Example: ["fundamental", "beginner_friendly", "quick_setup", "game_situation"]
    
    -- ===========================================
    -- WORKOUT INTEGRATION
    -- ===========================================
    
    -- When in a workout this drill is typically used
    workout_phase VARCHAR(20) DEFAULT 'main' CHECK (
        workout_phase IN ('warmup', 'main', 'skill_work', 'conditioning', 'cooldown', 'education')
    ),
    
    -- How well this drill works in different workout durations
    duration_suitability JSONB DEFAULT '{}',
    -- Example: {
    --   "15_min": "suitable",
    --   "30_min": "ideal", 
    --   "45_min": "ideal",
    --   "60_min": "suitable"
    -- }
    
    -- Seasonal considerations
    seasonal_notes TEXT,
    -- Example: "Great for off-season skill development", "Perfect for pre-season preparation"
    
    -- ===========================================
    -- METADATA
    -- ===========================================
    
    -- Whether this drill is currently active/available
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Who created/added this drill
    created_by VARCHAR(100) DEFAULT 'system',
    
    -- When this drill was added to the library
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- When this drill information was last updated
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Version number for tracking changes
    version INTEGER DEFAULT 1
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Index for finding drills by category (most common search)
CREATE INDEX idx_drill_library_category ON drill_library(primary_category);

-- Index for finding drills by difficulty level
CREATE INDEX idx_drill_library_difficulty ON drill_library(difficulty_level);

-- Index for finding active drills
CREATE INDEX idx_drill_library_active ON drill_library(is_active) WHERE is_active = TRUE;

-- Index for equipment-based searches
CREATE INDEX idx_drill_library_equipment ON drill_library USING GIN(required_equipment);

-- Index for searching by tags
CREATE INDEX idx_drill_library_tags ON drill_library USING GIN(tags);

-- Index for finding drills by duration
CREATE INDEX idx_drill_library_duration ON drill_library(typical_duration);

-- Index for finding highly-rated drills
CREATE INDEX idx_drill_library_rating ON drill_library(average_rating DESC) WHERE rating_count > 0;

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to find drills suitable for specific equipment
CREATE OR REPLACE FUNCTION find_drills_by_equipment(available_equipment_array JSONB)
RETURNS TABLE(drill_code VARCHAR, drill_name VARCHAR, primary_category VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT dl.drill_code, dl.drill_name, dl.primary_category
    FROM drill_library dl
    WHERE dl.is_active = TRUE
    AND dl.required_equipment <@ available_equipment_array  -- All required equipment is available
    ORDER BY dl.average_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to find drills for specific skill category and difficulty
CREATE OR REPLACE FUNCTION find_drills_by_category_difficulty(
    category_name VARCHAR, 
    max_difficulty INTEGER DEFAULT 5,
    min_rating DECIMAL DEFAULT 0.0
)
RETURNS TABLE(drill_code VARCHAR, drill_name VARCHAR, difficulty_level INTEGER, average_rating DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT dl.drill_code, dl.drill_name, dl.difficulty_level, dl.average_rating
    FROM drill_library dl
    WHERE dl.is_active = TRUE
    AND dl.primary_category = category_name
    AND dl.difficulty_level <= max_difficulty
    AND dl.average_rating >= min_rating
    ORDER BY dl.average_rating DESC, dl.usage_frequency DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended progression for a drill
CREATE OR REPLACE FUNCTION get_drill_progression(drill_code_input VARCHAR)
RETURNS TABLE(easier_drills JSONB, harder_drills JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(dl.progressions->'easier', '[]'::jsonb) as easier_drills,
        COALESCE(dl.progressions->'harder', '[]'::jsonb) as harder_drills
    FROM drill_library dl
    WHERE dl.drill_code = drill_code_input
    AND dl.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update drill usage statistics
CREATE OR REPLACE FUNCTION update_drill_usage(drill_code_input VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE drill_library 
    SET usage_frequency = usage_frequency + 1,
        updated_at = NOW()
    WHERE drill_code = drill_code_input;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- EXPLANATION OF KEY CONCEPTS:
-- ===========================================

/*
DRILL LIBRARY STRUCTURE:
This table is like a comprehensive encyclopedia of catching drills.
Each drill has everything the AI coach needs to know:
- What skills it develops
- What equipment is needed  
- How difficult it is
- Step-by-step instructions
- Video demonstrations

JSONB USAGE:
- subcategories: ["glove_move", "presentation"] - flexible skill targeting
- required_equipment: ["tennis_balls", "catchers_gear"] - equipment matching
- coaching_points: ["Keep eyes level", "Stay low"] - key instruction points
- progressions: {"easier": [...], "harder": [...]} - skill progression paths

AI INTEGRATION:
The AI coach uses this data to:
1. Find drills that match available equipment
2. Select appropriate difficulty level
3. Target specific weakness categories
4. Provide proper instructions and coaching points
5. Suggest progressions as players improve

EXAMPLE DRILL ENTRY:
drill_code: "basic_blocking"
drill_name: "Basic Blocking Fundamentals"  
primary_category: "blocking"
secondary_categories: ["receiving"]
subcategories: ["blocking_stance", "ball_control"]
difficulty_level: 2
min_experience: "beginner"
age_groups: ["high_school", "college"]
required_equipment: ["tennis_balls", "catchers_gear"]
optional_equipment: ["home_plate", "protective_screen"]
typical_duration: 8
short_description: "Learn proper blocking stance and technique"
detailed_instructions: "1. Set up in blocking stance behind home plate..."
coaching_points: ["Keep chest over the ball", "Use body to block", "Stay low"]
common_mistakes: ["Standing up too early", "Reaching with glove only"]
demo_video_url: "https://youtube.com/watch?v=blocking123"
workout_phase: "main"
is_active: true

This gives the AI everything needed to recommend and explain this drill!
*/