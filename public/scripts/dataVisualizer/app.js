/**
 * MRMC Study Dashboard - Main Application
 * Orchestrates data loading, UI updates, and chart rendering
 */

const App = {
    data: null,

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 MRMC Dashboard initializing...');

        try {
            // Load data
            this.data = await DataLoader.load();
            console.log('✅ Data loaded:', this.data.metadata);

            // Update UI with data
            this.updateUI();

            // Render all charts
            Charts.renderAll(this.data);

            // Setup navigation
            this.setupNavigation();

            // Hide loading, show content
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('content').classList.remove('hidden');

            console.log('✅ Dashboard ready!');
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            document.getElementById('loading-screen').innerHTML = `
                <div class="error-message">
                    <span style="font-size: 48px;">⚠️</span>
                    <p>Failed to load data</p>
                    <p style="font-size: 12px; color: #64748b;">${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Update all UI elements with data
     */
    updateUI() {
        const { metadata, controlParticipants, experimentalParticipants, controlTrials, experimentalTrials, trials } = this.data;

        // Header stats
        this.setText('total-participants', metadata.totalParticipants);
        this.setText('total-trials', metadata.totalTrials.toLocaleString());
        this.setText('data-date', new Date(metadata.loadedAt).toLocaleDateString());

        // === EXECUTIVE SUMMARY ===
        const controlAcc = Statistics.mean(controlParticipants.map(p => p.accuracy)) * 100;
        const expAcc = Statistics.mean(experimentalParticipants.map(p => p.accuracy)) * 100;
        const aiAcc = Statistics.mean(trials.map(t => t.isAICorrect ? 1 : 0)) * 100;

        this.setText('control-accuracy', controlAcc.toFixed(1) + '%');
        this.setText('control-n', controlParticipants.length);
        this.setText('experimental-accuracy', expAcc.toFixed(1) + '%');
        this.setText('experimental-n', experimentalParticipants.length);
        this.setText('accuracy-diff', '+' + (expAcc - controlAcc).toFixed(1) + '%');
        this.setText('ai-accuracy', aiAcc.toFixed(1) + '%');

        // T-test for accuracy difference
        const tTest = Statistics.independentTTest(
            controlParticipants.map(p => p.accuracy),
            experimentalParticipants.map(p => p.accuracy)
        );
        this.setText('accuracy-pvalue', Statistics.formatPValue(tTest.pValue));

        // === HYPOTHESIS TESTING ===
        this.updateHypotheses(controlParticipants, experimentalParticipants, controlAcc, expAcc, tTest);

        // === FATIGUE ANALYSIS ===
        this.updateFatigue(controlParticipants, experimentalParticipants);

        // === AI INTERACTION ===
        this.updateAIInteraction(experimentalTrials, experimentalParticipants);

        // === PERSONALITY ===
        this.updatePersonality(controlParticipants);

        // === TIME ANALYSIS ===
        this.updateTime(controlParticipants, experimentalParticipants, expAcc, controlAcc);
    },

    /**
     * Update hypothesis testing section
     */
    updateHypotheses(controlP, expP, controlAcc, expAcc, tTest) {
        // H1: AI improves accuracy
        this.setText('h1-control', controlAcc.toFixed(2) + '%');
        this.setText('h1-experimental', expAcc.toFixed(2) + '%');
        this.setText('h1-diff', '+' + (expAcc - controlAcc).toFixed(2) + '%');
        this.setText('h1-pvalue', Statistics.formatPValue(tTest.pValue));

        const h1Status = document.getElementById('h1-status');
        if (Statistics.isSignificant(tTest.pValue)) {
            h1Status.textContent = 'SUPPORTED ★';
            h1Status.classList.remove('rejected', 'pending');
        } else {
            h1Status.textContent = 'NOT SIGNIFICANT';
            h1Status.classList.add('rejected');
        }

        // H2: IQ and Conscientiousness predict accuracy
        const validControlP = controlP.filter(p => p.iq_score !== null && p.iq_score !== undefined);

        const iqCorr = Statistics.pearsonCorrelation(
            validControlP.map(p => p.iq_score),
            validControlP.map(p => p.accuracy)
        );

        const conCorr = Statistics.pearsonCorrelation(
            validControlP.map(p => p.big5_conscientiousness),
            validControlP.map(p => p.accuracy)
        );

        this.setText('h2-iq-r', iqCorr.r.toFixed(3));
        this.setText('h2-iq-p', Statistics.formatPValue(iqCorr.pValue));
        this.setText('h2-con-r', conCorr.r.toFixed(3));
        this.setText('h2-con-p', Statistics.formatPValue(conCorr.pValue));

        const h2Status = document.getElementById('h2-status');
        const h2Significant = Statistics.isSignificant(iqCorr.pValue) || Statistics.isSignificant(conCorr.pValue);
        if (h2Significant) {
            h2Status.textContent = 'PARTIALLY SUPPORTED ★';
            h2Status.classList.remove('rejected', 'pending');
        } else {
            h2Status.textContent = 'NOT SUPPORTED';
            h2Status.classList.add('rejected');
        }
    },

    /**
     * Update fatigue analysis section
     */
    updateFatigue(controlP, expP) {
        // Control group fatigue
        const controlFirst10 = Statistics.mean(controlP.map(p => p.first10Accuracy)) * 100;
        const controlLast10 = Statistics.mean(controlP.map(p => p.last10Accuracy)) * 100;
        const controlDrop = controlFirst10 - controlLast10;

        this.setText('control-first10', controlFirst10.toFixed(1) + '%');
        this.setText('control-last10', controlLast10.toFixed(1) + '%');
        this.setText('control-dropoff', '-' + controlDrop.toFixed(1) + '%');

        // Experimental group fatigue
        const expFirst10 = Statistics.mean(expP.map(p => p.first10Accuracy)) * 100;
        const expLast10 = Statistics.mean(expP.map(p => p.last10Accuracy)) * 100;
        const expDrop = expFirst10 - expLast10;

        this.setText('exp-first10', expFirst10.toFixed(1) + '%');
        this.setText('exp-last10', expLast10.toFixed(1) + '%');
        this.setText('exp-dropoff', '-' + expDrop.toFixed(1) + '%');

        // Overall drop
        const avgDrop = (controlDrop + expDrop) / 2;
        this.setText('fatigue-drop', avgDrop.toFixed(1) + '%');
    },

    /**
     * Update AI interaction section
     */
    updateAIInteraction(expTrials, expP) {
        this.setText('ai-group-n', expP.length);

        const metrics = DataLoader.getAIInteractionMetrics(expTrials);

        this.setText('overreliance-rate', metrics.overrelianceRate.toFixed(1) + '%');
        this.setText('effective-rate', metrics.effectiveUseRate.toFixed(1) + '%');
        this.setText('agreement-rate', metrics.aiAgreementRate.toFixed(1) + '%');
        this.setText('reversal-rate', metrics.reversalRate.toFixed(1) + '%');

        // Before/after AI accuracy
        const beforeAcc = Statistics.mean(expTrials.map(t => t.isInitialCorrect ? 1 : 0)) * 100;
        const afterAcc = Statistics.mean(expTrials.map(t => t.isFinalCorrect ? 1 : 0)) * 100;

        this.setText('ai-before', beforeAcc.toFixed(1) + '%');
        this.setText('ai-after', afterAcc.toFixed(1) + '%');
    },

    /**
     * Update personality section
     */
    updatePersonality(controlP) {
        const validP = controlP.filter(p => p.big5_neuroticism !== null && !isNaN(p.fatigueDrop));
        this.setText('personality-n', validP.length);

        // Neuroticism vs Fatigue
        const nFatigue = Statistics.pearsonCorrelation(
            validP.map(p => p.big5_neuroticism),
            validP.map(p => p.fatigueDrop)
        );
        this.setText('neuroticism-fatigue-r', 'r = ' + nFatigue.r.toFixed(2));
        this.setText('neuroticism-fatigue-sig', 'p = ' + Statistics.formatPValue(nFatigue.pValue));

        // Add detail for the key finding banner
        const rDirection = nFatigue.r < 0 ? 'negative' : 'positive';
        const significantText = Statistics.isSignificant(nFatigue.pValue) ? '★ Significant' : 'Not significant';
        this.setText('neuroticism-finding-detail',
            `(r = ${nFatigue.r.toFixed(2)}, p = ${Statistics.formatPValue(nFatigue.pValue)}) ${significantText}`
        );

        // Agreeableness vs Accuracy
        const aAcc = Statistics.pearsonCorrelation(
            validP.map(p => p.big5_agreeableness),
            validP.map(p => p.accuracy)
        );
        this.setText('agreeableness-acc-r', 'r = ' + aAcc.r.toFixed(2));
        this.setText('agreeableness-acc-sig', 'p = ' + Statistics.formatPValue(aAcc.pValue));

        // Open-mindedness vs Confidence
        const avgConfidences = validP.map(p =>
            Statistics.mean(p.trials.map(t => t.confidence || t.initial_confidence))
        );
        const oConf = Statistics.pearsonCorrelation(
            validP.map(p => p.big5_openness),
            avgConfidences
        );
        this.setText('openness-conf-r', 'r = ' + oConf.r.toFixed(2));
        this.setText('openness-conf-sig', 'p = ' + Statistics.formatPValue(oConf.pValue));
    },

    /**
     * Update time analysis section
     */
    updateTime(controlP, expP, expAcc, controlAcc) {
        const controlTime = Statistics.mean(controlP.map(p => p.avgTime));
        const expTime = Statistics.mean(expP.map(p => p.avgTime));

        this.setText('control-time', controlTime.toFixed(1) + 's');
        this.setText('experimental-time', expTime.toFixed(1) + 's');

        const accGain = expAcc - controlAcc;
        const timeIncrease = ((expTime - controlTime) / controlTime * 100);

        this.setText('time-acc-gain', accGain.toFixed(1) + '%');
        this.setText('time-increase', timeIncrease.toFixed(0) + '%');
    },

    /**
     * Setup navigation scroll behavior
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Update active state
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Highlight nav item on scroll
        const sections = document.querySelectorAll('.section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navItems.forEach(item => {
                        item.classList.toggle('active', item.getAttribute('data-section') === id);
                    });
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => observer.observe(section));
    },

    /**
     * Helper to set text content safely
     */
    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => App.init());
