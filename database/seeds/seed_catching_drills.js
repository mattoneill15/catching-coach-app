// seed_catching_drills.js
// Proper seed script to populate drill_library table with catching-specific drills
// Transforms the drill data to match the database schema

import pkg from 'pg';
const { Client } = pkg;
import catchingDrillsData from './catching_drills_data.js';

// Database connection configuration
const dbConfig = {
    user: 'mattoneill',
    host: 'localhost',
    database: 'catching_coach_db', // Correct database name
    password: '',
    port: 5432,
};

// Function to transform drill data to match database schema
function transformDrillForDatabase(drill) {
    return {
        drill_code: drill.id,
        drill_name: drill.name,
        primary_category: drill.category,
        secondary_categories: [], // Can be populated later if needed
        subcategories: [drill.sub_category], // Convert single string to array
        difficulty_level: drill.difficulty,
        min_experience: getExperienceLevel(drill.difficulty),
        age_groups: [`${drill.age_range[0]}_plus`], // Convert age range to groups
        prerequisites: [], // Can be populated later if needed
        progressions: {}, // Can be populated later if needed
        required_equipment: drill.equipment_required,
        optional_equipment: [], // Can be populated later if needed
        space_requirements: getSpaceRequirement(drill.equipment_required),
        indoor_suitable: true, // Most catching drills can be done indoors
        requires_partner: drill.equipment_required.includes('partner') || drill.equipment_required.includes('coach'),
        typical_duration: drill.duration_minutes,
        min_duration: Math.max(1, drill.duration_minutes - 2),
        max_duration: drill.duration_minutes + 3,
        recommended_reps: getRecommendedReps(drill.category, drill.duration_minutes),
        workout_phase: getWorkoutPhase(drill.difficulty),
        short_description: getShortDescription(drill),
        detailed_instructions: drill.instructions.join('\n'),
        coaching_points: drill.coaching_points,
        common_mistakes: drill.common_mistakes,
        progressions_easier: [], // Can be populated later
        progressions_harder: [], // Can be populated later
        demo_video_url: drill.video_url || null,
        usage_frequency: 0,
        average_rating: 0.0,
        rating_count: 0,
        effectiveness_rating: 0.0,
        is_active: true,
        created_by: 'system',
        version: 1
    };
}

// Helper functions to derive missing data
function getExperienceLevel(difficulty) {
    if (difficulty <= 2) return 'beginner';
    if (difficulty === 3) return 'intermediate';
    return 'advanced';
}

function getSpaceRequirement(equipment) {
    if (equipment.includes('full_field') || equipment.includes('bases')) return 'large';
    if (equipment.includes('home_plate') || equipment.includes('mound')) return 'medium';
    return 'small';
}

function getRecommendedReps(category, duration) {
    switch (category) {
        case 'receiving': return '15-20 catches';
        case 'throwing': return '10-15 throws';
        case 'blocking': return '8-12 blocks';
        case 'education': return '5-10 scenarios';
        default: return '10-15 reps';
    }
}

function getWorkoutPhase(difficulty) {
    if (difficulty <= 2) return 'warmup';
    if (difficulty >= 4) return 'main';
    return 'skill_work';
}

function getShortDescription(drill) {
    const categoryDescriptions = {
        receiving: 'Develop catching fundamentals and presentation skills',
        throwing: 'Improve throwing mechanics and accuracy',
        blocking: 'Master blocking technique and ball control',
        education: 'Build game management and communication skills'
    };
    return categoryDescriptions[drill.category] || 'Catching skill development drill';
}

