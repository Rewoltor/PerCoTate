/**
 * MRMC Study Dashboard - Data Loader Module
 * Handles CSV parsing and data transformation
 */

const DataLoader = {
    // Configuration - absolute path from server root (scripts directory)
    DATA_PATH: '../outputs/csv/export_2026.02.06_11:11_1/participants.csv',


    /**
     * Load and parse the CSV data
     * @returns {Promise<Object>} Parsed and processed data
     */
    async load() {
        return new Promise((resolve, reject) => {
            Papa.parse(this.DATA_PATH, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    const processedData = this.processData(results.data);
                    resolve(processedData);
                },
                error: (error) => {
                    reject(new Error(`Failed to load CSV: ${error.message}`));
                }
            });
        });
    },

    /**
     * Process raw CSV data into structured format
     * @param {Array} rawData - Raw CSV rows
     * @returns {Object} Processed data with computed fields
     */
    processData(rawData) {
        // Filter out invalid rows
        const trials = rawData.filter(row =>
            row.treatment_group !== null &&
            row.initial_decision !== null
        );

        // Add computed fields
        trials.forEach(trial => {
            // Determine group (0 = Control, 1 = Experimental)
            trial.isControl = trial.treatment_group.toString().startsWith('0');
            trial.isExperimental = trial.treatment_group.toString().startsWith('1');

            // Compute correctness
            trial.isInitialCorrect = trial.initial_decision === trial.ground_truth_binary;
            trial.isFinalCorrect = (trial.final_decision !== null)
                ? trial.final_decision === trial.ground_truth_binary
                : trial.isInitialCorrect;

            // AI correctness
            trial.isAICorrect = trial.ai_prediction === trial.ground_truth_binary;

            // Decision change
            trial.changedDecision = trial.final_decision !== null &&
                trial.final_decision !== trial.initial_decision;

            // AI agreement
            trial.agreesWithAI = trial.final_decision !== null
                ? trial.final_decision === trial.ai_prediction
                : trial.initial_decision === trial.ai_prediction;

            // Extract trial number from trial_id (e.g., 'trial_1' -> 1, 'trial_50' -> 50)
            const trialIdMatch = trial.trial_id ? trial.trial_id.match(/trial_(\d+)/) : null;
            trial.trial_number = trialIdMatch ? parseInt(trialIdMatch[1], 10) : 1;
            trial.trialBlock = Math.ceil(trial.trial_number / 10);
        });

        // Group by participant
        const participants = this.groupByParticipant(trials);

        // Separate groups
        const controlTrials = trials.filter(t => t.isControl);
        const experimentalTrials = trials.filter(t => t.isExperimental);

        const controlParticipants = Object.values(participants).filter(p => p.isControl);
        const experimentalParticipants = Object.values(participants).filter(p => !p.isControl);

        return {
            trials,
            participants: Object.values(participants),
            controlTrials,
            experimentalTrials,
            controlParticipants,
            experimentalParticipants,
            metadata: {
                totalTrials: trials.length,
                totalParticipants: Object.keys(participants).length,
                controlCount: controlParticipants.length,
                experimentalCount: experimentalParticipants.length,
                loadedAt: new Date().toISOString()
            }
        };
    },

    /**
     * Group trials by participant and aggregate metrics
     * @param {Array} trials - All trials
     * @returns {Object} Participants keyed by ID
     */
    groupByParticipant(trials) {
        const participants = {};

        trials.forEach(trial => {
            // Use participant_id to group by individual participant
            const id = trial.participant_id || trial.treatment_group;

            if (!participants[id]) {
                participants[id] = {
                    id,
                    isControl: trial.isControl,
                    trials: [],
                    // Personality data (same for all trials of participant)
                    iq_score: trial.iq_score,
                    big5_openness: trial.big5_openness,
                    big5_conscientiousness: trial.big5_conscientiousness,
                    big5_extraversion: trial.big5_extraversion,
                    big5_agreeableness: trial.big5_agreeableness,
                    big5_neuroticism: trial.big5_neuroticism,
                    // Aggregated metrics (computed later)
                    correctCount: 0,
                    totalTrials: 0,
                    totalTime: 0,
                    changedCount: 0,
                    aiAgreementCount: 0
                };
            }

            participants[id].trials.push(trial);
            participants[id].totalTrials++;
            participants[id].totalTime += trial.trial_duration || 0;

            if (trial.isFinalCorrect) participants[id].correctCount++;
            if (trial.changedDecision) participants[id].changedCount++;
            if (trial.agreesWithAI) participants[id].aiAgreementCount++;
        });

        // Compute derived metrics
        Object.values(participants).forEach(p => {
            p.accuracy = p.correctCount / p.totalTrials;
            p.avgTime = p.totalTime / p.totalTrials;
            p.changeRate = p.changedCount / p.totalTrials;
            p.aiAgreementRate = p.aiAgreementCount / p.totalTrials;

            // Fatigue: difference between first 10 and last 10 trials
            const first10 = p.trials.filter(t => t.trial_number <= 10);
            const last10 = p.trials.filter(t => t.trial_number > 40);

            const first10Accuracy = first10.filter(t => t.isFinalCorrect).length / first10.length;
            const last10Accuracy = last10.filter(t => t.isFinalCorrect).length / last10.length;

            p.first10Accuracy = first10Accuracy;
            p.last10Accuracy = last10Accuracy;
            p.fatigueDrop = first10Accuracy - last10Accuracy;
        });

        return participants;
    },

    /**
     * Get accuracy by trial block (1-5)
     * @param {Array} trials - Trials to analyze
     * @returns {Array} Accuracy per block
     */
    getAccuracyByBlock(trials) {
        const blocks = [[], [], [], [], []];

        trials.forEach(trial => {
            const blockIdx = Math.min(trial.trialBlock - 1, 4);
            blocks[blockIdx].push(trial.isFinalCorrect ? 1 : 0);
        });

        return blocks.map(block => {
            if (block.length === 0) return 0;
            return block.reduce((a, b) => a + b, 0) / block.length * 100;
        });
    },

    /**
     * Get accuracy by KL grade
     * @param {Array} trials - Trials to analyze
     * @returns {Object} Accuracy per KL grade
     */
    getAccuracyByKLGrade(trials) {
        const grades = {};

        trials.forEach(trial => {
            const grade = trial.ground_truth_raw;
            if (grade === null || grade === undefined) return;

            if (!grades[grade]) {
                grades[grade] = { correct: 0, total: 0 };
            }

            grades[grade].total++;
            if (trial.isFinalCorrect) grades[grade].correct++;
        });

        // Convert to accuracy
        Object.keys(grades).forEach(grade => {
            grades[grade].accuracy = grades[grade].correct / grades[grade].total * 100;
        });

        return grades;
    },

    /**
     * Calculate AI interaction metrics for experimental group
     * @param {Array} trials - Experimental trials
     * @returns {Object} AI interaction statistics
     */
    getAIInteractionMetrics(trials) {
        let overreliance = 0;  // User right, AI wrong -> followed AI (wrong final)
        let effectiveUse = 0;  // User wrong, AI right -> followed AI (correct final)
        let aiAgreement = 0;   // Final decision matches AI
        let reversed = 0;      // Changed initial decision

        let overrelianceOpportunities = 0;
        let effectiveUseOpportunities = 0;

        trials.forEach(trial => {
            if (trial.final_decision !== null) {
                // AI agreement
                if (trial.final_decision === trial.ai_prediction) aiAgreement++;

                // Reversed decision
                if (trial.changedDecision) reversed++;

                // Over-reliance: user was initially correct, AI was wrong
                if (trial.isInitialCorrect && !trial.isAICorrect) {
                    overrelianceOpportunities++;
                    if (!trial.isFinalCorrect) overreliance++;
                }

                // Effective use: user was initially wrong, AI was right
                if (!trial.isInitialCorrect && trial.isAICorrect) {
                    effectiveUseOpportunities++;
                    if (trial.isFinalCorrect) effectiveUse++;
                }
            }
        });

        return {
            overrelianceRate: overrelianceOpportunities > 0
                ? (overreliance / overrelianceOpportunities * 100) : 0,
            effectiveUseRate: effectiveUseOpportunities > 0
                ? (effectiveUse / effectiveUseOpportunities * 100) : 0,
            aiAgreementRate: trials.length > 0
                ? (aiAgreement / trials.length * 100) : 0,
            reversalRate: trials.length > 0
                ? (reversed / trials.length * 100) : 0,
            overrelianceCount: overreliance,
            overrelianceOpportunities,
            effectiveUseCount: effectiveUse,
            effectiveUseOpportunities
        };
    },

    /**
     * Get AI trust over trial blocks
     * @param {Array} trials - Experimental trials
     * @returns {Array} Agreement rate per block
     */
    getAITrustByBlock(trials) {
        const blocks = [[], [], [], [], []];

        trials.forEach(trial => {
            if (trial.final_decision !== null) {
                const blockIdx = Math.min(trial.trialBlock - 1, 4);
                blocks[blockIdx].push(trial.agreesWithAI ? 1 : 0);
            }
        });

        return blocks.map(block => {
            if (block.length === 0) return 0;
            return block.reduce((a, b) => a + b, 0) / block.length * 100;
        });
    }
};
