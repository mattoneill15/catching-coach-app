/**
 * SkillsAssessmentLogic.js - CATCHING COACH APP
 * 
 * Processes and analyzes the 13-category skills assessments to provide insights,
 * track progress, and generate recommendations for the AI coach.
 * 
 * This component turns raw assessment scores into actionable training insights.
 */

class SkillsAssessmentLogic {
    constructor() {
        // Define the 13 skill categories and their relationships
        this.skillCategories = {
            receiving: {
                name: 'Receiving',
                subcategories: [
                    { code: 'receiving_glove_move', name: 'Glove Movement', weight: 1.0 },
                    { code: 'receiving_glove_load', name: 'Glove Loading', weight: 1.0 },
                    { code: 'receiving_setups', name: 'Setup Position', weight: 1.0 },
                    { code: 'receiving_presentation', name: 'Pitch Presentation', weight: 1.0 }
                ],
                description: 'Fundamental catching and framing skills',
                importance_weight: 1.2  // Slightly more important for overall catching
            },
            throwing: {
                name: 'Throwing',
                subcategories: [
                    { code: 'throwing_footwork', name: 'Throwing Footwork', weight: 1.1 },
                    { code: 'throwing_exchange', name: 'Glove-to-Hand Exchange', weight: 1.2 },
                    { code: 'throwing_arm_strength', name: 'Arm Strength', weight: 0.9 },
                    { code: 'throwing_accuracy', name: 'Throwing Accuracy', weight: 1.1 }
                ],
                description: 'Throwing mechanics and base-running prevention',
                importance_weight: 1.1
            },
            blocking: {
                name: 'Blocking',
                subcategories: [
                    { code: 'blocking_overall', name: 'Overall Blocking', weight: 1.0 }
                ],
                description: 'Ability to stop balls in the dirt',
                importance_weight: 1.0
            },
            education: {
                name: 'Education & Mental Game',
                subcategories: [
                    { code: 'education_pitch_calling', name: 'Pitch Calling', weight: 1.1 },
                    { code: 'education_scouting_reports', name: 'Scouting Usage', weight: 0.9 },
                    { code: 'education_umpire_relations', name: 'Umpire Relations', weight: 0.8 },
                    { code: 'education_pitcher_relations', name: 'Pitcher Relations', weight: 1.2 }
                ],
                description: 'Game management and communication skills',
                importance_weight: 0.9
            }
        };

        // Proficiency level definitions
        this.proficiencyLevels = {
            1: { level: 'Needs Major Work', color: '#dc2626', description: 'Fundamental skills missing' },
            2: { level: 'Needs Major Work', color: '#dc2626', description: 'Basic understanding lacking' },
            3: { level: 'Needs Improvement', color: '#ea580c', description: 'Some fundamentals present' },
            4: { level: 'Needs Improvement', color: '#ea580c', description: 'Developing basic skills' },
            5: { level: 'Average', color: '#ca8a04', description: 'Meets basic expectations' },
            6: { level: 'Average', color: '#ca8a04', description: 'Solid fundamental base' },
            7: { level: 'Good', color: '#16a34a', description: 'Above average performance' },
            8: { level: 'Good', color: '#16a34a', description: 'Strong skill development' },
            9: { level: 'Excellent', color: '#0284c7', description: 'High-level performance' },
            10: { level: 'Excellent', color: '#0284c7', description: 'Elite/college level' }
        };

        // Assessment validation rules
        this.validationRules = {
            minScore: 1,
            maxScore: 10,
            requiredFields: [
                'receiving_glove_move', 'receiving_glove_load', 'receiving_setups', 'receiving_presentation',
                'throwing_footwork', 'throwing_exchange', 'throwing_arm_strength', 'throwing_accuracy',
                'blocking_overall',
                'education_pitch_calling', 'education_scouting_reports', 'education_umpire_relations', 'education_pitcher_relations'
            ]
        };
    }