// Main seeding function
async function seedCatchingDrills() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        
        // Clear existing drill data
        console.log('🗑️  Clearing existing drill data...');
        await client.query('DELETE FROM drill_library');
        console.log('✅ Existing drill data cleared');
        
        // Filter and transform catching drills only
        const catchingDrills = catchingDrillsData.filter(drill => 
            ['receiving', 'throwing', 'blocking', 'education'].includes(drill.category)
        );
        
        console.log(`📚 Inserting ${catchingDrills.length} catching drills...`);
        
        let insertedCount = 0;
        
        for (const drill of catchingDrills) {
            const transformedDrill = transformDrillForDatabase(drill);
            
            const insertQuery = `
                INSERT INTO drill_library (
                    drill_code, drill_name, primary_category, secondary_categories, subcategories,
                    difficulty_level, min_experience, age_groups, prerequisites, progressions,
                    required_equipment, optional_equipment, space_requirements, indoor_suitable, requires_partner,
                    typical_duration, min_duration, max_duration, recommended_reps, workout_phase,
                    short_description, detailed_instructions, coaching_points, common_mistakes,
                    demo_video_url, usage_frequency, average_rating, rating_count, effectiveness_rating,
                    is_active, created_by, version, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                    $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
                    $30, $31, $32, NOW(), NOW()
                )
            `;
            
            const values = [
                transformedDrill.drill_code,
                transformedDrill.drill_name,
                transformedDrill.primary_category,
                JSON.stringify(transformedDrill.secondary_categories),
                JSON.stringify(transformedDrill.subcategories),
                transformedDrill.difficulty_level,
                transformedDrill.min_experience,
                JSON.stringify(transformedDrill.age_groups),
                JSON.stringify(transformedDrill.prerequisites),
                JSON.stringify(transformedDrill.progressions),
                JSON.stringify(transformedDrill.required_equipment),
                JSON.stringify(transformedDrill.optional_equipment),
                transformedDrill.space_requirements,
                transformedDrill.indoor_suitable,
                transformedDrill.requires_partner,
                transformedDrill.typical_duration,
                transformedDrill.min_duration,
                transformedDrill.max_duration,
                transformedDrill.recommended_reps,
                transformedDrill.workout_phase,
                transformedDrill.short_description,
                transformedDrill.detailed_instructions,
                JSON.stringify(transformedDrill.coaching_points),
                JSON.stringify(transformedDrill.common_mistakes),
                transformedDrill.demo_video_url,
                transformedDrill.usage_frequency,
                transformedDrill.average_rating,
                transformedDrill.rating_count,
                transformedDrill.effectiveness_rating,
                transformedDrill.is_active,
                transformedDrill.created_by,
                transformedDrill.version
            ];
            
            try {
                await client.query(insertQuery, values);
                insertedCount++;
                console.log(`✅ Inserted drill ${insertedCount}/${catchingDrills.length}: ${transformedDrill.drill_name}`);
            } catch (error) {
                console.error(`❌ Error inserting drill ${transformedDrill.drill_name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully inserted ${insertedCount} catching drills!`);
        
        // Verify the data
        const countResult = await client.query('SELECT COUNT(*) FROM drill_library');
        const totalDrills = countResult.rows[0].count;
        console.log(`📊 Total drills in database: ${totalDrills}`);
        
        // Show breakdown by category
        const categoryBreakdown = await client.query(`
            SELECT primary_category, COUNT(*) as count 
            FROM drill_library 
            GROUP BY primary_category 
            ORDER BY primary_category
        `);
        
        console.log('\n📋 Drills by category:');
        categoryBreakdown.rows.forEach(row => {
            console.log(`   ${row.primary_category}: ${row.count} drills`);
        });
        
        // Show breakdown by difficulty
        const difficultyBreakdown = await client.query(`
            SELECT difficulty_level, COUNT(*) as count 
            FROM drill_library 
            GROUP BY difficulty_level 
            ORDER BY difficulty_level
        `);
        
        console.log('\n⭐ Drills by difficulty:');
        difficultyBreakdown.rows.forEach(row => {
            console.log(`   Level ${row.difficulty_level}: ${row.count} drills`);
        });
        
        // Test a sample drill
        const sampleDrill = await client.query(`
            SELECT drill_code, drill_name, primary_category, subcategories, difficulty_level, typical_duration
            FROM drill_library 
            WHERE primary_category = 'receiving'
            LIMIT 1
        `);
        
        if (sampleDrill.rows.length > 0) {
            const drill = sampleDrill.rows[0];
            console.log(`\n🎯 Sample drill:`);
            console.log(`   Code: ${drill.drill_code}`);
            console.log(`   Name: ${drill.drill_name}`);
            console.log(`   Category: ${drill.primary_category} > ${JSON.parse(drill.subcategories).join(', ')}`);
            console.log(`   Difficulty: ${drill.difficulty_level}/5`);
            console.log(`   Duration: ${drill.typical_duration} minutes`);
        }
        
    } catch (error) {
        console.error('❌ Error seeding catching drills:', error);
        throw error;
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed');
    }
}

// Test drill retrieval for workout generation
async function testDrillRetrieval() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('\n🔍 Testing drill retrieval for workout generation...');
        
        // Test getting drills by equipment (basic equipment)
        const basicEquipmentDrills = await client.query(`
            SELECT drill_code, drill_name, primary_category, required_equipment
            FROM drill_library 
            WHERE required_equipment @> '["tennis_balls"]'
            ORDER BY primary_category, difficulty_level
        `);
        
        console.log(`\n🏐 Drills using tennis balls (${basicEquipmentDrills.rows.length} found):`);
        basicEquipmentDrills.rows.slice(0, 5).forEach(drill => {
            console.log(`   ${drill.drill_code}: ${drill.drill_name} (${drill.primary_category})`);
        });
        
        // Test getting drills by category and difficulty
        const beginnerReceivingDrills = await client.query(`
            SELECT drill_code, drill_name, difficulty_level, typical_duration
            FROM drill_library 
            WHERE primary_category = 'receiving' AND difficulty_level <= 2
            ORDER BY difficulty_level
        `);
        
        console.log(`\n📝 Beginner receiving drills (${beginnerReceivingDrills.rows.length} found):`);
        beginnerReceivingDrills.rows.forEach(drill => {
            console.log(`   ${drill.drill_code}: ${drill.drill_name} (Level ${drill.difficulty_level}, ${drill.typical_duration}min)`);
        });
        
    } catch (error) {
        console.error('❌ Error testing drill retrieval:', error);
    } finally {
        await client.end();
    }
}

// Main execution function
async function runCatchingDrillSeed() {
    try {
        console.log('🚀 Starting catching drill seeding process...\n');
        
        await seedCatchingDrills();
        await testDrillRetrieval();
        
        console.log('\n🎉 Catching drill seeding completed successfully!');
        console.log('📚 Your AI coach now has access to all catching-specific drills');
        console.log('⚡ Ready to generate personalized catching workouts!');
        
    } catch (error) {
        console.error('\n💥 Seeding process failed:', error);
        process.exit(1);
    }
}

// Export functions
export { seedCatchingDrills, testDrillRetrieval, runCatchingDrillSeed };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCatchingDrillSeed();
}
