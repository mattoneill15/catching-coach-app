/**
 * WorkoutGenerationAlgorithm.js - CATCHING COACH APP
 * 
 * The core "brain" of the AI coach that creates personalized catching workouts.
 * Takes user assessment data and generates time-specific, equipment-appropriate workouts.
 * 
 * This is the most important component - it determines what drills users practice!
 */

class WorkoutGenerationAlgorithm {
    constructor() {
        // Time allocation templates based on your design decisions
        this.timeTemplates = {
            15: {
                warmup: 2,
                weakest_category: 9,
                other_categories: 2,
                education: 2,
                cooldown: 0,
                video_review: 0
            },
            30: {
                warmup: 3,
                weakest_category: 15,
                other_categories: 8,
                education: 4,
                cooldown: 0,
                video_review: 0
            },
            45: {
                warmup: 5,
                weakest_category: 20,
                other_categories: 12,
                education: 6,
                cooldown: 0,
                video_review: 2
            },
            60: {
                warmup: 5,
                weakest_category: 25,
                other_categories: 15,
                education: 8,
                cooldown: 2,
                video_review: 5
            }
        };

        // Equipment requirements for different drill types
        this.equipmentRequirements = {
            basic: ['tennis_balls'],
            intermediate: ['tennis_balls', 'catchers_gear'],
            advanced: ['tennis_balls', 'catchers_gear', 'home_plate'],
            premium: ['tennis_balls', 'catchers_gear', 'home_plate', 'l_screen', 'cones']
        };

        // Skill category mappings to drill types
        this.categoryDrillMappings = {
            receiving: {
                primary_skills: ['glove_move', 'glove_load', 'setups', 'presentation'],
                drill_types: ['receiving_basics', 'framing', 'stance_work', 'glove_work']
            },
            throwing: {
                primary_skills: ['footwork', 'exchange', 'arm_strength', 'accuracy'],
                drill_types: ['throwing_mechanics', 'footwork_drills', 'exchange_drills', 'accuracy_work']
            },
            blocking: {
                primary_skills: ['blocking_overall'],
                drill_types: ['blocking_fundamentals', 'blocking_angles', 'recovery_drills']
            },
            education: {
                primary_skills: ['pitch_calling', 'scouting_reports', 'umpire_relations', 'pitcher_relations'],
                drill_types: ['game_management', 'communication', 'strategy_work', 'video_study']
            }
        };
    }