    /**
     * MAIN FUNCTION: Process and analyze a complete skills assessment
     * 
     * @param {Object} rawAssessment - Raw assessment data from database
     * @param {Object} previousAssessment - Previous assessment for comparison (optional)
     * @param {Object} userProfile - User profile for context
     * @returns {Object} Complete analysis with insights and recommendations
     */
    async analyzeAssessment(rawAssessment, previousAssessment = null, userProfile = null) {
        try {
            console.log('🧠 Skills Analysis: Starting assessment analysis...');

            // Step 1: Validate the assessment data
            const validation = this.validateAssessment(rawAssessment);
            if (!validation.isValid) {
                throw new Error(`Assessment validation failed: ${validation.errors.join(', ')}`);
            }

            // Step 2: Calculate category averages and overall metrics
            const categoryAnalysis = this.calculateCategoryAnalysis(rawAssessment);
            console.log('📊 Category Analysis:', categoryAnalysis);

            // Step 3: Identify strengths and weaknesses
            const strengthsWeaknesses = this.identifyStrengthsAndWeaknesses(categoryAnalysis, rawAssessment);
            console.log('💪 Strengths & Weaknesses:', strengthsWeaknesses);

            // Step 4: Calculate progress if previous assessment exists
            const progressAnalysis = previousAssessment ? 
                this.calculateProgressAnalysis(rawAssessment, previousAssessment) : null;
            
            if (progressAnalysis) {
                console.log('📈 Progress Analysis:', progressAnalysis);
            }

            // Step 5: Generate training recommendations
            const trainingRecommendations = this.generateTrainingRecommendations(
                categoryAnalysis, 
                strengthsWeaknesses,
                userProfile
            );

            // Step 6: Create radar chart data for visualization
            const radarChartData = this.generateRadarChartData(categoryAnalysis);

            // Step 7: Calculate improvement priorities
            const improvementPriorities = this.calculateImprovementPriorities(categoryAnalysis, userProfile);

            // Step 8: Generate user-friendly insights
            const userInsights = this.generateUserInsights(
                categoryAnalysis,
                strengthsWeaknesses,
                progressAnalysis,
                userProfile
            );

            console.log('✅ Skills Analysis: Complete!');

            return {
                success: true,
                assessment_id: rawAssessment.assessment_id,
                analyzed_at: new Date().toISOString(),
                
                // Core analysis results
                categoryAnalysis,
                strengthsWeaknesses,
                progressAnalysis,
                trainingRecommendations,
                improvementPriorities,
                
                // Visualization data
                radarChartData,
                
                // User-facing insights
                userInsights,
                
                // Metadata
                metadata: {
                    assessment_type: rawAssessment.assessment_type || 'self_rated',
                    coach_input: rawAssessment.coach_input || false,
                    analysis_version: '1.0.0'
                }
            };

        } catch (error) {
            console.error('❌ Skills Analysis Error:', error);
            return {
                success: false,
                error: error.message,
                assessment_id: rawAssessment?.assessment_id
            };
        }
    }

