// seed_drill_library.js
// Database seed script to populate drill_library table with 31 catching drills
// Run this script to insert all drill data into your PostgreSQL database

import pkg from 'pg';
const { Client } = pkg;
import catchingDrillsData from './catching_drills_data.js';

// Database connection configuration
const dbConfig = {
    user: 'mattoneill',          // Your Mac username
    host: 'localhost',           // Local database
    database: 'catching_coach',  // Your database name
    password: '',                // No password needed for local Mac setup
    port: 5432,                 // Default PostgreSQL port
};

// Function to seed the drill library table
async function seedDrillLibrary() {
    const client = new Client(dbConfig);
    
    try {
        // Connect to database
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        
        // Clear existing drill data (optional - remove if you want to keep existing drills)
        console.log('🗑️  Clearing existing drill data...');
        await client.query('DELETE FROM drill_library');
        console.log('✅ Existing drill data cleared');
        
        // Insert each drill into the database
        console.log('📚 Inserting 31 catching drills...');
        
        let insertedCount = 0;
        
        for (const drill of catchingDrillsData) {
            const insertQuery = `
                INSERT INTO drill_library (
                    drill_id,
                    name,
                    category,
                    sub_category,
                    difficulty_level,
                    duration_minutes,
                    equipment_required,
                    equipment_tier,
                    age_range_min,
                    age_range_max,
                    instructions,
                    coaching_points,
                    video_url,
                    common_mistakes,
                    created_at,
                    updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
                )
            `;
            
            const values = [
                drill.id,
                drill.name,
                drill.category,
                drill.sub_category,
                drill.difficulty,
                drill.duration_minutes,
                JSON.stringify(drill.equipment_required), // Convert array to JSON
                drill.equipment_tier,
                drill.age_range[0], // Min age
                drill.age_range[1], // Max age
                JSON.stringify(drill.instructions), // Convert array to JSON
                JSON.stringify(drill.coaching_points), // Convert array to JSON
                drill.video_url,
                JSON.stringify(drill.common_mistakes) // Convert array to JSON
            ];
            
            try {
                await client.query(insertQuery, values);
                insertedCount++;
                console.log(`✅ Inserted drill ${insertedCount}/31: ${drill.name}`);
            } catch (error) {
                console.error(`❌ Error inserting drill ${drill.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully inserted ${insertedCount} drills into drill_library table!`);
        
        // Verify the data was inserted correctly
        const countResult = await client.query('SELECT COUNT(*) FROM drill_library');
        const totalDrills = countResult.rows[0].count;
        console.log(`📊 Total drills in database: ${totalDrills}`);
        
        // Show breakdown by category
        const categoryBreakdown = await client.query(`
            SELECT category, COUNT(*) as count 
            FROM drill_library 
            GROUP BY category 
            ORDER BY category
        `);
        
        console.log('\n📋 Drills by category:');
        categoryBreakdown.rows.forEach(row => {
            console.log(`   ${row.category}: ${row.count} drills`);
        });
        
        // Show breakdown by difficulty
        const difficultyBreakdown = await client.query(`
            SELECT difficulty_level, COUNT(*) as count 
            FROM drill_library 
            GROUP BY difficulty_level 
            ORDER BY difficulty_level
        `);
        
        console.log('\n📈 Drills by difficulty:');
        difficultyBreakdown.rows.forEach(row => {
            console.log(`   Level ${row.difficulty_level}: ${row.count} drills`);
        });
        
        // Show breakdown by equipment tier
        const equipmentBreakdown = await client.query(`
            SELECT equipment_tier, COUNT(*) as count 
            FROM drill_library 
            GROUP BY equipment_tier 
            ORDER BY equipment_tier
        `);
        
        console.log('\n🛠️  Drills by equipment tier:');
        equipmentBreakdown.rows.forEach(row => {
            console.log(`   ${row.equipment_tier}: ${row.count} drills`);
        });
        
    } catch (error) {
        console.error('❌ Error seeding drill library:', error);
        throw error;
    } finally {
        // Close database connection
        await client.end();
        console.log('\n✅ Database connection closed');
    }
}

// Function to test drill data retrieval (useful for validation)
async function testDrillRetrieval() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('\n🔍 Testing drill data retrieval...');
        
        // Test getting drills by category
        const receivingDrills = await client.query(`
            SELECT drill_id, name, difficulty_level, duration_minutes 
            FROM drill_library 
            WHERE category = 'receiving' 
            ORDER BY difficulty_level, name
        `);
        
        console.log(`\n📝 Receiving drills (${receivingDrills.rows.length} found):`);
        receivingDrills.rows.forEach(drill => {
            console.log(`   ${drill.drill_id}: ${drill.name} (Level ${drill.difficulty_level}, ${drill.duration_minutes}min)`);
        });
        
        // Test getting drills by equipment tier
        const basicDrills = await client.query(`
            SELECT drill_id, name, category 
            FROM drill_library 
            WHERE equipment_tier = 'basic' 
            ORDER BY category, name
        `);
        
        console.log(`\n🏐 Basic equipment drills (${basicDrills.rows.length} found):`);
        basicDrills.rows.forEach(drill => {
            console.log(`   ${drill.drill_id}: ${drill.name} (${drill.category})`);
        });
        
        // Test getting a specific drill with all details
        const specificDrill = await client.query(`
            SELECT * FROM drill_library 
            WHERE drill_id = 'receiving_001' 
            LIMIT 1
        `);
        
        if (specificDrill.rows.length > 0) {
            const drill = specificDrill.rows[0];
            console.log(`\n🎯 Sample drill details:`);
            console.log(`   Name: ${drill.name}`);
            console.log(`   Category: ${drill.category} > ${drill.sub_category}`);
            console.log(`   Difficulty: ${drill.difficulty_level}/5`);
            console.log(`   Duration: ${drill.duration_minutes} minutes`);
            console.log(`   Equipment: ${JSON.parse(drill.equipment_required).join(', ')}`);
            console.log(`   Instructions: ${JSON.parse(drill.instructions).length} steps`);
            console.log(`   Coaching Points: ${JSON.parse(drill.coaching_points).length} tips`);
        }
        
    } catch (error) {
        console.error('❌ Error testing drill retrieval:', error);
    } finally {
        await client.end();
    }
}

// Function to run both seeding and testing
async function runFullSeed() {
    try {
        console.log('🚀 Starting drill library seeding process...\n');
        
        // Step 1: Seed the database
        await seedDrillLibrary();
        
        // Step 2: Test the data
        await testDrillRetrieval();
        
        console.log('\n🎉 Drill library seeding completed successfully!');
        console.log('📚 Your AI coach now has access to all 31 catching drills');
        console.log('⚡ Ready to generate personalized workouts!');
        
    } catch (error) {
        console.error('\n💥 Seeding process failed:', error);
        process.exit(1);
    }
}

// Export functions for use in other scripts
export { seedDrillLibrary, testDrillRetrieval, runFullSeed };

// If this script is run directly, execute the full seeding process
if (import.meta.url === `file://${process.argv[1]}`) {
    runFullSeed();
}