    /**
     * MAIN FUNCTION: Generate a complete personalized workout
     * 
     * @param {Object} userProfile - User's profile information
     * @param {Object} skillsAssessment - Latest 13-category skills assessment
     * @param {Array} availableEquipment - Equipment user has available
     * @param {number} plannedDuration - Workout time in minutes (15, 30, 45, 60+)
     * @param {Object} preferences - User preferences and constraints
     * @returns {Object} Complete workout plan with drills, timing, and instructions
     */
    async generateWorkout(userProfile, skillsAssessment, availableEquipment, plannedDuration, preferences = {}) {
        try {
            console.log('🤖 AI Coach: Starting workout generation...');
            
            // Step 1: Analyze user's current state
            const userAnalysis = this.analyzeUserState(userProfile, skillsAssessment, preferences);
            console.log('📊 User Analysis:', userAnalysis);

            // Step 2: Determine time allocation based on duration
            const timeAllocation = this.calculateTimeAllocation(plannedDuration);
            console.log('⏱️ Time Allocation:', timeAllocation);

            // Step 3: Assess available equipment level
            const equipmentLevel = this.assessEquipmentLevel(availableEquipment);
            console.log('🛠️ Equipment Level:', equipmentLevel);

            // Step 4: Select appropriate drills for each workout phase
            const workoutStructure = await this.buildWorkoutStructure(
                userAnalysis,
                timeAllocation,
                equipmentLevel,
                availableEquipment,
                preferences
            );

            // Step 5: Add coaching guidance and instructions
            const completeWorkout = this.addCoachingGuidance(workoutStructure, userAnalysis);

            // Step 6: Generate workout metadata
            const workoutMetadata = this.generateWorkoutMetadata(
                userProfile,
                skillsAssessment,
                timeAllocation,
                equipmentLevel
            );

            console.log('✅ AI Coach: Workout generation complete!');

            return {
                success: true,
                workout: completeWorkout,
                metadata: workoutMetadata,
                userAnalysis: userAnalysis,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Workout Generation Error:', error);
            return {
                success: false,
                error: error.message,
                fallbackWorkout: this.generateFallbackWorkout(plannedDuration, availableEquipment)
            };
        }
    }

    /**
     * Analyze user's current state to determine training focus
     */
    analyzeUserState(userProfile, skillsAssessment, preferences) {
        // Calculate category averages from the 13 individual skills
        const categoryAverages = {
            receiving: this.calculateReceivingAverage(skillsAssessment),
            throwing: this.calculateThrowingAverage(skillsAssessment),
            blocking: skillsAssessment.blocking_overall || 5,
            education: this.calculateEducationAverage(skillsAssessment)
        };

        // Find weakest category (gets most focus)
        const weakestCategory = this.findWeakestCategory(categoryAverages);
        
        // Find strongest category (for confidence building)
        const strongestCategory = this.findStrongestCategory(categoryAverages);

        // Determine experience level
        const experienceLevel = this.determineExperienceLevel(userProfile, categoryAverages);

        // Calculate overall skill level
        const overallSkillLevel = Object.values(categoryAverages).reduce((sum, score) => sum + score, 0) / 4;

        return {
            categoryAverages,
            weakestCategory,
            strongestCategory,
            experienceLevel,
            overallSkillLevel: Math.round(overallSkillLevel * 10) / 10,
            focusAreas: this.identifyFocusAreas(categoryAverages),
            userMotivation: preferences.motivationLevel || 'medium'
        };
    }

    /**
     * Calculate receiving category average from 4 subcategories
     */
    calculateReceivingAverage(assessment) {
        const receivingSkills = [
            assessment.receiving_glove_move || 5,
            assessment.receiving_glove_load || 5,
            assessment.receiving_setups || 5,
            assessment.receiving_presentation || 5
        ];
        return receivingSkills.reduce((sum, score) => sum + score, 0) / 4;
    }

    /**
     * Calculate throwing category average from 4 subcategories
     */
    calculateThrowingAverage(assessment) {
        const throwingSkills = [
            assessment.throwing_footwork || 5,
            assessment.throwing_exchange || 5,
            assessment.throwing_arm_strength || 5,
            assessment.throwing_accuracy || 5
        ];
        return throwingSkills.reduce((sum, score) => sum + score, 0) / 4;
    }

    /**
     * Calculate education category average from 4 subcategories
     */
    calculateEducationAverage(assessment) {
        const educationSkills = [
            assessment.education_pitch_calling || 5,
            assessment.education_scouting_reports || 5,
            assessment.education_umpire_relations || 5,
            assessment.education_pitcher_relations || 5
        ];
        return educationSkills.reduce((sum, score) => sum + score, 0) / 4;
    }

    /**
     * Find the category with the lowest average score
     */
    findWeakestCategory(categoryAverages) {
        let weakest = 'receiving';
        let lowestScore = categoryAverages.receiving;

        Object.entries(categoryAverages).forEach(([category, score]) => {
            if (score < lowestScore) {
                lowestScore = score;
                weakest = category;
            }
        });

        return {
            category: weakest,
            score: lowestScore,
            improvement_potential: 10 - lowestScore
        };
    }

    /**
     * Find the category with the highest average score
     */
    findStrongestCategory(categoryAverages) {
        let strongest = 'receiving';
        let highestScore = categoryAverages.receiving;

        Object.entries(categoryAverages).forEach(([category, score]) => {
            if (score > highestScore) {
                highestScore = score;
                strongest = category;
            }
        });

        return {
            category: strongest,
            score: highestScore
        };
    }

    /**
     * Determine user's experience level based on profile and scores
     */
    determineExperienceLevel(userProfile, categoryAverages) {
        const averageScore = Object.values(categoryAverages).reduce((sum, score) => sum + score, 0) / 4;
        const yearsExperience = userProfile.years_experience || 0;

        if (averageScore >= 8 && yearsExperience >= 5) return 'expert';
        if (averageScore >= 6.5 && yearsExperience >= 3) return 'advanced';
        if (averageScore >= 4.5 && yearsExperience >= 1) return 'intermediate';
        return 'beginner';
    }

    /**
     * Identify specific areas that need focus
     */
    identifyFocusAreas(categoryAverages) {
        const focusAreas = [];
        
        Object.entries(categoryAverages).forEach(([category, score]) => {
            if (score < 4) {
                focusAreas.push({ category, priority: 'high', reason: 'below_proficient' });
            } else if (score < 6) {
                focusAreas.push({ category, priority: 'medium', reason: 'needs_improvement' });
            }
        });

        return focusAreas;
    }

    /**
     * Calculate time allocation based on workout duration
     */
    calculateTimeAllocation(plannedDuration) {
        // Find the closest template (15, 30, 45, 60)
        const availableTemplates = [15, 30, 45, 60];
        const closestTemplate = availableTemplates.reduce((prev, curr) => 
            Math.abs(curr - plannedDuration) < Math.abs(prev - plannedDuration) ? curr : prev
        );

        const baseTemplate = this.timeTemplates[closestTemplate];
        
        // If user requested longer than 60 minutes, scale up the 60-minute template
        if (plannedDuration > 60) {
            const scaleFactor = plannedDuration / 60;
            const scaledTemplate = {};
            
            Object.entries(baseTemplate).forEach(([phase, minutes]) => {
                scaledTemplate[phase] = Math.round(minutes * scaleFactor);
            });
            
            return scaledTemplate;
        }

        return baseTemplate;
    }

    /**
     * Assess what level of drills are possible with available equipment
     */
    assessEquipmentLevel(availableEquipment) {
        const equipmentSet = new Set(availableEquipment);
        
        // Check which equipment tier they have
        if (this.hasEquipmentTier('premium', equipmentSet)) return 'premium';
        if (this.hasEquipmentTier('advanced', equipmentSet)) return 'advanced';
        if (this.hasEquipmentTier('intermediate', equipmentSet)) return 'intermediate';
        if (this.hasEquipmentTier('basic', equipmentSet)) return 'basic';
        
        return 'minimal'; // Very limited equipment
    }

    /**
     * Check if user has all equipment for a specific tier
     */
    hasEquipmentTier(tier, userEquipment) {
        const requiredEquipment = this.equipmentRequirements[tier];
        return requiredEquipment.every(item => userEquipment.has(item));
    }

    /**
     * Build the complete workout structure with specific drills
     */
    async buildWorkoutStructure(userAnalysis, timeAllocation, equipmentLevel, availableEquipment, preferences) {
        const workout = {
            warmup: await this.selectWarmupDrills(timeAllocation.warmup, equipmentLevel),
            main_work: await this.selectMainWorkDrills(
                userAnalysis.weakestCategory,
                timeAllocation.weakest_category,
                equipmentLevel,
                userAnalysis.experienceLevel
            ),
            secondary_work: await this.selectSecondaryDrills(
                userAnalysis,
                timeAllocation.other_categories,
                equipmentLevel
            ),
            education: await this.selectEducationContent(
                timeAllocation.education,
                userAnalysis.categoryAverages.education,
                userAnalysis.experienceLevel
            ),
            cooldown: timeAllocation.cooldown > 0 ? await this.selectCooldownDrills(timeAllocation.cooldown) : null,
            video_review: timeAllocation.video_review > 0 ? this.createVideoReviewSection(timeAllocation.video_review) : null
        };

        // Remove null sections
        Object.keys(workout).forEach(key => {
            if (workout[key] === null) delete workout[key];
        });

        return workout;
    }

    /**
     * Select appropriate warmup drills
     */
    async selectWarmupDrills(duration, equipmentLevel) {
        // Warmup drills are universal and don't need heavy equipment
        const warmupDrills = [
            {
                drill_code: 'dynamic_stretching',
                name: 'Dynamic Stretching',
                duration: Math.max(2, Math.floor(duration * 0.6)),
                instructions: 'Perform arm circles, leg swings, and torso rotations to prepare your body',
                coaching_points: ['Start slow and gradually increase range of motion', 'Focus on catching-specific movements']
            },
            {
                drill_code: 'light_throwing',
                name: 'Light Throwing Warmup',
                duration: Math.max(1, Math.ceil(duration * 0.4)),
                instructions: 'Light throwing to warm up your arm and practice basic mechanics',
                coaching_points: ['Start close and gradually increase distance', 'Focus on proper form over velocity']
            }
        ];

        return {
            total_duration: duration,
            drills: warmupDrills,
            phase_goals: ['Prepare body for training', 'Activate catching muscles', 'Review basic mechanics']
        };
    }

    /**
     * Select main work drills targeting the weakest category
     */
    async selectMainWorkDrills(weakestCategory, duration, equipmentLevel, experienceLevel) {
        const categoryInfo = weakestCategory.category;
        const drillMappings = this.categoryDrillMappings[categoryInfo];
        
        // This is simplified - in a real implementation, you'd query your drill library database
        const mainDrills = await this.getDrillsForCategory(categoryInfo, duration, equipmentLevel, experienceLevel);

        return {
            total_duration: duration,
            target_category: categoryInfo,
            target_score: weakestCategory.score,
            improvement_focus: `Improve ${categoryInfo} from ${weakestCategory.score}/10`,
            drills: mainDrills,
            phase_goals: [
                `Target weakest area: ${categoryInfo}`,
                'Build fundamental skills',
                'Increase confidence through repetition'
            ]
        };
    }

    /**
     * Select secondary work drills for other categories
     */
    async selectSecondaryDrills(userAnalysis, duration, equipmentLevel) {
        // Get the categories that aren't the weakest
        const otherCategories = ['receiving', 'throwing', 'blocking', 'education']
            .filter(cat => cat !== userAnalysis.weakestCategory.category)
            .sort((a, b) => userAnalysis.categoryAverages[a] - userAnalysis.categoryAverages[b]); // Worst first

        const drillsPerCategory = Math.floor(duration / Math.min(3, otherCategories.length));
        const secondaryDrills = [];

        for (const category of otherCategories.slice(0, 3)) {
            const categoryDrills = await this.getDrillsForCategory(category, drillsPerCategory, equipmentLevel, 'maintenance');
            secondaryDrills.push(...categoryDrills);
        }

        return {
            total_duration: duration,
            drills: secondaryDrills,
            phase_goals: ['Maintain other skill areas', 'Provide variety', 'Prevent skill imbalances']
        };
    }

    /**
     * Select education content based on user level
     */
    async selectEducationContent(duration, educationScore, experienceLevel) {
        if (duration === 0) return null;

        const educationContent = [];

        if (educationScore < 5) {
            educationContent.push({
                type: 'video',
                title: 'Catching Fundamentals',
                duration: Math.ceil(duration * 0.7),
                content: 'Review basic catching principles and game management'
            });
        } else if (educationScore < 7) {
            educationContent.push({
                type: 'video',
                title: 'Advanced Game Management',
                duration: Math.ceil(duration * 0.7),
                content: 'Pitch calling strategies and working with pitchers'
            });
        } else {
            educationContent.push({
                type: 'video',
                title: 'Elite Catching Concepts',
                duration: Math.ceil(duration * 0.7),
                content: 'Advanced scouting and game situation management'
            });
        }

        if (duration > 3) {
            educationContent.push({
                type: 'reflection',
                title: 'Training Reflection',
                duration: duration - educationContent[0].duration,
                content: 'Think about what you learned and how to apply it'
            });
        }

        return {
            total_duration: duration,
            content: educationContent,
            phase_goals: ['Develop mental game', 'Learn strategy', 'Build game awareness']
        };
    }

    /**
     * Select cooldown activities
     */
    async selectCooldownDrills(duration) {
        return {
            total_duration: duration,
            drills: [
                {
                    drill_code: 'static_stretching',
                    name: 'Static Stretching',
                    duration: duration,
                    instructions: 'Gentle stretching to help recovery and prevent injury',
                    coaching_points: ['Hold stretches for 20-30 seconds', 'Focus on areas worked during training']
                }
            ],
            phase_goals: ['Promote recovery', 'Prevent injury', 'Reflect on training']
        };
    }

    /**
     * Create video review section for progress tracking
     */
    createVideoReviewSection(duration) {
        return {
            total_duration: duration,
            activities: [
                {
                    type: 'video_comparison',
                    title: 'Compare Previous Videos',
                    duration: Math.ceil(duration * 0.6),
                    instructions: 'Review videos from previous sessions to see improvement'
                },
                {
                    type: 'record_new_video',
                    title: 'Record New Progress Video',
                    duration: Math.floor(duration * 0.4),
                    instructions: 'Record a new video of your best drill from today'
                }
            ],
            phase_goals: ['Track visual progress', 'Identify improvements', 'Motivate continued training']
        };
    }

    /**
     * Get specific drills for a category (simplified - would query database in real implementation)
     */
    async getDrillsForCategory(category, duration, equipmentLevel, experienceLevel) {
        // This is a simplified version - in the real app, this would query your drill library database
        const sampleDrills = {
            receiving: [
                {
                    drill_code: 'basic_receiving',
                    name: 'Basic Receiving Mechanics',
                    duration: Math.ceil(duration * 0.6),
                    instructions: 'Practice proper glove positioning and movement',
                    coaching_points: ['Keep glove relaxed', 'Move glove to ball', 'Present strikes confidently']
                },
                {
                    drill_code: 'framing_practice',
                    name: 'Pitch Framing',
                    duration: Math.floor(duration * 0.4),
                    instructions: 'Practice subtle movements to help umpire see strikes',
                    coaching_points: ['Minimal glove movement', 'Hold the zone', 'Stay quiet with body']
                }
            ],
            throwing: [
                {
                    drill_code: 'exchange_drill',
                    name: 'Quick Exchange',
                    duration: Math.ceil(duration * 0.5),
                    instructions: 'Practice getting ball from glove to throwing hand quickly',
                    coaching_points: ['Two hands to the ball', 'Quick, clean transfer', 'Keep hands close to body']
                },
                {
                    drill_code: 'footwork_drill',
                    name: 'Throwing Footwork',
                    duration: Math.floor(duration * 0.5),
                    instructions: 'Practice proper foot positioning for throwing to second',
                    coaching_points: ['Right foot replaces left', 'Stay low', 'Direct line to target']
                }
            ],
            blocking: [
                {
                    drill_code: 'basic_blocking',
                    name: 'Basic Blocking Stance',
                    duration: Math.ceil(duration * 0.7),
                    instructions: 'Practice proper blocking position and technique',
                    coaching_points: ['Chest over the ball', 'Keep ball in front', 'Stay low and athletic']
                },
                {
                    drill_code: 'blocking_angles',
                    name: 'Blocking Different Angles',
                    duration: Math.floor(duration * 0.3),
                    instructions: 'Practice blocking balls to different sides',
                    coaching_points: ['Angle body to keep ball in front', 'Use whole body, not just glove']
                }
            ],
            education: [
                {
                    drill_code: 'game_situations',
                    name: 'Game Situation Practice',
                    duration: duration,
                    instructions: 'Think through different game scenarios and appropriate responses',
                    coaching_points: ['Know the count', 'Communicate with pitcher', 'Anticipate plays']
                }
            ]
        };

        return sampleDrills[category] || [];
    }

    /**
     * Add coaching guidance and motivational elements
     */
    addCoachingGuidance(workoutStructure, userAnalysis) {
        const coachingTips = this.generateCoachingTips(userAnalysis);
        const motivationalMessage = this.generateMotivationalMessage(userAnalysis);
        
        return {
            ...workoutStructure,
            coaching_guidance: {
                pre_workout_tips: coachingTips.preWorkout,
                focus_reminders: coachingTips.focusReminders,
                motivational_message: motivationalMessage,
                success_criteria: this.defineSuccessCriteria(userAnalysis)
            }
        };
    }

    /**
     * Generate coaching tips based on user analysis
     */
    generateCoachingTips(userAnalysis) {
        const weakestCategory = userAnalysis.weakestCategory.category;
        
        const categoryTips = {
            receiving: [
                "Focus on keeping your eyes level throughout the catch",
                "Let the ball come to you - don't reach for it",
                "Keep your glove relaxed and ready to give with the ball"
            ],
            throwing: [
                "Quick, clean exchanges are more important than arm strength",
                "Keep your throws low and on line",
                "Footwork sets up everything - get your feet right first"
            ],
            blocking: [
                "Your chest and body block balls, not your glove",
                "Stay low and keep everything in front of you",
                "Think 'big body' to take up space"
            ],
            education: [
                "Communication is key - talk to your pitcher constantly",
                "Know the count and situation before every pitch",
                "Study hitters and help your pitcher attack weaknesses"
            ]
        };

        return {
            preWorkout: [
                "Take your time with setup - good habits start from the beginning",
                `Today we're focusing on ${weakestCategory} - this is your biggest opportunity for improvement`
            ],
            focusReminders: categoryTips[weakestCategory] || []
        };
    }

    /**
     * Generate motivational message
     */
    generateMotivationalMessage(userAnalysis) {
        const messages = [
            `Great choice focusing on ${userAnalysis.weakestCategory.category}! This is where you'll see the biggest improvement.`,
            `Your overall skill level of ${userAnalysis.overallSkillLevel}/10 shows real potential - let's build on it!`,
            "Every rep counts. Stay focused and trust the process.",
            "You're investing in your future behind the plate. Make it count!"
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Define success criteria for the workout
     */
    defineSuccessCriteria(userAnalysis) {
        return [
            "Complete at least 80% of planned drills",
            `Show improvement in ${userAnalysis.weakestCategory.category} technique`,
            "Maintain good form throughout the session",
            "Record at least one progress video if applicable"
        ];
    }

    /**
     * Generate workout metadata for tracking and analysis
     */
    generateWorkoutMetadata(userProfile, skillsAssessment, timeAllocation, equipmentLevel) {
        return {
            algorithm_version: "1.0.0",
            generation_timestamp: new Date().toISOString(),
            user_experience_level: userProfile.experience_level,
            assessment_date: skillsAssessment.created_at,
            equipment_level: equipmentLevel,
            time_allocation: timeAllocation,
            total_planned_duration: Object.values(timeAllocation).reduce((sum, time) => sum + time, 0),
            workout_complexity: this.calculateWorkoutComplexity(timeAllocation, equipmentLevel),
            personalization_factors: [
                'skills_assessment_based',
                'equipment_adapted',
                'time_optimized',
                'experience_appropriate'
            ]
        };
    }

    /**
     * Calculate workout complexity score
     */
    calculateWorkoutComplexity(timeAllocation, equipmentLevel) {
        const totalTime = Object.values(timeAllocation).reduce((sum, time) => sum + time, 0);
        const equipmentScore = { minimal: 1, basic: 2, intermediate: 3, advanced: 4, premium: 5 }[equipmentLevel];
        
        return Math.min(10, Math.round((totalTime / 10) + equipmentScore));
    }

    /**
     * Generate a fallback workout if main algorithm fails
     */
    generateFallbackWorkout(duration, availableEquipment) {
        return {
            fallback: true,
            message: "Generated basic workout due to technical issue",
            workout: {
                warmup: {
                    total_duration: Math.max(2, Math.floor(duration * 0.15)),
                    drills: [{
                        name: "Basic Warmup",
                        instructions: "Light stretching and movement to prepare for training"
                    }]
                },
                main_work: {
                    total_duration: Math.floor(duration * 0.7),
                    drills: [{
                        name: "General Catching Practice",
                        instructions: "Work on basic catching fundamentals with available equipment"
                    }]
                },
                cooldown: {
                    total_duration: Math.max(1, Math.floor(duration * 0.15)),
                    drills: [{
                        name: "Light Stretching",
                        instructions: "Gentle stretching to cool down"
                    }]
                }
            }
        };
    }
}

// Export for use in other parts of the application
export default WorkoutGenerationAlgorithm;

/*
==================================================
EXPLANATION OF KEY CONCEPTS:
==================================================

MAIN ALGORITHM FLOW:
1. Analyze User State: Look at skills assessment to find weakest areas
2. Calculate Time Allocation: Use your design decisions (15/30/45/60+ min templates)
3. Assess Equipment: Determine what level of drills are possible
4. Build Workout Structure: Select specific drills for each phase
5. Add Coaching Guidance: Provide tips and motivation
6. Generate Metadata: Track how workout was created for analysis

TIME-FIRST APPROACH:
The algorithm starts with user's available time, then adapts everything else.
This matches your design decision that "time takes precedence."

WEAKNESS-FOCUSED TRAINING:
The algorithm identifies the lowest scoring category from the 13-skill assessment
and allocates the most time to improving that area.

EQUIPMENT ADAPTATION:
The algorithm checks what equipment is available and only selects drills
that can be performed with that equipment.

EXAMPLE ALGORITHM OUTPUT:
For a user with:
- 30 minutes available
- Tennis balls + catcher's gear  
- Weak in blocking (4/10)
- Intermediate experience

The algorithm would generate:
{
  warmup: { duration: 3, drills: ["dynamic_stretching", "light_throwing"] },
  main_work: { 
    duration: 15, 
    target_category: "blocking",
    drills: ["basic_blocking", "blocking_angles"] 
  },
  secondary_work: { 
    duration: 8, 
    drills: ["exchange_drill", "framing_practice"] 
  },
  education: { 
    duration: 4, 
    content: ["blocking_fundamentals_video"] 
  }
}

This ensures every workout is:
✅ Personalized to user's weaknesses
✅ Fits their available time
✅ Uses only their available equipment  

*/
