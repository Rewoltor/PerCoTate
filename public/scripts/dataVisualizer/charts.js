/**
 * MRMC Study Dashboard - Charts Module
 * Chart.js configuration and rendering
 */

const Charts = {
    // Chart instances registry
    instances: {},

    // Default chart options - Professional light theme
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#5c5c5c',
                    font: { family: 'Inter, sans-serif', size: 12, weight: 500 }
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1a1a1a',
                bodyColor: '#5c5c5c',
                borderColor: '#e0e0e0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 6,
                titleFont: { family: 'Inter, sans-serif', weight: 600, size: 13 },
                bodyFont: { family: 'Inter, sans-serif', size: 12 },
                boxPadding: 4
            }
        },
        scales: {
            x: {
                grid: { color: '#f0f0f0' },
                ticks: { color: '#8a8a8a', font: { family: 'Inter, sans-serif', size: 11 } },
                border: { color: '#e0e0e0' }
            },
            y: {
                grid: { color: '#f0f0f0' },
                ticks: { color: '#8a8a8a', font: { family: 'Inter, sans-serif', size: 11 } },
                border: { color: '#e0e0e0' }
            }
        }
    },

    // Color palette - Professional muted tones
    colors: {
        control: '#1a73e8',
        experimental: '#5f6368',
        ai: '#1e8e3e',
        warning: '#e37400',
        error: '#d93025',
        info: '#1a73e8',
        gradient1: 'rgba(26, 115, 232, 0.7)',
        gradient2: 'rgba(95, 99, 104, 0.7)'
    },

    /**
     * Create a gradient for charts
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} color1
     * @param {string} color2
     * @returns {CanvasGradient}
     */
    createGradient(ctx, color1, color2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    },

    /**
     * Destroy chart if exists
     * @param {string} id
     */
    destroy(id) {
        if (this.instances[id]) {
            this.instances[id].destroy();
            delete this.instances[id];
        }
    },

    /**
     * Render Summary Chart - Accuracy Comparison
     * @param {Object} data - Processed data
     */
    renderSummaryChart(data) {
        const ctx = document.getElementById('summary-chart');
        if (!ctx) return;

        this.destroy('summary-chart');

        const controlAcc = Statistics.mean(data.controlParticipants.map(p => p.accuracy)) * 100;
        const expAcc = Statistics.mean(data.experimentalParticipants.map(p => p.accuracy)) * 100;
        const aiAcc = Statistics.mean(data.trials.map(t => t.isAICorrect ? 1 : 0)) * 100;

        // For experimental: before AI (initial) vs after AI (final)
        const expInitialAcc = Statistics.mean(
            data.experimentalTrials.map(t => t.isInitialCorrect ? 1 : 0)
        ) * 100;
        const expFinalAcc = Statistics.mean(
            data.experimentalTrials.map(t => t.isFinalCorrect ? 1 : 0)
        ) * 100;

        this.instances['summary-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Control\n(No AI)', 'Experimental\n(Before AI)', 'Experimental\n(After AI)', 'AI Model'],
                datasets: [{
                    label: 'Accuracy (%)',
                    data: [controlAcc, expInitialAcc, expFinalAcc, aiAcc],
                    backgroundColor: [
                        'rgba(26, 115, 232, 0.8)',
                        'rgba(95, 99, 104, 0.4)',
                        'rgba(95, 99, 104, 0.8)',
                        'rgba(30, 142, 62, 0.8)'
                    ],
                    borderColor: [
                        this.colors.control,
                        this.colors.experimental,
                        this.colors.experimental,
                        this.colors.ai
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 60
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: { display: false }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    },

    /**
     * Render Fatigue Chart - Accuracy over trial blocks
     * @param {Object} data - Processed data
     */
    renderFatigueChart(data) {
        const ctx = document.getElementById('fatigue-chart');
        if (!ctx) return;

        this.destroy('fatigue-chart');

        const controlByBlock = DataLoader.getAccuracyByBlock(data.controlTrials);
        const expByBlock = DataLoader.getAccuracyByBlock(data.experimentalTrials);

        this.instances['fatigue-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Trials 1-10', 'Trials 11-20', 'Trials 21-30', 'Trials 31-40', 'Trials 41-50'],
                datasets: [
                    {
                        label: 'Control Group',
                        data: controlByBlock,
                        borderColor: this.colors.control,
                        backgroundColor: 'rgba(26, 115, 232, 0.08)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Experimental Group',
                        data: expByBlock,
                        borderColor: this.colors.experimental,
                        backgroundColor: 'rgba(95, 99, 104, 0.08)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        min: 40,
                        max: 80,
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    },

    /**
     * Render AI Trust Chart - Agreement over time
     * @param {Object} data - Processed data
     */
    renderAITrustChart(data) {
        const ctx = document.getElementById('ai-trust-chart');
        if (!ctx) return;

        this.destroy('ai-trust-chart');

        const trustByBlock = DataLoader.getAITrustByBlock(data.experimentalTrials);
        const reversalByBlock = this.getReversalByBlock(data.experimentalTrials);

        this.instances['ai-trust-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Trials 1-10', 'Trials 11-20', 'Trials 21-30', 'Trials 31-40', 'Trials 41-50'],
                datasets: [
                    {
                        label: 'AI Agreement Rate',
                        data: trustByBlock,
                        borderColor: this.colors.ai,
                        backgroundColor: 'rgba(30, 142, 62, 0.08)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Decision Reversal Rate',
                        data: reversalByBlock,
                        borderColor: this.colors.warning,
                        backgroundColor: 'rgba(227, 116, 0, 0.08)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Rate (%)',
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    },

    /**
     * Get reversal rate by block
     * @param {Array} trials
     * @returns {Array}
     */
    getReversalByBlock(trials) {
        const blocks = [[], [], [], [], []];

        trials.forEach(trial => {
            const blockIdx = Math.min(trial.trialBlock - 1, 4);
            blocks[blockIdx].push(trial.changedDecision ? 1 : 0);
        });

        return blocks.map(block => {
            if (block.length === 0) return 0;
            return block.reduce((a, b) => a + b, 0) / block.length * 100;
        });
    },

    /**
     * Render Personality Chart - Big Five correlations bar chart
     * @param {Object} data - Processed data
     */
    renderPersonalityChart(data) {
        const ctx = document.getElementById('personality-chart');
        if (!ctx) return;

        this.destroy('personality-chart');

        // Calculate correlations for control group
        const controlP = data.controlParticipants.filter(p => p.big5_openness !== null);

        const traits = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
        const traitKeys = ['big5_openness', 'big5_conscientiousness', 'big5_extraversion', 'big5_agreeableness', 'big5_neuroticism'];

        const correlations = traitKeys.map(key => {
            const traitValues = controlP.map(p => p[key]);
            const accuracies = controlP.map(p => p.accuracy);
            const result = Statistics.pearsonCorrelation(traitValues, accuracies);
            return result.r;
        });

        this.instances['personality-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: traits,
                datasets: [{
                    label: 'Correlation with Accuracy (r)',
                    data: correlations,
                    backgroundColor: correlations.map(r =>
                        r >= 0 ? 'rgba(30, 142, 62, 0.7)' : 'rgba(217, 48, 37, 0.7)'
                    ),
                    borderColor: correlations.map(r =>
                        r >= 0 ? '#1e8e3e' : '#d93025'
                    ),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                indexAxis: 'y',
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        min: -0.6,
                        max: 0.6,
                        title: {
                            display: true,
                            text: 'Correlation (r)',
                            color: '#64748b'
                        }
                    },
                    y: this.defaultOptions.scales.y
                }
            }
        });
    },

    /**
     * Render Time vs Accuracy Scatter Chart with regression line
     * @param {Object} data - Processed data
     */
    renderTimeAccuracyChart(data) {
        const ctx = document.getElementById('time-accuracy-chart');
        if (!ctx) return;

        this.destroy('time-accuracy-chart');

        // Use control participants for time vs accuracy scatter
        const xValues = data.controlParticipants.map(p => p.avgTime);
        const yValues = data.controlParticipants.map(p => p.accuracy * 100);

        const scatterData = data.controlParticipants.map(p => ({
            x: p.avgTime,
            y: p.accuracy * 100
        }));

        // Calculate linear regression
        const regression = Statistics.linearRegression(xValues, yValues);

        // Generate regression line points
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const regressionLine = [
            { x: xMin, y: regression.predict(xMin) },
            { x: xMax, y: regression.predict(xMax) }
        ];

        this.instances['time-accuracy-chart'] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Participants',
                        data: scatterData,
                        backgroundColor: 'rgba(26, 115, 232, 0.5)',
                        borderColor: this.colors.control,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    },
                    {
                        label: `Regression (R² = ${regression.r2.toFixed(3)})`,
                        data: regressionLine,
                        type: 'line',
                        borderColor: this.colors.warning,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        display: true,
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter, sans-serif', size: 12 }
                        }
                    },
                    annotation: {
                        annotations: {
                            regressionLabel: {
                                type: 'label',
                                xValue: xMax * 0.8,
                                yValue: regression.predict(xMax * 0.8) + 3,
                                content: `y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(1)}`,
                                color: this.colors.warning,
                                font: { size: 11 }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        title: {
                            display: true,
                            text: 'Average Time per Trial (seconds)',
                            color: '#64748b'
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        min: 40,
                        max: 80,
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    },

    /**
     * Render KL Grade Chart - Accuracy by difficulty
     * @param {Object} data - Processed data
     */
    renderKLChart(data) {
        const ctx = document.getElementById('kl-chart');
        if (!ctx) return;

        this.destroy('kl-chart');

        const controlKL = DataLoader.getAccuracyByKLGrade(data.controlTrials);
        const expKL = DataLoader.getAccuracyByKLGrade(data.experimentalTrials);

        const grades = ['0', '2', '3', '4']; // Note: Grade 1 is missing from dataset

        const controlData = grades.map(g => controlKL[g]?.accuracy || 0);
        const expData = grades.map(g => expKL[g]?.accuracy || 0);

        this.instances['kl-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: grades.map(g => `Grade ${g}`),
                datasets: [
                    {
                        label: 'Control',
                        data: controlData,
                        backgroundColor: this.colors.control,
                        borderRadius: 8
                    },
                    {
                        label: 'Experimental',
                        data: expData,
                        backgroundColor: this.colors.experimental,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    },

    /**
     * Render Neuroticism vs Fatigue Scatter Chart with regression
     * @param {Object} data - Processed data
     */
    renderNeuroticismFatigueChart(data) {
        const ctx = document.getElementById('neuroticism-fatigue-chart');
        if (!ctx) return;

        this.destroy('neuroticism-fatigue-chart');

        // Use control participants for this analysis
        const validP = data.controlParticipants.filter(p =>
            p.big5_neuroticism !== null &&
            p.big5_neuroticism !== undefined &&
            !isNaN(p.fatigueDrop)
        );

        const xValues = validP.map(p => p.big5_neuroticism);
        const yValues = validP.map(p => p.fatigueDrop * 100); // Convert to percentage

        const scatterData = validP.map(p => ({
            x: p.big5_neuroticism,
            y: p.fatigueDrop * 100
        }));

        // Calculate linear regression
        const regression = Statistics.linearRegression(xValues, yValues);

        // Generate regression line points
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const regressionLine = [
            { x: xMin, y: regression.predict(xMin) },
            { x: xMax, y: regression.predict(xMax) }
        ];

        // Calculate correlation for display
        const correlation = Statistics.pearsonCorrelation(xValues, yValues);

        this.instances['neuroticism-fatigue-chart'] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Participants',
                        data: scatterData,
                        backgroundColor: 'rgba(217, 48, 37, 0.5)',
                        borderColor: this.colors.error,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    },
                    {
                        label: `Regression (r = ${correlation.r.toFixed(2)}, p = ${Statistics.formatPValue(correlation.pValue)})`,
                        data: regressionLine,
                        type: 'line',
                        borderColor: this.colors.ai,
                        borderWidth: 3,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        display: true,
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter, sans-serif', size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        min: 1,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Neuroticism Score',
                            color: '#64748b'
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Fatigue Drop-off (%)',
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    },

    /**
     * AI Reliance metric config
     */
    aiRelianceMetrics: {
        aiAgreement: { label: 'AI Agreement Rate', color: '#1e8e3e', bgColor: 'rgba(30, 142, 62, 0.08)' },
        initialAccuracy: { label: 'Initial Accuracy', color: '#1a73e8', bgColor: 'rgba(26, 115, 232, 0.08)' },
        finalAccuracy: { label: 'Final Accuracy', color: '#5f6368', bgColor: 'rgba(95, 99, 104, 0.08)' },
        revertRate: { label: 'Revert Rate', color: '#e37400', bgColor: 'rgba(227, 116, 0, 0.08)' }
    },

    /**
     * Render AI Reliance Over Time Chart
     * @param {Object} data - Processed data
     * @param {string|string[]} selectedMetrics - 'all' or array of metric keys
     */
    renderAIRelianceChart(data, selectedMetrics = 'all') {
        const ctx = document.getElementById('ai-reliance-chart');
        if (!ctx) return;

        this.destroy('ai-reliance-chart');

        const relianceData = DataLoader.getAIRelianceByBlock(data.experimentalTrials);
        const labels = ['Trials 1-10', 'Trials 11-20', 'Trials 21-30', 'Trials 31-40', 'Trials 41-50'];

        const datasets = [];
        let metricsToShow = [];

        if (selectedMetrics === 'all') {
            metricsToShow = Object.keys(this.aiRelianceMetrics);
        } else if (Array.isArray(selectedMetrics)) {
            metricsToShow = selectedMetrics;
        } else {
            metricsToShow = [selectedMetrics];
        }

        metricsToShow.forEach(key => {
            const cfg = this.aiRelianceMetrics[key];
            if (!cfg) return; // safety check

            datasets.push({
                label: cfg.label,
                data: relianceData[key],
                borderColor: cfg.color,
                backgroundColor: cfg.bgColor,
                fill: metricsToShow.length === 1, // Only fill if single metric selected
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: metricsToShow.length > 1 ? 2.5 : 3
            });
        });

        this.instances['ai-reliance-chart'] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        display: true,
                        labels: {
                            color: '#5c5c5c',
                            font: { family: 'Inter, sans-serif', size: 12, weight: 500 },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Rate (%)',
                            color: '#8a8a8a'
                        }
                    }
                }
            }
        });
    },

    /**
     * Render all charts
     * @param {Object} data - Processed data
     */
    renderAll(data) {
        this.renderSummaryChart(data);
        this.renderFatigueChart(data);
        this.renderAITrustChart(data);
        this.renderAIRelianceChart(data, 'all');
        this.renderPersonalityChart(data);
        this.renderNeuroticismFatigueChart(data);
        this.renderTimeAccuracyChart(data);
        this.renderKLChart(data);
    }
};
