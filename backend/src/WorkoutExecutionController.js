/**
 * WorkoutExecutionController.js - CATCHING COACH APP
 * 
 * Manages live workout sessions from start to finish - tracking progress,
 * handling drill completion, managing timing, and collecting user feedback.
 * 
 * This component bridges the AI-generated workout plan with the actual training session.
 */

class WorkoutExecutionController {
    constructor() {
        // Session state management
        this.activeSession = null;
        this.sessionTimer = null;
        this.currentPhase = null;
        this.currentDrill = null;
        
        // Event listeners for real-time updates
        this.eventListeners = {
            onPhaseStart: [],
            onPhaseComplete: [],
            onDrillStart: [],
            onDrillComplete: [],
            onSessionPause: [],
            onSessionResume: [],
            onSessionComplete: [],
            onProgressUpdate: []
        };

        // Workout phase definitions
        this.phaseSequence = ['warmup', 'main_work', 'secondary_work', 'education', 'video_review', 'cooldown'];
        
        // Performance tracking
        this.performanceMetrics = {
            sessionStartTime: null,
            phaseTimings: {},
            drillCompletions: [],
            userFeedback: [],
            skipReasons: [],
            pauseEvents: []
        };
    }

    /**
     * MAIN FUNCTION: Start a new workout session
     * 
     * @param {Object} workoutPlan - Generated workout plan from WorkoutGenerationAlgorithm
     * @param {Object} userProfile - User profile information
     * @param {Object} sessionSettings - Session-specific settings and preferences
     * @returns {Object} Session initialization result
     */
    async startWorkoutSession(workoutPlan, userProfile, sessionSettings = {}) {
        try {
            console.log('🏃‍♂️ Starting workout session...');

            // Validate workout plan
            const validation = this.validateWorkoutPlan(workoutPlan);
            if (!validation.isValid) {
                throw new Error(`Invalid workout plan: ${validation.errors.join(', ')}`);
            }

            // Initialize session state
            this.activeSession = {
                session_id: this.generateSessionId(),
                user_id: userProfile.user_id,
                workout_plan: workoutPlan,
                session_settings: sessionSettings,
                status: 'in_progress',
                started_at: new Date().toISOString(),
                completed_at: null,
                
                // Progress tracking
                current_phase_index: 0,
                current_drill_index: 0,
                completed_phases: [],
                completed_drills: [],
                skipped_drills: [],
                
                // Timing data
                planned_duration: this.calculatePlannedDuration(workoutPlan),
                actual_duration: 0,
                phase_timings: {},
                
                // User feedback
                ratings: {},
                notes: '',
                energy_levels: {
                    pre_workout: sessionSettings.pre_workout_energy || null,
                    post_workout: null
                },
                
                // Performance data
                drill_performances: {},
                videos_recorded: [],
                modifications_made: []
            };

            // Initialize performance metrics
            this.resetPerformanceMetrics();
            this.performanceMetrics.sessionStartTime = new Date();

            // Start the first phase
            await this.startNextPhase();

            // Trigger session start event
            this.triggerEvent('onSessionStart', this.activeSession);

            console.log('✅ Workout session started successfully');

            return {
                success: true,
                session_id: this.activeSession.session_id,
                first_phase: this.currentPhase,
                estimated_duration: this.activeSession.planned_duration,
                message: 'Workout session started - ready for first phase!'
            };

        } catch (error) {
            console.error('❌ Error starting workout session:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Start the next phase in the workout sequence
     */
    async startNextPhase() {
        if (!this.activeSession) {
            throw new Error('No active session');
        }

        const currentPhaseIndex = this.activeSession.current_phase_index;
        const availablePhases = this.getAvailablePhases();

        if (currentPhaseIndex >= availablePhases.length) {
            // All phases complete - finish session
            return await this.completeSession();
        }

        const phaseName = availablePhases[currentPhaseIndex];
        const phaseData = this.activeSession.workout_plan.workout[phaseName];

        if (!phaseData) {
            // Skip missing phases
            this.activeSession.current_phase_index++;
            return await this.startNextPhase();
        }

        // Initialize current phase
        this.currentPhase = {
            name: phaseName,
            data: phaseData,
            started_at: new Date().toISOString(),
            completed_at: null,
            current_drill_index: 0,
            drills_completed: 0,
            total_drills: phaseData.drills ? phaseData.drills.length : 0,
            status: 'active'
        };

        // Record phase timing
        this.activeSession.phase_timings[phaseName] = {
            started_at: this.currentPhase.started_at,
            planned_duration: phaseData.total_duration || 0
        };

        // Start first drill in phase (if applicable)
        if (phaseData.drills && phaseData.drills.length > 0) {
            await this.startNextDrill();
        }

        // Trigger phase start event
        this.triggerEvent('onPhaseStart', {
            phase: this.currentPhase,
            session: this.activeSession
        });

        console.log(`🎯 Started phase: ${phaseName}`);

        return {
            phase: this.currentPhase,
            instructions: this.generatePhaseInstructions(phaseName, phaseData),
            estimated_duration: phaseData.total_duration
        };
    }

    /**
     * Start the next drill within the current phase
     */
    async startNextDrill() {
        if (!this.currentPhase || !this.currentPhase.data.drills) {
            return null;
        }

        const drillIndex = this.currentPhase.current_drill_index;
        const drillData = this.currentPhase.data.drills[drillIndex];

        if (!drillData) {
            // No more drills in this phase - complete phase
            return await this.completeCurrentPhase();
        }

        // Initialize current drill
        this.currentDrill = {
            ...drillData,
            drill_index: drillIndex,
            started_at: new Date().toISOString(),
            completed_at: null,
            status: 'active',
            modifications: [],
            user_notes: '',
            difficulty_rating: null,
            completion_percentage: 0
        };

        // Trigger drill start event
        this.triggerEvent('onDrillStart', {
            drill: this.currentDrill,
            phase: this.currentPhase,
            session: this.activeSession
        });

        console.log(`🏋️‍♂️ Started drill: ${drillData.name}`);

        return {
            drill: this.currentDrill,
            instructions: drillData.instructions,
            coaching_points: drillData.coaching_points,
            duration: drillData.duration
        };
    }

    /**
     * Mark current drill as complete and collect feedback
     */
    async completeDrill(completionData = {}) {
        if (!this.currentDrill) {
            throw new Error('No active drill to complete');
        }

        const completedAt = new Date().toISOString();
        
        // Update drill completion data
        this.currentDrill = {
            ...this.currentDrill,
            completed_at: completedAt,
            status: 'completed',
            completion_percentage: completionData.completion_percentage || 100,
            difficulty_rating: completionData.difficulty_rating,
            effectiveness_rating: completionData.effectiveness_rating,
            user_notes: completionData.notes || '',
            videos_recorded: completionData.videos_recorded || []
        };

        // Add to completed drills
        this.activeSession.completed_drills.push({
            drill_code: this.currentDrill.drill_code || this.currentDrill.name,
            phase: this.currentPhase.name,
            completed_at: completedAt,
            duration: this.calculateDrillDuration(this.currentDrill),
            performance_data: completionData
        });

        // Track performance metrics
        this.performanceMetrics.drillCompletions.push({
            drill: this.currentDrill.name,
            completion_time: completedAt,
            duration: this.calculateDrillDuration(this.currentDrill),
            difficulty_rating: completionData.difficulty_rating
        });

        // Update phase progress
        this.currentPhase.drills_completed++;
        this.currentPhase.current_drill_index++;

        // Trigger drill complete event
        this.triggerEvent('onDrillComplete', {
            drill: this.currentDrill,
            phase: this.currentPhase,
            session: this.activeSession
        });

        console.log(`✅ Completed drill: ${this.currentDrill.name}`);

        // Start next drill or complete phase
        return await this.startNextDrill();
    }

    /**
     * Skip current drill with reason
     */
    async skipDrill(skipReason = 'user_choice', alternativeDrill = null) {
        if (!this.currentDrill) {
            throw new Error('No active drill to skip');
        }

        const skippedAt = new Date().toISOString();

        // Record skip data
        const skipData = {
            drill_code: this.currentDrill.drill_code || this.currentDrill.name,
            drill_name: this.currentDrill.name,
            phase: this.currentPhase.name,
            skipped_at: skippedAt,
            reason: skipReason,
            alternative_performed: alternativeDrill
        };

        this.activeSession.skipped_drills.push(skipData);
        this.performanceMetrics.skipReasons.push(skipData);

        // Update phase progress
        this.currentPhase.current_drill_index++;

        console.log(`⏭️ Skipped drill: ${this.currentDrill.name} (${skipReason})`);

        // If alternative drill provided, perform it
        if (alternativeDrill) {
            return await this.performAlternativeDrill(alternativeDrill);
        }

        // Otherwise, move to next drill
        return await this.startNextDrill();
    }

    /**
     * Perform an alternative drill
     */
    async performAlternativeDrill(alternativeDrill) {
        console.log(`🔄 Performing alternative drill: ${alternativeDrill.name}`);
        
        // Create temporary drill object
        this.currentDrill = {
            ...alternativeDrill,
            started_at: new Date().toISOString(),
            status: 'active',
            is_alternative: true
        };

        return {
            drill: this.currentDrill,
            instructions: alternativeDrill.instructions,
            coaching_points: alternativeDrill.coaching_points || [],
            duration: alternativeDrill.duration
        };
    }

    /**
     * Complete current phase and move to next
     */
    async completeCurrentPhase() {
        if (!this.currentPhase) {
            return null;
        }

        const completedAt = new Date().toISOString();
        
        // Update phase completion data
        this.currentPhase.completed_at = completedAt;
        this.currentPhase.status = 'completed';
        
        // Update session timings
        this.activeSession.phase_timings[this.currentPhase.name].completed_at = completedAt;
        this.activeSession.phase_timings[this.currentPhase.name].actual_duration = 
            this.calculatePhaseDuration(this.currentPhase);

        // Add to completed phases
        this.activeSession.completed_phases.push(this.currentPhase.name);

        // Trigger phase complete event
        this.triggerEvent('onPhaseComplete', {
            phase: this.currentPhase,
            session: this.activeSession
        });

        console.log(`✅ Completed phase: ${this.currentPhase.name}`);

        // Move to next phase
        this.activeSession.current_phase_index++;
        this.currentPhase = null;
        this.currentDrill = null;

        return await this.startNextPhase();
    }

    /**
     * Pause the current workout session
     */
    pauseSession(pauseReason = 'user_request') {
        if (!this.activeSession || this.activeSession.status === 'paused') {
            return { success: false, message: 'Session not active or already paused' };
        }

        const pausedAt = new Date().toISOString();
        
        this.activeSession.status = 'paused';
        this.activeSession.paused_at = pausedAt;

        // Record pause event
        this.performanceMetrics.pauseEvents.push({
            paused_at: pausedAt,
            reason: pauseReason,
            phase: this.currentPhase?.name,
            drill: this.currentDrill?.name
        });

        // Stop any running timers
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }

        // Trigger pause event
        this.triggerEvent('onSessionPause', {
            session: this.activeSession,
            pause_reason: pauseReason
        });

        console.log(`⏸️ Session paused: ${pauseReason}`);

        return {
            success: true,
            message: 'Session paused successfully',
            paused_at: pausedAt
        };
    }

    /**
     * Resume a paused workout session
     */
    resumeSession() {
        if (!this.activeSession || this.activeSession.status !== 'paused') {
            return { success: false, message: 'No paused session to resume' };
        }

        const resumedAt = new Date().toISOString();
        
        this.activeSession.status = 'in_progress';
        this.activeSession.resumed_at = resumedAt;

        // Update last pause event with resume time
        if (this.performanceMetrics.pauseEvents.length > 0) {
            const lastPause = this.performanceMetrics.pauseEvents[this.performanceMetrics.pauseEvents.length - 1];
            lastPause.resumed_at = resumedAt;
            lastPause.pause_duration = this.calculateTimeBetween(lastPause.paused_at, resumedAt);
        }

        // Trigger resume event
        this.triggerEvent('onSessionResume', {
            session: this.activeSession,
            resumed_at: resumedAt
        });

        console.log('▶️ Session resumed');

        return {
            success: true,
            message: 'Session resumed successfully',
            current_phase: this.currentPhase?.name,
            current_drill: this.currentDrill?.name
        };
    }

    /**
     * Complete the entire workout session
     */
    async completeSession(completionData = {}) {
        if (!this.activeSession) {
            throw new Error('No active session to complete');
        }

        const completedAt = new Date().toISOString();
        
        // Calculate session duration
        const sessionDuration = this.calculateSessionDuration();

        // Update session completion data
        this.activeSession = {
            ...this.activeSession,
            status: 'completed',
            completed_at: completedAt,
            actual_duration: sessionDuration,
            
            // Final ratings and feedback
            ratings: {
                ...this.activeSession.ratings,
                overall_satisfaction: completionData.overall_satisfaction,
                perceived_difficulty: completionData.perceived_difficulty,
                effectiveness_rating: completionData.effectiveness_rating
            },
            
            energy_levels: {
                ...this.activeSession.energy_levels,
                post_workout: completionData.post_workout_energy
            },
            
            notes: completionData.session_notes || '',
            
            // Performance summary
            performance_summary: this.generatePerformanceSummary()
        };

        // Generate session completion report
        const completionReport = await this.generateSessionReport();

        // Clear current state
        this.currentPhase = null;
        this.currentDrill = null;

        // Trigger session complete event
        this.triggerEvent('onSessionComplete', {
            session: this.activeSession,
            report: completionReport
        });

        console.log('🎉 Workout session completed!');

        return {
            success: true,
            session_completed: true,
            completion_report: completionReport,
            next_recommendations: this.generateNextSessionRecommendations()
        };
    }

    /**
     * Get current session status and progress
     */
    getSessionStatus() {
        if (!this.activeSession) {
            return { active: false, message: 'No active session' };
        }

        const progressPercentage = this.calculateSessionProgress();
        const elapsedTime = this.calculateElapsedTime();

        return {
            active: true,
            session_id: this.activeSession.session_id,
            status: this.activeSession.status,
            progress_percentage: progressPercentage,
            elapsed_time_minutes: elapsedTime,
            estimated_remaining_minutes: Math.max(0, this.activeSession.planned_duration - elapsedTime),
            
            current_phase: this.currentPhase ? {
                name: this.currentPhase.name,
                progress: `${this.currentPhase.drills_completed}/${this.currentPhase.total_drills} drills`
            } : null,
            
            current_drill: this.currentDrill ? {
                name: this.currentDrill.name,
                duration: this.currentDrill.duration,
                started_at: this.currentDrill.started_at
            } : null,
            
            completed_phases: this.activeSession.completed_phases,
            completed_drills: this.activeSession.completed_drills.length,
            skipped_drills: this.activeSession.skipped_drills.length
        };
    }

    /**
     * Update user feedback during session
     */
    updateSessionFeedback(feedbackData) {
        if (!this.activeSession) {
            return { success: false, message: 'No active session' };
        }

        // Update current drill feedback
        if (this.currentDrill && feedbackData.drill_feedback) {
            this.currentDrill = {
                ...this.currentDrill,
                ...feedbackData.drill_feedback
            };
        }

        // Update session-level feedback
        if (feedbackData.session_feedback) {
            this.activeSession.ratings = {
                ...this.activeSession.ratings,
                ...feedbackData.session_feedback
            };
        }

        // Add to performance tracking
        this.performanceMetrics.userFeedback.push({
            timestamp: new Date().toISOString(),
            phase: this.currentPhase?.name,
            drill: this.currentDrill?.name,
            feedback: feedbackData
        });

        // Trigger progress update event
        this.triggerEvent('onProgressUpdate', {
            session: this.activeSession,
            feedback: feedbackData
        });

        return {
            success: true,
            message: 'Feedback updated successfully'
        };
    }

    /**
     * Record a progress video during the session
     */
    recordProgressVideo(videoData) {
        if (!this.activeSession) {
            return { success: false, message: 'No active session' };
        }

        const videoRecord = {
            video_id: this.generateVideoId(),
            recorded_at: new Date().toISOString(),
            phase: this.currentPhase?.name,
            drill: this.currentDrill?.name || this.currentDrill?.drill_code,
            video_url: videoData.video_url,
            video_metadata: {
                duration: videoData.duration,
                file_size: videoData.file_size,
                resolution: videoData.resolution
            },
            user_notes: videoData.notes || ''
        };

        // Add to session videos
        this.activeSession.videos_recorded.push(videoRecord);

        // Add to current drill if applicable
        if (this.currentDrill) {
            if (!this.currentDrill.videos_recorded) {
                this.currentDrill.videos_recorded = [];
            }
            this.currentDrill.videos_recorded.push(videoRecord);
        }

        console.log(`📹 Video recorded: ${videoRecord.video_id}`);

        return {
            success: true,
            video_record: videoRecord,
            total_videos_this_session: this.activeSession.videos_recorded.length
        };
    }

    /**
     * Suggest modifications to current drill based on user feedback
     */
    suggestDrillModifications(difficulty_feedback, equipment_issues = null) {
        if (!this.currentDrill) {
            return { success: false, message: 'No active drill to modify' };
        }

        const modifications = [];

        // Handle difficulty adjustments
        if (difficulty_feedback === 'too_easy') {
            modifications.push({
                type: 'increase_difficulty',
                description: 'Add more repetitions or increase complexity',
                implementation: 'Extend drill duration by 2-3 minutes'
            });
        } else if (difficulty_feedback === 'too_hard') {
            modifications.push({
                type: 'decrease_difficulty',
                description: 'Reduce complexity or repetitions',
                implementation: 'Focus on form over speed/intensity'
            });
        }

        // Handle equipment issues
        if (equipment_issues) {
            modifications.push({
                type: 'equipment_adaptation',
                description: `Adapt drill for available equipment`,
                implementation: this.suggestEquipmentAlternatives(equipment_issues)
            });
        }

        // Apply modifications to current drill
        if (modifications.length > 0) {
            this.currentDrill.modifications.push(...modifications);
            this.activeSession.modifications_made.push({
                drill: this.currentDrill.name,
                timestamp: new Date().toISOString(),
                modifications: modifications
            });
        }

        return {
            success: true,
            modifications: modifications,
            message: modifications.length > 0 ? 'Drill modified successfully' : 'No modifications needed'
        };
    }

    /**
     * Generate equipment alternatives for drill modifications
     */
    suggestEquipmentAlternatives(equipment_issue) {
        const alternatives = {
            'no_catcher_gear': 'Practice receiving mechanics without gear, focus on glove work',
            'no_tennis_balls': 'Use imaginary balls and focus on movement patterns',
            'limited_space': 'Adapt drill for smaller area, reduce movement distance',
            'no_partner': 'Use wall work or self-toss variations',
            'no_home_plate': 'Use any flat marker or imaginary home plate'
        };

        return alternatives[equipment_issue] || 'Adapt drill as needed for available resources';
    }

    // ===========================================
    // UTILITY AND CALCULATION METHODS
    // ===========================================

    /**
     * Validate workout plan structure
     */
    validateWorkoutPlan(workoutPlan) {
        const errors = [];

        if (!workoutPlan || !workoutPlan.workout) {
            errors.push('Missing workout data');
        }

        if (!workoutPlan.workout || Object.keys(workoutPlan.workout).length === 0) {
            errors.push('Empty workout plan');
        }

        // Check for at least one phase with drills
        const hasValidPhase = Object.values(workoutPlan.workout || {}).some(phase => 
            phase && (phase.drills || phase.content || phase.activities)
        );

        if (!hasValidPhase) {
            errors.push('No valid phases with activities found');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get available phases from workout plan
     */
    getAvailablePhases() {
        if (!this.activeSession?.workout_plan?.workout) {
            return [];
        }

        return this.phaseSequence.filter(phase => 
            this.activeSession.workout_plan.workout[phase]
        );
    }

    /**
     * Calculate planned total duration from workout plan
     */
    calculatePlannedDuration(workoutPlan) {
        let totalDuration = 0;
        
        Object.values(workoutPlan.workout || {}).forEach(phase => {
            if (phase && phase.total_duration) {
                totalDuration += phase.total_duration;
            }
        });

        return totalDuration;
    }

    /**
     * Calculate actual session duration in minutes
     */
    calculateSessionDuration() {
        if (!this.activeSession?.started_at) {
            return 0;
        }

        const startTime = new Date(this.activeSession.started_at);
        const endTime = new Date();
        const diffInMs = endTime - startTime;
        
        return Math.round(diffInMs / (1000 * 60)); // Convert to minutes
    }

    /**
     * Calculate drill duration in minutes
     */
    calculateDrillDuration(drill) {
        if (!drill.started_at) return 0;
        
        const startTime = new Date(drill.started_at);
        const endTime = drill.completed_at ? new Date(drill.completed_at) : new Date();
        const diffInMs = endTime - startTime;
        
        return Math.round(diffInMs / (1000 * 60));
    }

    /**
     * Calculate phase duration in minutes
     */
    calculatePhaseDuration(phase) {
        if (!phase.started_at) return 0;
        
        const startTime = new Date(phase.started_at);
        const endTime = phase.completed_at ? new Date(phase.completed_at) : new Date();
        const diffInMs = endTime - startTime;
        
        return Math.round(diffInMs / (1000 * 60));
    }

    /**
     * Calculate overall session progress percentage
     */
    calculateSessionProgress() {
        if (!this.activeSession) return 0;

        const totalPhases = this.getAvailablePhases().length;
        const completedPhases = this.activeSession.completed_phases.length;
        const currentPhaseProgress = this.currentPhase ? 
            (this.currentPhase.drills_completed / Math.max(1, this.currentPhase.total_drills)) : 0;

        const overallProgress = ((completedPhases + currentPhaseProgress) / totalPhases) * 100;
        
        return Math.min(100, Math.round(overallProgress));
    }

    /**
     * Calculate elapsed time since session start
     */
    calculateElapsedTime() {
        if (!this.activeSession?.started_at) return 0;
        
        const startTime = new Date(this.activeSession.started_at);
        const currentTime = new Date();
        const diffInMs = currentTime - startTime;
        
        return Math.round(diffInMs / (1000 * 60));
    }

    /**
     * Calculate time between two dates
     */
    calculateTimeBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInMs = end - start;
        
        return Math.round(diffInMs / (1000 * 60));
    }

    /**
     * Generate phase instructions for user
     */
    generatePhaseInstructions(phaseName, phaseData) {
        const instructionTemplates = {
            warmup: {
                title: 'Warmup Phase',
                description: 'Prepare your body for training',
                tips: ['Start slowly and gradually increase intensity', 'Focus on injury prevention', 'Listen to your body']
            },
            main_work: {
                title: 'Main Training Phase',
                description: `Focus on ${phaseData.target_category || 'skill development'}`,
                tips: ['Concentrate on proper form', 'Quality over quantity', 'Take breaks if needed']
            },
            secondary_work: {
                title: 'Secondary Skills Phase',
                description: 'Work on supporting skills and maintain balance',
                tips: ['Maintain focus even though this isn\'t your weakest area', 'Good opportunity to build confidence']
            },
            education: {
                title: 'Education & Mental Game',
                description: 'Learn strategy and develop your mental approach',
                tips: ['Take notes on key concepts', 'Think about how to apply this in games', 'Ask questions if you have a coach']
            },
            video_review: {
                title: 'Video Review & Progress Tracking',
                description: 'Compare your progress and record new videos',
                tips: ['Look for specific improvements in technique', 'Be objective about your progress', 'Record your best attempts']
            },
            cooldown: {
                title: 'Cooldown & Recovery',
                description: 'Help your body recover from training',
                tips: ['Don\'t rush this phase', 'Focus on areas that feel tight', 'Reflect on what you learned today']
            }
        };

        return instructionTemplates[phaseName] || {
            title: 'Training Phase',
            description: 'Continue with your training',
            tips: ['Stay focused and work hard']
        };
    }

    /**
     * Generate performance summary for session completion
     */
    generatePerformanceSummary() {
        const summary = {
            drills_completed: this.activeSession.completed_drills.length,
            drills_skipped: this.activeSession.skipped_drills.length,
            phases_completed: this.activeSession.completed_phases.length,
            videos_recorded: this.activeSession.videos_recorded.length,
            total_duration: this.calculateSessionDuration(),
            completion_rate: 0
        };

        // Calculate completion rate
        const totalPlannedActivities = this.countTotalPlannedActivities();
        const totalCompletedActivities = this.activeSession.completed_drills.length;
        
        if (totalPlannedActivities > 0) {
            summary.completion_rate = Math.round((totalCompletedActivities / totalPlannedActivities) * 100);
        }

        return summary;
    }

    /**
     * Count total planned activities in the workout
     */
    countTotalPlannedActivities() {
        let totalActivities = 0;
        
        Object.values(this.activeSession.workout_plan.workout || {}).forEach(phase => {
            if (phase.drills) {
                totalActivities += phase.drills.length;
            } else if (phase.content) {
                totalActivities += phase.content.length;
            } else if (phase.activities) {
                totalActivities += phase.activities.length;
            }
        });

        return totalActivities;
    }

    /**
     * Generate session completion report
     */
    async generateSessionReport() {
        const report = {
            session_summary: {
                session_id: this.activeSession.session_id,
                completed_at: this.activeSession.completed_at,
                total_duration: this.activeSession.actual_duration,
                planned_duration: this.activeSession.planned_duration,
                efficiency: Math.round((this.activeSession.planned_duration / this.activeSession.actual_duration) * 100)
            },
            
            performance_metrics: this.activeSession.performance_summary,
            
            achievements: this.identifySessionAchievements(),
            
            areas_for_improvement: this.identifyImprovementAreas(),
            
            next_session_recommendations: this.generateNextSessionRecommendations()
        };

        return report;
    }

    /**
     * Identify achievements from this session
     */
    identifySessionAchievements() {
        const achievements = [];

        // Completion achievements
        if (this.activeSession.performance_summary.completion_rate >= 90) {
            achievements.push({
                type: 'completion',
                title: 'Session Master',
                description: 'Completed 90%+ of planned activities'
            });
        }

        // Consistency achievements
        if (this.activeSession.skipped_drills.length === 0) {
            achievements.push({
                type: 'consistency',
                title: 'No Quit Attitude',
                description: 'Completed every planned drill'
            });
        }

        // Progress tracking achievements
        if (this.activeSession.videos_recorded.length > 0) {
            achievements.push({
                type: 'progress_tracking',
                title: 'Progress Tracker',
                description: 'Recorded videos for progress comparison'
            });
        }

        // Duration achievements
        if (this.activeSession.actual_duration >= this.activeSession.planned_duration) {
            achievements.push({
                type: 'dedication',
                title: 'Time Committed',
                description: 'Spent full planned duration training'
            });
        }

        return achievements;
    }

    /**
     * Identify areas for improvement based on session data
     */
    identifyImprovementAreas() {
        const improvements = [];

        // Check completion rate
        if (this.activeSession.performance_summary.completion_rate < 70) {
            improvements.push({
                area: 'completion_rate',
                suggestion: 'Try to complete more drills in your next session',
                priority: 'medium'
            });
        }

        // Check for frequent skipping
        if (this.activeSession.skipped_drills.length > 2) {
            improvements.push({
                area: 'drill_engagement',
                suggestion: 'Consider adjusting drill difficulty or seeking alternatives',
                priority: 'high'
            });
        }

        // Check session duration efficiency
        const efficiency = (this.activeSession.planned_duration / this.activeSession.actual_duration) * 100;
        if (efficiency < 80) {
            improvements.push({
                area: 'time_management',
                suggestion: 'Work on staying focused and managing time between drills',
                priority: 'low'
            });
        }

        return improvements;
    }

    /**
     * Generate recommendations for next session
     */
    generateNextSessionRecommendations() {
        const recommendations = [];

        // Based on completion rate
        if (this.activeSession.performance_summary.completion_rate >= 90) {
            recommendations.push('Consider increasing drill difficulty or duration for next session');
        } else if (this.activeSession.performance_summary.completion_rate < 70) {
            recommendations.push('Consider shorter or simpler drills for next session');
        }

        // Based on skipped drills
        if (this.activeSession.skipped_drills.length > 0) {
            const skipReasons = this.activeSession.skipped_drills.map(drill => drill.reason);
            const commonReason = this.findMostCommonReason(skipReasons);
            
            if (commonReason === 'too_difficult') {
                recommendations.push('Focus on fundamental drills before advancing to complex ones');
            } else if (commonReason === 'equipment_missing') {
                recommendations.push('Ensure all needed equipment is available before starting');
            }
        }

        // Based on user ratings
        if (this.activeSession.ratings.effectiveness_rating && this.activeSession.ratings.effectiveness_rating < 6) {
            recommendations.push('Consider adjusting workout structure or drill selection');
        }

        return recommendations;
    }

    /**
     * Find most common skip reason
     */
    findMostCommonReason(reasons) {
        const reasonCounts = {};
        reasons.forEach(reason => {
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });
        
        return Object.keys(reasonCounts).reduce((a, b) => 
            reasonCounts[a] > reasonCounts[b] ? a : b
        );
    }

    // ===========================================
    // EVENT SYSTEM
    // ===========================================

    /**
     * Add event listener
     */
    addEventListener(eventType, callback) {
        if (this.eventListeners[eventType]) {
            this.eventListeners[eventType].push(callback);
        }
    }

    /**
     * Remove event listener
     */
    removeEventListener(eventType, callback) {
        if (this.eventListeners[eventType]) {
            this.eventListeners[eventType] = this.eventListeners[eventType].filter(cb => cb !== callback);
        }
    }

    /**
     * Trigger event
     */
    triggerEvent(eventType, data) {
        if (this.eventListeners[eventType]) {
            this.eventListeners[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate unique video ID
     */
    generateVideoId() {
        return 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            sessionStartTime: null,
            phaseTimings: {},
            drillCompletions: [],
            userFeedback: [],
            skipReasons: [],
            pauseEvents: []
        };
    }
}

// Export for use in other parts of the application
module.exports = WorkoutExecutionController;

/*
==================================================
EXPLANATION OF KEY CONCEPTS:
==================================================

WORKOUT SESSION MANAGEMENT:
This controller manages the entire workout from start to finish,
tracking every drill, phase transition, and user interaction.

PHASE-BASED STRUCTURE:
Workouts are broken into phases (warmup → main work → secondary → education → cooldown)
Each phase contains specific drills with timing and instructions.

REAL-TIME TRACKING:
- Tracks actual time spent vs. planned time
- Records completion rates and skip reasons
- Collects user feedback throughout the session
- Manages pause/resume functionality

EVENT-DRIVEN ARCHITECTURE:
Uses event listeners to notify other parts of the app when:
- Phases start/complete
- Drills start/complete
- Sessions pause/resume/complete
- Progress updates occur

ADAPTIVE MODIFICATIONS:
Can modify drills in real-time based on user feedback:
- Too easy → increase difficulty
- Too hard → simplify approach
- Equipment missing → suggest alternatives

PERFORMANCE ANALYTICS:
Collects detailed data for improving future workouts:
- Completion rates by drill type
- Time management patterns
- Skip reasons and frequency
- User satisfaction ratings

EXAMPLE SESSION FLOW:
1. startWorkoutSession() → Initialize session with AI-generated plan
2. startNextPhase() → Begin warmup phase
3. startNextDrill() → Start first warmup drill
4. completeDrill() → User completes drill, moves to next
5. completeCurrentPhase() → Warmup done, move to main work
6. [Repeat through all phases]
7. completeSession() → Generate completion report and recommendations

DATA COLLECTED:
- Exact timing of every drill and phase
- User ratings for difficulty, effectiveness, satisfaction
- Skip reasons and equipment issues
- Videos recorded for progress tracking
- Modifications made during session
- Pause/resume events and reasons

This rich data helps the AI coach learn what works best for each user
and continuously improve workout recommendations.
*/