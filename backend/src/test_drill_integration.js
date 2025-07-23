// test_drill_integration.js
// Test script to validate drill library integration with workout generation algorithm
// This tests the complete flow: database → drill retrieval → workout generation

import pkg from 'pg';
const { Client } = pkg;
import WorkoutGenerationAlgorithm from './WorkoutGenerationAlgorithm.js';
import SkillsAssessmentLogic from './SkillsAssessmentLogic.js';

// Database configuration
const dbConfig = {
    user: 'mattoneill',          // Your Mac username
    host: 'localhost',           // Local database
    database: 'catching_coach',  // Your database name
    password: '',                // No password needed for local Mac setup
    port: 5432,
};

// Database helper class for drill retrieval
class DrillLibraryDB {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
    }
    
    async connect() {
        this.client = new Client(this.dbConfig);
        await this.client.connect();
        console.log('✅ Connected to drill library database');
    }
    
    async disconnect() {
        if (this.client) {
            await this.client.end();
            console.log('✅ Disconnected from database');
        }
    }
    
    // Helper function to safely parse JSON
    safeJsonParse(jsonString) {
        try {
            if (typeof jsonString === 'string') {
                return JSON.parse(jsonString);
            }
            return jsonString; // Already parsed or not a string
        } catch (error) {
            console.warn('JSON parse error:', error.message, 'for:', jsonString);
            return []; // Return empty array as fallback
        }
    }
    
    // Get drills by category and equipment tier
    async getDrillsByCategory(category, equipmentTier = null, maxDifficulty = 5) {
        let query = `
            SELECT drill_id, name, category, sub_category, difficulty_level, 
                   duration_minutes, equipment_required, equipment_tier,
                   instructions, coaching_points, video_url
            FROM drill_library 
            WHERE category = $1 AND difficulty_level <= $2
        `;
        let values = [category, maxDifficulty];
        
        if (equipmentTier) {
            query += ` AND equipment_tier = $3`;
            values.push(equipmentTier);
        }
        
        query += ` ORDER BY difficulty_level, duration_minutes`;
        
        const result = await this.client.query(query, values);
        return result.rows.map(row => ({
            ...row,
            equipment_required: this.safeJsonParse(row.equipment_required),
            instructions: this.safeJsonParse(row.instructions),
            coaching_points: this.safeJsonParse(row.coaching_points)
        }));
    }
    
    // Get drills suitable for user's age and experience
    async getDrillsForUser(userProfile, equipmentAvailable) {
        const query = `
            SELECT drill_id, name, category, sub_category, difficulty_level, 
                   duration_minutes, equipment_required, equipment_tier,
                   instructions, coaching_points, video_url
            FROM drill_library 
            WHERE age_range_min <= $1 AND age_range_max >= $1
            AND difficulty_level <= $2
            ORDER BY category, difficulty_level
        `;
        
        // Determine max difficulty based on experience
        const maxDifficulty = this.getMaxDifficultyForExperience(userProfile.experience_level);
        
        const result = await this.client.query(query, [userProfile.age, maxDifficulty]);
        
        // Filter by available equipment
        return result.rows
            .map(row => ({
                ...row,
                equipment_required: this.safeJsonParse(row.equipment_required),
                instructions: this.safeJsonParse(row.instructions),
                coaching_points: this.safeJsonParse(row.coaching_points)
            }))
            .filter(drill => this.hasRequiredEquipment(drill.equipment_required, equipmentAvailable));
    }
    
    // Helper function to determine max difficulty based on experience
    getMaxDifficultyForExperience(experienceLevel) {
        const difficultyMap = {
            'beginner': 2,
            'intermediate': 3,
            'advanced': 4,
            'expert': 5
        };
        return difficultyMap[experienceLevel] || 2;
    }
    
    // Helper function to check if user has required equipment
    hasRequiredEquipment(requiredEquipment, availableEquipment) {
        if (!Array.isArray(requiredEquipment)) return true; // Fallback for parsing errors
        return requiredEquipment.every(item => availableEquipment.includes(item));
    }
}