    /**
     * Validate assessment data integrity and completeness
     */
    validateAssessment(assessment) {
        const errors = [];

        // Check for required fields
        this.validationRules.requiredFields.forEach(field => {
            if (!assessment[field] && assessment[field] !== 0) {
                errors.push(`Missing required field: ${field}`);
            }
        });

        // Check score ranges
        this.validationRules.requiredFields.forEach(field => {
            if (assessment[field]) {
                const score = parseInt(assessment[field]);
                if (score < this.validationRules.minScore || score > this.validationRules.maxScore) {
                    errors.push(`${field} score ${score} is outside valid range (1-10)`);
                }
            }
        });

        // Check for reasonable score patterns (detect obviously fake assessments)
        const scores = this.validationRules.requiredFields.map(field => parseInt(assessment[field])).filter(s => !isNaN(s));
        if (scores.length > 0) {
            const allSame = scores.every(score => score === scores[0]);
            const allMax = scores.every(score => score === 10);
            const allMin = scores.every(score => score === 1);
            
            if (allSame && scores.length > 8) {
                errors.push('Suspiciously uniform scores detected - assessment may not be genuine');
            }
            if (allMax || allMin) {
                errors.push('Extreme score pattern detected - please provide more realistic assessments');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warning_flags: this.detectWarningFlags(assessment)
        };
    }

    /**
     * Detect potential warning flags in assessment data
     */
    detectWarningFlags(assessment) {
        const flags = [];
        
        // Check for overconfidence patterns
        const scores = this.validationRules.requiredFields.map(field => parseInt(assessment[field]));
        const highScores = scores.filter(s => s >= 8).length;
        const totalScores = scores.length;
        
        if (highScores / totalScores > 0.7) {
            flags.push('high_confidence_pattern');
        }

        // Check for underconfidence patterns
        const lowScores = scores.filter(s => s <= 4).length;
        if (lowScores / totalScores > 0.7) {
            flags.push('low_confidence_pattern');
        }

        return flags;
    }

    /**
     * Calculate category averages and overall metrics
     */
    calculateCategoryAnalysis(assessment) {
        const categoryResults = {};

        Object.entries(this.skillCategories).forEach(([categoryKey, categoryInfo]) => {
            const subcategoryScores = categoryInfo.subcategories.map(subcategory => {
                const score = parseInt(assessment[subcategory.code]) || 5;
                return {
                    code: subcategory.code,
                    name: subcategory.name,
                    score: score,
                    weight: subcategory.weight,
                    proficiency: this.proficiencyLevels[score]
                };
            });

            // Calculate weighted average for the category
            const totalWeightedScore = subcategoryScores.reduce((sum, sub) => sum + (sub.score * sub.weight), 0);
            const totalWeight = subcategoryScores.reduce((sum, sub) => sum + sub.weight, 0);
            const categoryAverage = totalWeightedScore / totalWeight;

            categoryResults[categoryKey] = {
                name: categoryInfo.name,
                description: categoryInfo.description,
                average_score: Math.round(categoryAverage * 10) / 10,
                proficiency: this.proficiencyLevels[Math.round(categoryAverage)],
                subcategories: subcategoryScores,
                importance_weight: categoryInfo.importance_weight,
                improvement_potential: 10 - categoryAverage
            };
        });

        // Calculate overall assessment metrics
        const overallWeightedScore = Object.entries(categoryResults).reduce((sum, [key, category]) => {
            return sum + (category.average_score * category.importance_weight);
        }, 0);

        const totalImportanceWeight = Object.values(categoryResults).reduce((sum, category) => {
            return sum + category.importance_weight;
        }, 0);

        const overallAverage = overallWeightedScore / totalImportanceWeight;

        return {
            categories: categoryResults,
            overall_average: Math.round(overallAverage * 10) / 10,
            overall_proficiency: this.proficiencyLevels[Math.round(overallAverage)],
            assessment_date: assessment.created_at || new Date().toISOString()
        };
    }

    /**
     * Identify top strengths and areas needing improvement
     */
    identifyStrengthsAndWeaknesses(categoryAnalysis, rawAssessment) {
        // Find strongest and weakest categories
        const categoriesByScore = Object.entries(categoryAnalysis.categories)
            .sort(([,a], [,b]) => b.average_score - a.average_score);

        const strongestCategory = categoriesByScore[0];
        const weakestCategory = categoriesByScore[categoriesByScore.length - 1];

        // Find individual skill strengths and weaknesses across all categories
        const allSkills = [];
        Object.values(categoryAnalysis.categories).forEach(category => {
            allSkills.push(...category.subcategories);
        });

        const skillsByScore = allSkills.sort((a, b) => b.score - a.score);
        const topStrengths = skillsByScore.slice(0, 3);
        const bottomWeaknesses = skillsByScore.slice(-3).reverse();

        // Identify skills that need immediate attention (score < 4)
        const criticalAreas = allSkills.filter(skill => skill.score < 4);

        // Identify well-balanced areas (scores 6-8)
        const balancedAreas = allSkills.filter(skill => skill.score >= 6 && skill.score <= 8);

        return {
            strongest_category: {
                name: strongestCategory[1].name,
                code: strongestCategory[0],
                score: strongestCategory[1].average_score,
                note: `Your strongest area - maintain and build on this foundation`
            },
            weakest_category: {
                name: weakestCategory[1].name,
                code: weakestCategory[0],
                score: weakestCategory[1].average_score,
                improvement_potential: weakestCategory[1].improvement_potential,
                note: `Your biggest opportunity for improvement`
            },
            top_individual_strengths: topStrengths.map(skill => ({
                name: skill.name,
                code: skill.code,
                score: skill.score,
                note: `Keep up the excellent work in this area`
            })),
            bottom_individual_weaknesses: bottomWeaknesses.map(skill => ({
                name: skill.name,
                code: skill.code,
                score: skill.score,
                improvement_potential: 10 - skill.score,
                note: `Focus area for significant improvement`
            })),
            critical_areas: criticalAreas.map(skill => ({
                name: skill.name,
                code: skill.code,
                score: skill.score,
                urgency: 'high',
                note: `Needs immediate attention`
            })),
            balanced_areas: balancedAreas.map(skill => ({
                name: skill.name,
                code: skill.code,
                score: skill.score,
                note: `Well-developed skill to maintain`
            }))
        };
    }

    /**
     * Calculate progress between two assessments
     */
    calculateProgressAnalysis(currentAssessment, previousAssessment) {
        const progressData = {
            time_between_assessments: this.calculateTimeBetween(
                previousAssessment.created_at,
                currentAssessment.created_at
            ),
            category_improvements: {},
            individual_skill_changes: {},
            overall_improvement: 0,
            improvement_rate: 0
        };

        // Calculate category-level improvements
        Object.keys(this.skillCategories).forEach(categoryKey => {
            const currentCategory = this.calculateCategoryAverage(currentAssessment, categoryKey);
            const previousCategory = this.calculateCategoryAverage(previousAssessment, categoryKey);
            
            const improvement = currentCategory - previousCategory;
            
            progressData.category_improvements[categoryKey] = {
                previous_score: Math.round(previousCategory * 10) / 10,
                current_score: Math.round(currentCategory * 10) / 10,
                improvement: Math.round(improvement * 10) / 10,
                improvement_percentage: previousCategory > 0 ? Math.round((improvement / previousCategory) * 100) : 0,
                trend: improvement > 0.2 ? 'improving' : improvement < -0.2 ? 'declining' : 'stable'
            };
        });

        // Calculate individual skill changes
        this.validationRules.requiredFields.forEach(skillCode => {
            const currentScore = parseInt(currentAssessment[skillCode]) || 0;
            const previousScore = parseInt(previousAssessment[skillCode]) || 0;
            const change = currentScore - previousScore;

            progressData.individual_skill_changes[skillCode] = {
                previous_score: previousScore,
                current_score: currentScore,
                change: change,
                change_description: this.describeSkillChange(change)
            };
        });

        // Calculate overall improvement metrics
        const currentOverall = this.calculateOverallAverage(currentAssessment);
        const previousOverall = this.calculateOverallAverage(previousAssessment);
        progressData.overall_improvement = Math.round((currentOverall - previousOverall) * 10) / 10;

        // Calculate improvement rate (improvement per day)
        if (progressData.time_between_assessments.days > 0) {
            progressData.improvement_rate = Math.round(
                (progressData.overall_improvement / progressData.time_between_assessments.days) * 100
            ) / 100;
        }

        // Identify most and least improved areas
        const improvementsByCategory = Object.entries(progressData.category_improvements)
            .sort(([,a], [,b]) => b.improvement - a.improvement);

        progressData.most_improved = improvementsByCategory[0];
        progressData.least_improved = improvementsByCategory[improvementsByCategory.length - 1];

        return progressData;
    }

    /**
     * Calculate category average for a specific assessment
     */
    calculateCategoryAverage(assessment, categoryKey) {
        const categoryInfo = this.skillCategories[categoryKey];
        const scores = categoryInfo.subcategories.map(sub => parseInt(assessment[sub.code]) || 5);
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    /**
     * Calculate overall average across all skills
     */
    calculateOverallAverage(assessment) {
        const allScores = this.validationRules.requiredFields.map(field => parseInt(assessment[field]) || 5);
        return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    }

    /**
     * Calculate time between two dates
     */
    calculateTimeBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInMs = end - start;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return {
            days: diffInDays,
            weeks: Math.floor(diffInDays / 7),
            months: Math.floor(diffInDays / 30),
            description: this.describeDuration(diffInDays)
        };
    }

    /**
     * Describe duration in human-friendly terms
     */
    describeDuration(days) {
        if (days < 7) return `${days} days`;
        if (days < 30) return `${Math.floor(days / 7)} weeks`;
        if (days < 365) return `${Math.floor(days / 30)} months`;
        return `${Math.floor(days / 365)} years`;
    }

    /**
     * Describe skill change in human-friendly terms
     */
    describeSkillChange(change) {
        if (change >= 2) return 'Significant improvement';
        if (change === 1) return 'Improved';
        if (change === 0) return 'No change';
        if (change === -1) return 'Slight decline';
        return 'Significant decline';
    }

    /**
     * Generate training recommendations based on analysis
     */
    generateTrainingRecommendations(categoryAnalysis, strengthsWeaknesses, userProfile) {
        const recommendations = {
            primary_focus: null,
            secondary_focuses: [],
            training_frequency: null,
            session_duration: null,
            specific_drills: [],
            progression_plan: null
        };

        // Primary focus should be the weakest category
        recommendations.primary_focus = {
            category: strengthsWeaknesses.weakest_category.code,
            reason: `Lowest scoring category with ${strengthsWeaknesses.weakest_category.score}/10 average`,
            time_allocation: '60% of training time',
            expected_improvement: '1-2 points in 4-6 weeks with consistent practice'
        };

        // Secondary focuses are other areas needing work
        const otherWeakAreas = Object.entries(categoryAnalysis.categories)
            .filter(([key,]) => key !== strengthsWeaknesses.weakest_category.code)
            .filter(([, category]) => category.average_score < 6)
            .sort(([,a], [,b]) => a.average_score - b.average_score)
            .slice(0, 2);

        recommendations.secondary_focuses = otherWeakAreas.map(([key, category]) => ({
            category: key,
            score: category.average_score,
            time_allocation: '20% of training time',
            reason: 'Secondary improvement area'
        }));

        // Training frequency recommendation based on overall skill level
        const overallLevel = categoryAnalysis.overall_average;
        if (overallLevel < 4) {
            recommendations.training_frequency = '4-5 times per week';
            recommendations.session_duration = '30-45 minutes';
        } else if (overallLevel < 6) {
            recommendations.training_frequency = '3-4 times per week';
            recommendations.session_duration = '30-60 minutes';
        } else {
            recommendations.training_frequency = '2-3 times per week';
            recommendations.session_duration = '45-60 minutes';
        }

        return recommendations;
    }

    /**
     * Calculate improvement priorities with specific action items
     */
    calculateImprovementPriorities(categoryAnalysis, userProfile) {
        const priorities = [];

        Object.entries(categoryAnalysis.categories).forEach(([categoryKey, category]) => {
            // Calculate priority score based on:
            // 1. How low the current score is (lower = higher priority)
            // 2. How much improvement potential exists
            // 3. Category importance weight
            const scoreFactor = (10 - category.average_score) / 10; // 0-1 scale
            const potentialFactor = category.improvement_potential / 10; // 0-1 scale
            const importanceFactor = category.importance_weight;
            
            const priorityScore = (scoreFactor * 0.4) + (potentialFactor * 0.4) + (importanceFactor * 0.2);

            if (category.average_score < 8) { // Only include areas that need work
                priorities.push({
                    category: categoryKey,
                    name: category.name,
                    current_score: category.average_score,
                    priority_score: Math.round(priorityScore * 100) / 100,
                    priority_level: this.categorizePriority(priorityScore),
                    improvement_potential: category.improvement_potential,
                    recommended_actions: this.generateCategoryActions(categoryKey, category),
                    timeline: this.estimateImprovementTimeline(category.average_score, category.improvement_potential)
                });
            }
        });

        return priorities.sort((a, b) => b.priority_score - a.priority_score);
    }

    /**
     * Categorize priority level based on score
     */
    categorizePriority(score) {
        if (score >= 0.7) return 'High';
        if (score >= 0.4) return 'Medium';
        return 'Low';
    }

    /**
     * Generate specific action items for each category
     */
    generateCategoryActions(categoryKey, category) {
        const actionMap = {
            receiving: [
                'Practice glove positioning and movement drills daily',
                'Work on framing techniques with a partner',
                'Focus on quiet, confident pitch presentation',
                'Video record receiving sessions for self-analysis'
            ],
            throwing: [
                'Practice quick exchange drills daily',
                'Work on footwork mechanics',
                'Focus on accuracy over arm strength',
                'Time your pop time to second base regularly'
            ],
            blocking: [
                'Practice blocking stance and positioning',
                'Work on keeping balls in front of you',
                'Practice blocking from different angles',
                'Focus on quick recovery after blocks'
            ],
            education: [
                'Study game situations and pitch calling',
                'Practice communication with pitchers',
                'Learn to read hitters and use scouting reports',
                'Develop positive relationships with umpires'
            ]
        };

        return actionMap[categoryKey] || ['Focus on fundamental skill development'];
    }

    /**
     * Estimate timeline for improvement
     */
    estimateImprovementTimeline(currentScore, improvementPotential) {
        if (currentScore < 4) {
            return '6-12 weeks for noticeable improvement';
        } else if (currentScore < 6) {
            return '4-8 weeks for solid progress';
        } else {
            return '2-6 weeks for refinement';
        }
    }

    /**
     * Generate radar chart data for visualization
     */
    generateRadarChartData(categoryAnalysis) {
        const categories = Object.entries(categoryAnalysis.categories);
        
        return {
            labels: categories.map(([, category]) => category.name),
            datasets: [{
                label: 'Current Skills',
                data: categories.map(([, category]) => category.average_score),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointRadius: 4
            }],
            maxValue: 10,
            centerPoint: 5
        };
    }

    /**
     * Generate user-friendly insights and summary
     */
    generateUserInsights(categoryAnalysis, strengthsWeaknesses, progressAnalysis, userProfile) {
        const insights = {
            overall_summary: this.generateOverallSummary(categoryAnalysis),
            key_insights: [],
            action_items: [],
            motivation_message: this.generateMotivationMessage(categoryAnalysis, strengthsWeaknesses),
            progress_summary: progressAnalysis ? this.generateProgressSummary(progressAnalysis) : null
        };

        // Generate key insights
        insights.key_insights = [
            `Your strongest area is ${strengthsWeaknesses.strongest_category.name} (${strengthsWeaknesses.strongest_category.score}/10)`,
            `Your biggest opportunity is ${strengthsWeaknesses.weakest_category.name} (${strengthsWeaknesses.weakest_category.score}/10)`,
            `Overall skill level: ${categoryAnalysis.overall_average}/10 (${categoryAnalysis.overall_proficiency.level})`
        ];

        if (strengthsWeaknesses.critical_areas.length > 0) {
            insights.key_insights.push(
                `${strengthsWeaknesses.critical_areas.length} skill(s) need immediate attention (scored below 4)`
            );
        }

        // Generate action items
        insights.action_items = [
            `Focus 60% of practice time on ${strengthsWeaknesses.weakest_category.name}`,
            'Practice at least 3 times per week for optimal improvement',
            'Record progress videos monthly to track visual improvement'
        ];

        if (strengthsWeaknesses.critical_areas.length > 0) {
            insights.action_items.unshift(
                `Priority: Address critical areas (${strengthsWeaknesses.critical_areas.map(area => area.name).join(', ')})`
            );
        }

        return insights;
    }

    /**
     * Generate overall summary description
     */
    generateOverallSummary(categoryAnalysis) {
        const level = categoryAnalysis.overall_proficiency.level;
        const score = categoryAnalysis.overall_average;

        const summaries = {
            'Needs Major Work': `You're at the beginning of your catching journey with an overall score of ${score}/10. Focus on building fundamental skills across all areas.`,
            'Needs Improvement': `You have basic catching skills (${score}/10) but significant room for growth. Consistent practice will lead to rapid improvement.`,
            'Average': `You demonstrate solid fundamental catching skills (${score}/10). Focus on refining techniques and building consistency.`,
            'Good': `You're a skilled catcher (${score}/10) with strong fundamentals. Work on fine-tuning your weakest areas to reach the next level.`,
            'Excellent': `You demonstrate excellent catching abilities (${score}/10). Focus on maintaining your skills and perfecting advanced techniques.`
        };

        return summaries[level] || `Your overall catching skill level is ${score}/10.`;
    }

    /**
     * Generate motivational message
     */
    generateMotivationMessage(categoryAnalysis, strengthsWeaknesses) {
        const improvementPotential = strengthsWeaknesses.weakest_category.improvement_potential;
        
        if (improvementPotential >= 6) {
            return "You have tremendous room for growth! Every practice session will lead to noticeable improvement.";
        } else if (improvementPotential >= 4) {
            return "With focused practice, you can make significant strides in your catching abilities.";
        } else {
            return "You're already skilled! Fine-tuning your technique will take you to the next level.";
        }
    }

    /**
     * Generate progress summary if previous assessment exists
     */
    generateProgressSummary(progressAnalysis) {
        const improvement = progressAnalysis.overall_improvement;
        
        if (improvement >= 1) {
            return `Excellent progress! You've improved ${improvement} points overall since your last assessment.`;
        } else if (improvement >= 0.5) {
            return `Good progress! You've improved ${improvement} points overall - keep up the consistent work.`;
        } else if (improvement > 0) {
            return `Steady progress! You've improved ${improvement} points overall. Small gains add up over time.`;
        } else if (improvement === 0) {
            return `Your skills have remained stable since your last assessment. Consider focusing on your weakest areas.`;
        } else {
            return `Your scores have declined slightly (${improvement} points). This is normal - refocus on fundamentals.`;
        }
    }

    /**
     * Get assessment insights for specific skill
     */
    getSkillInsight(skillCode, currentScore, previousScore = null) {
        const insight = {
            skill_code: skillCode,
            current_score: currentScore,
            proficiency: this.proficiencyLevels[currentScore],
            recommendations: [],
            focus_level: 'maintenance'
        };

        // Determine focus level
        if (currentScore < 4) {
            insight.focus_level = 'critical';
            insight.recommendations.push('Needs immediate attention - focus heavily on this skill');
        } else if (currentScore < 6) {
            insight.focus_level = 'improvement';
            insight.recommendations.push('Good opportunity for improvement with focused practice');
        } else if (currentScore < 8) {
            insight.focus_level = 'refinement';
            insight.recommendations.push('Solid foundation - work on refining technique');
        } else {
            insight.focus_level = 'maintenance';
            insight.recommendations.push('Strong skill - maintain with regular practice');
        }

        // Add progress insight if previous score available
        if (previousScore !== null) {
            const change = currentScore - previousScore;
            insight.progress = {
                change: change,
                description: this.describeSkillChange(change),
                trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
            };

            if (change > 0) {
                insight.recommendations.push(`Great progress! You've improved ${change} point(s) in this area`);
            } else if (change < 0) {
                insight.recommendations.push(`This area has declined ${Math.abs(change)} point(s) - consider refocusing here`);
            }
        }

        return insight;
    }

    /**
     * Generate assessment comparison report
     */
    generateComparisonReport(currentAssessment, previousAssessment) {
        const comparison = {
            time_between: this.calculateTimeBetween(previousAssessment.created_at, currentAssessment.created_at),
            overall_change: 0,
            category_changes: {},
            skill_changes: {},
            insights: [],
            recommendations: []
        };

        // Calculate overall change
        const currentOverall = this.calculateOverallAverage(currentAssessment);
        const previousOverall = this.calculateOverallAverage(previousAssessment);
        comparison.overall_change = Math.round((currentOverall - previousOverall) * 10) / 10;

        // Category-by-category analysis
        Object.keys(this.skillCategories).forEach(categoryKey => {
            const currentAvg = this.calculateCategoryAverage(currentAssessment, categoryKey);
            const previousAvg = this.calculateCategoryAverage(previousAssessment, categoryKey);
            const change = currentAvg - previousAvg;

            comparison.category_changes[categoryKey] = {
                previous: Math.round(previousAvg * 10) / 10,
                current: Math.round(currentAvg * 10) / 10,
                change: Math.round(change * 10) / 10,
                trend: change > 0.2 ? 'improving' : change < -0.2 ? 'declining' : 'stable',
                significance: Math.abs(change) >= 1 ? 'significant' : Math.abs(change) >= 0.5 ? 'moderate' : 'minor'
            };
        });

        // Individual skill analysis
        this.validationRules.requiredFields.forEach(skillCode => {
            const currentScore = parseInt(currentAssessment[skillCode]);
            const previousScore = parseInt(previousAssessment[skillCode]);
            const change = currentScore - previousScore;

            comparison.skill_changes[skillCode] = {
                previous: previousScore,
                current: currentScore,
                change: change,
                description: this.describeSkillChange(change)
            };
        });

        // Generate insights based on changes
        this.generateComparisonInsights(comparison);

        return comparison;
    }

    /**
     * Generate insights from comparison data
     */
    generateComparisonInsights(comparison) {
        // Overall trend insight
        if (comparison.overall_change >= 1) {
            comparison.insights.push("Excellent overall improvement! Your training is clearly working.");
            comparison.recommendations.push("Continue your current training approach - it's very effective.");
        } else if (comparison.overall_change >= 0.5) {
            comparison.insights.push("Good steady progress across your skills.");
            comparison.recommendations.push("Keep up the consistent work - you're on the right track.");
        } else if (comparison.overall_change <= -0.5) {
            comparison.insights.push("Some decline in overall scores - this may indicate overtraining or lack of focus.");
            comparison.recommendations.push("Consider adjusting your training approach or taking a brief rest.");
        }

        // Category-specific insights
        Object.entries(comparison.category_changes).forEach(([category, data]) => {
            if (data.significance === 'significant') {
                if (data.change > 0) {
                    comparison.insights.push(`${this.skillCategories[category].name} has improved significantly (+${data.change}).`);
                } else {
                    comparison.insights.push(`${this.skillCategories[category].name} has declined significantly (${data.change}).`);
                    comparison.recommendations.push(`Focus more attention on ${this.skillCategories[category].name} training.`);
                }
            }
        });

        // Find most improved and most declined skills
        const skillChanges = Object.entries(comparison.skill_changes)
            .sort(([,a], [,b]) => b.change - a.change);

        const mostImproved = skillChanges[0];
        const mostDeclined = skillChanges[skillChanges.length - 1];

        if (mostImproved[1].change > 0) {
            comparison.insights.push(`Your most improved skill: ${mostImproved[0]} (+${mostImproved[1].change} points).`);
        }

        if (mostDeclined[1].change < 0) {
            comparison.insights.push(`Area needing attention: ${mostDeclined[0]} (${mostDeclined[1].change} points).`);
            comparison.recommendations.push(`Consider dedicating extra practice time to ${mostDeclined[0]}.`);
        }
    }

    /**
     * Export assessment data for external analysis
     */
    exportAssessmentData(assessmentAnalysis, format = 'json') {
        const exportData = {
            export_date: new Date().toISOString(),
            format: format,
            assessment_summary: {
                assessment_id: assessmentAnalysis.assessment_id,
                overall_score: assessmentAnalysis.categoryAnalysis.overall_average,
                overall_level: assessmentAnalysis.categoryAnalysis.overall_proficiency.level,
                analyzed_at: assessmentAnalysis.analyzed_at
            },
            category_scores: {},
            individual_skills: {},
            recommendations: assessmentAnalysis.trainingRecommendations,
            radar_chart_data: assessmentAnalysis.radarChartData
        };

        // Extract category scores
        Object.entries(assessmentAnalysis.categoryAnalysis.categories).forEach(([key, category]) => {
            exportData.category_scores[key] = {
                name: category.name,
                score: category.average_score,
                proficiency: category.proficiency.level
            };
        });

        // Extract individual skill scores
        Object.values(assessmentAnalysis.categoryAnalysis.categories).forEach(category => {
            category.subcategories.forEach(skill => {
                exportData.individual_skills[skill.code] = {
                    name: skill.name,
                    score: skill.score,
                    proficiency: skill.proficiency.level
                };
            });
        });

        return exportData;
    }
}

// Export for use in other parts of the application
export default SkillsAssessmentLogic;

/*
==================================================
EXPLANATION OF KEY CONCEPTS:
==================================================

SKILLS ASSESSMENT PROCESSING:
This component takes raw 1-10 ratings from users and turns them into
actionable insights that drive personalized training recommendations.

13-CATEGORY ANALYSIS:
The system analyzes all 13 individual skills, groups them into 4 main
categories (receiving, throwing, blocking, education), and identifies
patterns and improvement opportunities.

WEIGHTED SCORING:
Not all skills are equally important - the system uses weights to 
calculate more accurate category averages. For example, "exchange" 
might be weighted higher than "arm strength" in the throwing category.

PROGRESS TRACKING:
When users retake assessments, the system calculates improvement rates,
identifies trends, and adjusts recommendations based on what's working.

PROFICIENCY LEVELS:
Scores 1-10 are mapped to descriptive levels:
- 1-2: Needs Major Work (Red)
- 3-4: Needs Improvement (Orange) 
- 5-6: Average (Yellow)
- 7-8: Good (Green)
- 9-10: Excellent (Blue)

EXAMPLE ANALYSIS OUTPUT:
Input: User rates blocking_overall as 3/10
Output: {
  category: "blocking",
  proficiency: "Needs Improvement",
  focus_level: "critical",
  recommendations: ["Needs immediate attention", "Focus heavily on blocking drills"],
  improvement_potential: 7,
  priority_score: 0.85
}

This tells the workout algorithm to prioritize blocking drills heavily.

VALIDATION & QUALITY CONTROL:
The system detects suspicious patterns like:
- All 10s (overconfidence)
- All 1s (underconfidence) 
- Identical scores across all skills
- Unusual patterns that might indicate fake assessments

RADAR CHART GENERATION:
Creates data for visual progress tracking showing strengths/weaknesses
across the 4 main categories in an easy-to-understand format.

This component is crucial because it transforms subjective self-ratings
into objective, actionable training plans that the AI coach can execute.
*/