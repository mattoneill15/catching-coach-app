#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates the database schema and seeds initial data
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../backend/.env' });

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'mattoneill',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres' // Connect to default database first
};

const targetDbName = process.env.DB_NAME || 'catching_coach_db';

async function setupDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    
    // Check if database exists
    const dbCheckResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDbName]
    );
    
    if (dbCheckResult.rows.length === 0) {
      console.log(`📦 Creating database: ${targetDbName}`);
      await client.query(`CREATE DATABASE ${targetDbName}`);
    } else {
      console.log(`✅ Database ${targetDbName} already exists`);
    }
    
    await client.end();
    
    // Connect to the target database
    const targetClient = new Client({
      ...dbConfig,
      database: targetDbName
    });
    
    await targetClient.connect();
    console.log(`🔗 Connected to ${targetDbName}`);
    
    // Read and execute schema files in order
    const schemaFiles = [
      '01_user_profiles_table.sql',
      '02_skills_assessments_table.sql',
      '03_workout_sessions_table.sql',
      '04_drill_library_table.sql',
      '05_progress_tracking_table.sql'
    ];
    
    for (const file of schemaFiles) {
      console.log(`📋 Executing schema: ${file}`);
      const schemaPath = join(__dirname, 'schema', file);
      const schemaSql = await readFile(schemaPath, 'utf8');
      await targetClient.query(schemaSql);
      console.log(`✅ ${file} executed successfully`);
    }
    
    console.log('🎉 Database schema setup complete!');
    
    await targetClient.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

async function seedDrills() {
  const client = new Client({
    ...dbConfig,
    database: targetDbName
  });
  
  try {
    await client.connect();
    console.log('🌱 Starting drill seeding...');
    
    // Import and run the drill seeding
    const { default: seedDrillLibrary } = await import('./seeds/seed_catching_drills.js');
    await seedDrillLibrary();
    
    console.log('✅ Drill seeding complete!');
    await client.end();
    
  } catch (error) {
    console.error('❌ Drill seeding failed:', error.message);
    await client.end();
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Catching Coach Database Setup...\n');
  
  await setupDatabase();
  await seedDrills();
  
  console.log('\n🎯 Database setup complete! Ready to start the servers.');
  console.log('\nNext steps:');
  console.log('1. Copy backend/.env.example to backend/.env and configure your database credentials');
  console.log('2. Run: cd backend && npm install && npm start');
  console.log('3. Run: cd frontend && npm install && npm start');
}

main().catch(console.error);