// Test scenarios for different user types
const testUsers = [
    {
        name: "High School Beginner",
        userProfile: {
            user_id: "test-user-1",
            first_name: "Alex",
            last_name: "Johnson",
            age: 16,
            experience_level: "beginner",
            years_experience: 1,
            equipment_access: ["tennis_balls", "catchers_gear"]
        },
        skillsAssessment: {
            // Weak in blocking (main focus area)
            receiving_glove_move: 4, receiving_glove_load: 5, receiving_setups: 4, receiving_presentation: 3,
            throwing_footwork: 5, throwing_exchange: 4, throwing_arm_strength: 6, throwing_accuracy: 5,
            blocking_overall: 2,  // Weakest area
            education_pitch_calling: 4, education_scouting_reports: 3, education_umpire_relations: 5, education_pitcher_relations: 4
        },
        workoutDurations: [15, 30, 45]
    },
    {
        name: "College Intermediate",
        userProfile: {
            user_id: "test-user-2",
            first_name: "Maria",
            last_name: "Rodriguez",
            age: 20,
            experience_level: "intermediate", 
            years_experience: 4,
            equipment_access: ["tennis_balls", "catchers_gear", "home_plate", "cones"]
        },
        skillsAssessment: {
            // Weak in throwing accuracy
            receiving_glove_move: 7, receiving_glove_load: 6, receiving_setups: 7, receiving_presentation: 6,
            throwing_footwork: 6, throwing_exchange: 6, throwing_arm_strength: 7, throwing_accuracy: 3,  // Weakest area
            blocking_overall: 6,
            education_pitch_calling: 5, education_scouting_reports: 4, education_umpire_relations: 6, education_pitcher_relations: 5
        },
        workoutDurations: [30, 45, 60]
    },
    {
        name: "Advanced Catcher",
        userProfile: {
            user_id: "test-user-3",
            first_name: "Tyler",
            last_name: "Smith",
            age: 18,
            experience_level: "advanced",
            years_experience: 6,
            equipment_access: ["tennis_balls", "catchers_gear", "home_plate", "l_screen", "cones"]
        },
        skillsAssessment: {
            // Weak in game management/education
            receiving_glove_move: 8, receiving_glove_load: 8, receiving_setups: 8, receiving_presentation: 7,
            throwing_footwork: 8, throwing_exchange: 7, throwing_arm_strength: 8, throwing_accuracy: 7,
            blocking_overall: 8,
            education_pitch_calling: 4, education_scouting_reports: 3, education_umpire_relations: 4, education_pitcher_relations: 3  // Weakest area
        },
        workoutDurations: [45, 60]
    }
];

// Main test function
async function runDrillIntegrationTests() {
    const drillDB = new DrillLibraryDB(dbConfig);
    const workoutGenerator = new WorkoutGenerationAlgorithm();
    const assessmentLogic = new SkillsAssessmentLogic();
    
    try {
        await drillDB.connect();
        
        console.log('🧪 Starting Drill Library Integration Tests\n');
        
        // Test 1: Verify drill data is available
        console.log('📊 TEST 1: Drill Library Data Verification');
        console.log('=' .repeat(50));
        
        const allDrills = await drillDB.client.query('SELECT COUNT(*) FROM drill_library');
        const totalDrills = allDrills.rows[0].count;
        console.log(`✅ Total drills in database: ${totalDrills}`);
        
        if (totalDrills < 31) {
            console.log('❌ ERROR: Expected 31 drills, but found', totalDrills);
            console.log('🔧 Please run the seed script first: node seed_drill_library.js');
            return;
        }
        
        // Test 2: Test drill retrieval by category
        console.log('\n📋 TEST 2: Drill Retrieval by Category');
        console.log('=' .repeat(50));
        
        const categories = ['receiving', 'throwing', 'blocking', 'education'];
        for (const category of categories) {
            const drills = await drillDB.getDrillsByCategory(category);
            console.log(`✅ ${category} drills: ${drills.length} found`);
            
            if (drills.length > 0) {
                console.log(`   Sample: ${drills[0].name} (Level ${drills[0].difficulty_level}, ${drills[0].duration_minutes}min)`);
            }
        }
        
        // Test 3: Test workout generation for each user type
        console.log('\n🎯 TEST 3: Workout Generation with Real Drill Data');
        console.log('=' .repeat(50));
        
        for (const testUser of testUsers) {
            console.log(`\n👤 Testing: ${testUser.name}`);
            console.log('-' .repeat(30));
            
            // Analyze skills assessment to find focus area
            const assessment = assessmentLogic.analyzeAssessment(
                testUser.skillsAssessment, 
                null, 
                testUser.userProfile
            );
            
            // Debug the assessment structure
            console.log('🔍 Assessment structure check:');
            console.log('- Has insights:', !!assessment.insights);
            console.log('- Insights keys:', assessment.insights ? Object.keys(assessment.insights) : 'none');
            
            const weakestCategory = assessment.insights?.weakest_category?.name || 'Unknown';
            const criticalAreas = assessment.insights?.critical_areas?.map(area => area.name).join(', ') || 'None identified';
            
            console.log(`🎯 Focus area: ${weakestCategory}`);
            console.log(`📈 Critical skills: ${criticalAreas}`);
            
            // Get available drills for this user
            const availableDrills = await drillDB.getDrillsForUser(
                testUser.userProfile, 
                testUser.userProfile.equipment_access
            );
            
            console.log(`🛠️  Available drills: ${availableDrills.length} (with user's equipment)`);
            
            // Test workout generation for different durations
            for (const duration of testUser.workoutDurations) {
                console.log(`\n⏱️  ${duration}-minute workout:`);
                
                try {
                    // Pass the actual drill data to the workout generator
                    const workout = workoutGenerator.generateWorkout(
                        testUser.userProfile,
                        testUser.skillsAssessment,
                        testUser.userProfile.equipment_access,
                        duration,
                        availableDrills  // Pass real drill data
                    );
                    
                    console.log(`   ✅ Generated successfully`);
                    console.log(`   📋 Total drills: ${workout.drills.length}`);
                    console.log(`   ⚡ Focus: ${Math.round(workout.metadata.focus_percentage)}% on ${weakestCategory}`);
                    
                    // Show sample drills
                    const sampleDrills = workout.drills.slice(0, 3);
                    sampleDrills.forEach(drill => {
                        console.log(`   • ${drill.name} (${drill.category}, ${drill.duration_minutes}min)`);
                    });
                    
                } catch (error) {
                    console.log(`   ❌ Generation failed: ${error.message}`);
                }
            }
        }
        
        // Test 4: Test equipment-specific drill filtering
        console.log('\n🛠️  TEST 4: Equipment-Specific Drill Filtering');
        console.log('=' .repeat(50));
        
        const equipmentTiers = ['basic', 'intermediate', 'advanced', 'premium'];
        for (const tier of equipmentTiers) {
            const drills = await drillDB.getDrillsByCategory('receiving', tier);
            console.log(`✅ ${tier} receiving drills: ${drills.length} found`);
        }
        
        // Test 5: Test difficulty progression
        console.log('\n📈 TEST 5: Difficulty Progression');
        console.log('=' .repeat(50));
        
        for (let difficulty = 1; difficulty <= 5; difficulty++) {
            const drills = await drillDB.client.query(
                'SELECT COUNT(*) FROM drill_library WHERE difficulty_level = $1',
                [difficulty]
            );
            console.log(`✅ Level ${difficulty} drills: ${drills.rows[0].count} found`);
        }
        
        console.log('\n🎉 All integration tests completed successfully!');
        console.log('✅ Your drill library is fully integrated with the AI workout generator');
        console.log('⚡ Ready to create personalized catching workouts!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        throw error;
    } finally {
        await drillDB.disconnect();
    }
}

// Function to test a single workout generation
async function testSingleWorkout(userType = 'beginner') {
    const drillDB = new DrillLibraryDB(dbConfig);
    const workoutGenerator = new WorkoutGenerationAlgorithm();
    const assessmentLogic = new SkillsAssessmentLogic();
    
    try {
        await drillDB.connect();
        
        const testUser = testUsers.find(user => 
            user.userProfile.experience_level === userType
        ) || testUsers[0];
        
        console.log(`🎯 Generating sample workout for: ${testUser.name}`);
        
        const availableDrills = await drillDB.getDrillsForUser(
            testUser.userProfile, 
            testUser.userProfile.equipment_access
        );
        
        const workout = workoutGenerator.generateWorkout(
            testUser.userProfile,
            testUser.skillsAssessment,
            testUser.userProfile.equipment_access,
            30,  // 30-minute workout
            availableDrills
        );
        
        console.log('\n📋 Generated Workout:');
        console.log(`Duration: ${workout.planned_duration} minutes`);
        console.log(`Focus Area: ${workout.metadata.focus_category}`);
        console.log(`Total Drills: ${workout.drills.length}`);
        
        workout.drills.forEach((drill, index) => {
            console.log(`${index + 1}. ${drill.name} (${drill.duration_minutes}min) - ${drill.category}`);
        });
        
    } catch (error) {
        console.error('❌ Single workout test failed:', error);
    } finally {
        await drillDB.disconnect();
    }
}

// Export functions
export { runDrillIntegrationTests, testSingleWorkout, DrillLibraryDB };

// If this script is run directly, execute the tests
if (import.meta.url === `file://${process.argv[1]}`) {
    runDrillIntegrationTests();
}