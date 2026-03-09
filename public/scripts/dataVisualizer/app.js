/**
 * MRMC Study Dashboard - Main Application
 * Orchestrates data loading, UI updates, and chart rendering
 */

const App = {
    data: null,
    filteredData: null,

    // Filter state
    filters: {
        phase: 'all',           // 'all', 1 (February), or 2 (March)
        treatmentGroup: 'all',  // 'all', 0 (Control), or 1 (AI)
        cohort: 'all'           // 'all', 1, or 2
    },

    // Image Analysis State
    imageAnalysisState: {
        klFilter: 'all',
        sortBy: 'acc-asc',
        viewMode: 'map', // 'map' or 'original'
        groupFilter: 'all' // 'all', 'control', or 'experimental'
    },

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 MRMC Dashboard initializing...');

        try {
            // Load data
            this.data = await DataLoader.load();
            console.log('✅ Data loaded:', this.data.metadata);

            // Extract cohort dates and populate filter UI
            this.initFilters();

            // Apply initial filters (show all)
            this.filteredData = this.getFilteredData();

            // Update UI with data
            this.updateUI();

            // Render all charts
            Charts.renderAll(this.filteredData);

            // Setup navigation
            this.setupNavigation();

            // Setup AI reliance metric selector
            this.setupAIRelianceSelector();

            // Setup Image Analysis filters
            this.initImageFilters();

            // Hide loading, show content and filter bar
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('content').classList.remove('hidden');
            document.getElementById('header-controls').classList.remove('hidden');

            // Setup scroll-based UX enhancements
            this.setupScrollEffects();

            // Animate metric values
            this.animateCounters();

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
     * Initialize filter controls from data
     */
    initFilters() {
        // === Phase Toggle ===
        const phaseToggle = document.getElementById('phase-toggle');
        const phaseSegs = phaseToggle.querySelectorAll('.phase-seg');
        const phaseShowAllBtn = document.getElementById('phase-show-all-btn');

        const updatePhaseUI = (value) => {
            phaseSegs.forEach(s => s.classList.remove('active'));
            if (value === 'all') {
                phaseToggle.classList.remove('has-selection', 'seg-2');
                phaseShowAllBtn.classList.add('active');
            } else {
                phaseShowAllBtn.classList.remove('active');
                phaseToggle.classList.add('has-selection');
                if (value === 2) {
                    phaseToggle.classList.add('seg-2');
                } else {
                    phaseToggle.classList.remove('seg-2');
                }
                phaseSegs.forEach(s => {
                    if (parseInt(s.dataset.phase, 10) === value) {
                        s.classList.add('active');
                    }
                });
            }
        };

        phaseSegs.forEach(seg => {
            seg.addEventListener('click', () => {
                const phase = parseInt(seg.dataset.phase, 10);
                this.filters.phase = phase;
                updatePhaseUI(phase);
                this.applyFilters();
            });
        });

        phaseShowAllBtn.addEventListener('click', () => {
            this.filters.phase = 'all';
            updatePhaseUI('all');
            this.applyFilters();
        });

        // === Treatment Group Toggle ===
        const tgToggle = document.getElementById('treatment-toggle');
        const tgSegs = tgToggle.querySelectorAll('.treatment-seg');
        const tgShowAllBtn = document.getElementById('treatment-show-all-btn');

        const updateTreatmentUI = (value) => {
            tgSegs.forEach(s => s.classList.remove('active'));
            if (value === 'all') {
                tgToggle.classList.remove('has-selection', 'seg-2');
                tgShowAllBtn.classList.add('active');
            } else {
                tgShowAllBtn.classList.remove('active');
                tgToggle.classList.add('has-selection');
                if (value === 1) {
                    tgToggle.classList.add('seg-2');
                } else {
                    tgToggle.classList.remove('seg-2');
                }
                tgSegs.forEach(s => {
                    if (parseInt(s.dataset.treatment, 10) === value) {
                        s.classList.add('active');
                    }
                });
            }
        };

        tgSegs.forEach(seg => {
            seg.addEventListener('click', () => {
                const tg = parseInt(seg.dataset.treatment, 10);
                this.filters.treatmentGroup = tg;
                updateTreatmentUI(tg);
                this.applyFilters();
            });
        });

        tgShowAllBtn.addEventListener('click', () => {
            this.filters.treatmentGroup = 'all';
            updateTreatmentUI('all');
            this.applyFilters();
        });

        // === Cohort Dropdown ===
        const dropdown = document.getElementById('cohort-dropdown');
        dropdown.addEventListener('change', () => {
            this.filters.cohort = dropdown.value === 'all' ? 'all' : parseInt(dropdown.value, 10);
            this.applyFilters();
        });
    },

    /**
     * Apply current filters and re-render everything
     */
    applyFilters() {
        this.filteredData = this.getFilteredData();
        this.updateUI();
        Charts.renderAll(this.filteredData);
    },

    /**
     * Filter the full dataset according to current filter state
     * @returns {Object} Filtered data in the same shape as processData output
     */
    getFilteredData() {
        let trials = this.data.trials;

        // Filter by phase (1 = February, 2 = March)
        if (this.filters.phase !== 'all') {
            trials = trials.filter(t => t.phase === this.filters.phase);
        }

        // Filter by treatment group (0 = Control, 1 = AI)
        if (this.filters.treatmentGroup !== 'all') {
            trials = trials.filter(t => t.treatment_group.toString() === this.filters.treatmentGroup.toString());
        }

        // Filter by cohort number (1 or 2)
        if (this.filters.cohort !== 'all') {
            trials = trials.filter(t => t.cohort === this.filters.cohort);
        }

        // Re-group into participants
        const participants = DataLoader.groupByParticipant(trials);

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
                loadedAt: this.data.metadata.loadedAt
            }
        };
    },

    /**
     * Update all UI elements with data
     */
    updateUI() {
        const data = this.filteredData;
        const { metadata, controlParticipants, experimentalParticipants, controlTrials, experimentalTrials, trials } = data;

        // Header stats
        this.setText('total-participants', metadata.totalParticipants);
        this.setText('total-trials', metadata.totalTrials.toLocaleString());
        this.setText('data-date', new Date(metadata.loadedAt).toLocaleDateString());

        // Guard against empty data
        if (trials.length === 0) return;

        // === EXECUTIVE SUMMARY ===
        const controlAcc = controlParticipants.length > 0
            ? Statistics.mean(controlParticipants.map(p => p.accuracy)) * 100 : 0;
        const expAcc = experimentalParticipants.length > 0
            ? Statistics.mean(experimentalParticipants.map(p => p.accuracy)) * 100 : 0;
        const aiAcc = Statistics.mean(trials.map(t => t.isAICorrect ? 1 : 0)) * 100;

        this.setText('control-accuracy', controlAcc.toFixed(1) + '%');
        this.setText('control-n', controlParticipants.length);
        this.setText('experimental-accuracy', expAcc.toFixed(1) + '%');
        this.setText('experimental-n', experimentalParticipants.length);
        this.setText('accuracy-diff', '+' + (expAcc - controlAcc).toFixed(1) + '%');
        this.setText('ai-accuracy', aiAcc.toFixed(1) + '%');

        // T-test for accuracy difference
        if (controlParticipants.length > 1 && experimentalParticipants.length > 1) {
            const tTest = Statistics.independentTTest(
                controlParticipants.map(p => p.accuracy),
                experimentalParticipants.map(p => p.accuracy)
            );
            this.setText('accuracy-pvalue', Statistics.formatPValue(tTest.pValue));

            // === HYPOTHESIS TESTING ===
            this.updateHypotheses(controlParticipants, experimentalParticipants, controlAcc, expAcc, tTest);
        } else {
            this.setText('accuracy-pvalue', 'N/A');
        }

        // === FATIGUE ANALYSIS ===
        this.updateFatigue(controlParticipants, experimentalParticipants);

        // === AI INTERACTION ===
        this.updateAIInteraction(experimentalTrials, experimentalParticipants);

        // === PERSONALITY ===
        this.updatePersonality(controlParticipants);

        // === TIME ANALYSIS ===
        this.updateTime(controlParticipants, experimentalParticipants, expAcc, controlAcc);

        // === IMAGE ANALYSIS ===
        this.renderImageAnalysis();
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

        if (validControlP.length > 2) {
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
        }
    },

    /**
     * Update fatigue analysis section
     */
    updateFatigue(controlP, expP) {
        if (controlP.length === 0 && expP.length === 0) return;

        // Control group fatigue
        if (controlP.length > 0) {
            const controlFirst10 = Statistics.mean(controlP.map(p => p.first10Accuracy)) * 100;
            const controlLast10 = Statistics.mean(controlP.map(p => p.last10Accuracy)) * 100;
            const controlDrop = controlFirst10 - controlLast10;

            this.setText('control-first10', controlFirst10.toFixed(1) + '%');
            this.setText('control-last10', controlLast10.toFixed(1) + '%');
            this.setText('control-dropoff', '-' + controlDrop.toFixed(1) + '%');
        }

        // Experimental group fatigue
        if (expP.length > 0) {
            const expFirst10 = Statistics.mean(expP.map(p => p.first10Accuracy)) * 100;
            const expLast10 = Statistics.mean(expP.map(p => p.last10Accuracy)) * 100;
            const expDrop = expFirst10 - expLast10;

            this.setText('exp-first10', expFirst10.toFixed(1) + '%');
            this.setText('exp-last10', expLast10.toFixed(1) + '%');
            this.setText('exp-dropoff', '-' + expDrop.toFixed(1) + '%');
        }

        // Overall drop
        const allP = [...controlP, ...expP];
        if (allP.length > 0) {
            const first10All = Statistics.mean(allP.map(p => p.first10Accuracy)) * 100;
            const last10All = Statistics.mean(allP.map(p => p.last10Accuracy)) * 100;
            this.setText('fatigue-drop', (first10All - last10All).toFixed(1) + '%');
        }
    },

    /**
     * Update AI interaction section
     */
    updateAIInteraction(expTrials, expP) {
        this.setText('ai-group-n', expP.length);

        if (expTrials.length === 0) return;

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

        if (validP.length < 3) return;

        // Neuroticism vs Fatigue
        const nFatigue = Statistics.pearsonCorrelation(
            validP.map(p => p.big5_neuroticism),
            validP.map(p => p.fatigueDrop)
        );
        this.setText('neuroticism-fatigue-r', 'r = ' + nFatigue.r.toFixed(2));
        this.setText('neuroticism-fatigue-sig', 'p = ' + Statistics.formatPValue(nFatigue.pValue));

        // Add detail for the key finding banner
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
        if (controlP.length === 0 || expP.length === 0) return;

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
     * Setup AI Reliance chart metric selector
     */
    setupAIRelianceSelector() {
        const selector = document.getElementById('ai-reliance-selector');
        if (!selector) return;

        const toggleButtons = selector.querySelectorAll('.metric-toggle-btn');
        const actionButton = selector.querySelector('.metric-action-btn');

        // Helper to get currently active metrics
        const getActiveMetrics = () => {
            return Array.from(toggleButtons)
                .filter(btn => btn.classList.contains('active'))
                .map(btn => btn.getAttribute('data-metric'));
        };

        // Handle Toggle Clicks
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const activeMetrics = getActiveMetrics();
                Charts.renderAIRelianceChart(this.filteredData, activeMetrics);
            });
        });

        // Handle "Reset / Show All" Click
        if (actionButton) {
            actionButton.addEventListener('click', () => {
                // Activate all buttons
                toggleButtons.forEach(btn => btn.classList.add('active'));

                // Render with all metrics
                // Passing 'all' string is supported by the chart renderer logic I will update
                // or I can pass the full array.
                // Let's pass 'all' as a convention for "everything".
                Charts.renderAIRelianceChart(this.filteredData, 'all');
            });
        }
    },

    /**
     * Setup navigation scroll behavior
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
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
     * Setup scroll-based UX enhancements:
     * - Header gains shadow on scroll
     * - Sections reveal on scroll into view
     */
    setupScrollEffects() {
        const header = document.getElementById('main-header');
        const mainContent = document.querySelector('.main-content');

        if (header && mainContent) {
            mainContent.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', mainContent.scrollTop > 10);
            }, { passive: true });

            // Also listen on window scroll in case content scrolls via window
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 10);
            }, { passive: true });
        }

        // Scroll-reveal for sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(s => s.classList.add('scroll-reveal'));

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target); // Only animate once
                }
            });
        }, { threshold: 0.01, rootMargin: '0px 0px -40px 0px' });

        sections.forEach(section => revealObserver.observe(section));
    },

    /**
     * Animate metric values counting up from 0
     */
    animateCounters() {
        const metricElements = document.querySelectorAll('.metric-value');
        metricElements.forEach(el => {
            const text = el.textContent;
            if (!text || text === '--') return;

            // Parse numeric value (supports percentages like "72.4%")
            const match = text.match(/([+-]?)([\d.]+)(%?)/);
            if (!match) return;

            const sign = match[1];
            const target = parseFloat(match[2]);
            const suffix = match[3];
            if (isNaN(target)) return;

            const duration = 800; // ms
            const startTime = performance.now();
            const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quad
                const eased = 1 - (1 - progress) * (1 - progress);
                const current = target * eased;
                el.textContent = sign + current.toFixed(decimals) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = text; // Ensure exact final value
                }
            };

            el.textContent = sign + '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '') + suffix;
            requestAnimationFrame(animate);
        });
    },

    /**
     * Helper to set text content safely
     */
    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    /**
     * Initialize Image Analysis specific filters
     */
    initImageFilters() {
        const klSelect = document.getElementById('img-kl-filter');
        const groupSelect = document.getElementById('img-group-filter');
        const sortSelect = document.getElementById('img-sort');
        const viewBtns = document.querySelectorAll('#img-view-toggle .view-btn');

        if (!sortSelect) return;

        if (klSelect) {
            klSelect.addEventListener('change', () => {
                this.imageAnalysisState.klFilter = klSelect.value;
                this.renderImageAnalysis();
            });
        }

        if (groupSelect) {
            groupSelect.addEventListener('change', () => {
                this.imageAnalysisState.groupFilter = groupSelect.value;
                this.renderImageAnalysis();
            });
        }

        sortSelect.addEventListener('change', () => {
            this.imageAnalysisState.sortBy = sortSelect.value;
            this.renderImageAnalysis();
        });

        if (viewBtns.length > 0) {
            viewBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    viewBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.imageAnalysisState.viewMode = btn.dataset.view;
                    this.renderImageAnalysis();
                });
            });
        }
    },

    /**
     * Render Image Analysis Grid
     */
    renderImageAnalysis() {
        const grid = document.getElementById('image-grid');
        if (!grid) return;

        // Get image stats from current filtered data
        let images = DataLoader.getImagePerformance(this.filteredData.trials);

        // Filter by KL
        const kl = this.imageAnalysisState.klFilter;
        if (kl !== 'all') {
            images = images.filter(img => img.klGrade === parseInt(kl, 10));
        }

        // Sort
        const sort = this.imageAnalysisState.sortBy;
        images.sort((a, b) => {
            if (sort === 'acc-asc') return a.stats.all.acc - b.stats.all.acc;
            if (sort === 'acc-desc') return b.stats.all.acc - a.stats.all.acc;
            if (sort === 'ai-shift-desc') return b.aiShiftAcc - a.aiShiftAcc;
            if (sort === 'ai-shift-asc') return a.aiShiftAcc - b.aiShiftAcc;
            if (sort === 'agree-ctrl-asc') return a.agreement.control.rate - b.agreement.control.rate;
            if (sort === 'agree-exp-init-asc') return a.agreement.expInitial.rate - b.agreement.expInitial.rate;
            return 0;
        });

        // Helper: agreement bar color class
        const agreeClass = (rate) => {
            if (rate >= 0.8) return 'agree-high';
            if (rate >= 0.6) return 'agree-mid';
            return 'agree-low';
        };

        // Render
        const gf = this.imageAnalysisState.groupFilter;

        grid.innerHTML = images.map(img => {
            const stats = img.stats;
            const agr = img.agreement;

            const imagePath = this.imageAnalysisState.viewMode === 'original' ? img.pathOriginal : img.pathMap;

            // AI Prediction Text
            const aiPredText = img.aiPrediction == 1 ? "Positive (OA)" : "Negative (Healthy)";
            const aiConfPercent = (img.aiConfidence * 100).toFixed(1) + "%";
            const aiCorrect = img.aiPrediction == img.groundTruth;
            const aiClass = aiCorrect ? "ai-correct" : "ai-wrong";

            // AI shift indicator (accuracy-based)
            let aiShiftHtml = '';
            if (img.stats.expFinal.n > 0 && img.stats.expInitial.n > 0) {
                const shiftPct = img.aiShiftAcc.toFixed(0);
                const shiftSign = img.aiShiftAcc >= 0 ? '+' : '';
                const shiftClass = img.aiShiftAcc > 2 ? 'shift-positive' : (img.aiShiftAcc < -2 ? 'shift-negative' : 'shift-neutral');
                aiShiftHtml = `<div class="ai-shift-indicator ${shiftClass}">AI shift: ${shiftSign}${shiftPct}%</div>`;
            }

            // Build correctness bars based on group filter
            let correctnessBarsHtml = '';
            if (gf === 'all') {
                correctnessBarsHtml = `
                    <div class="bar-group">
                        <div class="bar-label">Control</div>
                        <div class="bar-bg"><div class="bar-fill" style="width: ${stats.control.acc}%"></div></div>
                        <div class="bar-val">${stats.control.acc.toFixed(0)}%</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-label">Exp Init</div>
                        <div class="bar-bg"><div class="bar-fill exp-init" style="width: ${stats.expInitial.acc}%"></div></div>
                        <div class="bar-val">${stats.expInitial.acc.toFixed(0)}%</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-label">Exp Final</div>
                        <div class="bar-bg"><div class="bar-fill exp" style="width: ${stats.expFinal.acc}%"></div></div>
                        <div class="bar-val">${stats.expFinal.acc.toFixed(0)}%</div>
                    </div>`;
            } else if (gf === 'control') {
                correctnessBarsHtml = `
                    <div class="bar-group">
                        <div class="bar-label">Control</div>
                        <div class="bar-bg"><div class="bar-fill" style="width: ${stats.control.acc}%"></div></div>
                        <div class="bar-val">${stats.control.acc.toFixed(0)}%</div>
                    </div>`;
            } else if (gf === 'experimental') {
                correctnessBarsHtml = `
                    <div class="bar-group">
                        <div class="bar-label">Exp Init</div>
                        <div class="bar-bg"><div class="bar-fill exp-init" style="width: ${stats.expInitial.acc}%"></div></div>
                        <div class="bar-val">${stats.expInitial.acc.toFixed(0)}%</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-label">Exp Final</div>
                        <div class="bar-bg"><div class="bar-fill exp" style="width: ${stats.expFinal.acc}%"></div></div>
                        <div class="bar-val">${stats.expFinal.acc.toFixed(0)}%</div>
                    </div>`;
            }

            // Build agreement section based on group filter
            let agreementHtml = '';
            if (gf === 'all' || gf === 'control') {
                if (agr.control.n > 0) {
                    agreementHtml += `
                    <div class="agreement-bar-group">
                        <div class="agreement-label">Control <span class="agreement-n">(n=${agr.control.n})</span></div>
                        <div class="agreement-bar-row">
                            <div class="agreement-bar-bg">
                                <div class="agreement-fill ${agreeClass(agr.control.rate)}" style="width: ${(agr.control.rate * 100).toFixed(0)}%"></div>
                            </div>
                            <div class="agreement-val">${(agr.control.rate * 100).toFixed(0)}%</div>
                        </div>
                        <div class="agreement-votes">${agr.control.positive}⊕ ${agr.control.negative}⊖</div>
                    </div>`;
                }
            }
            if (gf === 'all' || gf === 'experimental') {
                if (agr.expInitial.n > 0) {
                    agreementHtml += `
                    <div class="agreement-bar-group">
                        <div class="agreement-label">Exp Initial <span class="agreement-n">(n=${agr.expInitial.n})</span></div>
                        <div class="agreement-bar-row">
                            <div class="agreement-bar-bg">
                                <div class="agreement-fill ${agreeClass(agr.expInitial.rate)}" style="width: ${(agr.expInitial.rate * 100).toFixed(0)}%"></div>
                            </div>
                            <div class="agreement-val">${(agr.expInitial.rate * 100).toFixed(0)}%</div>
                        </div>
                        <div class="agreement-votes">${agr.expInitial.positive}⊕ ${agr.expInitial.negative}⊖</div>
                    </div>`;
                }
                if (agr.expFinal.n > 0) {
                    agreementHtml += `
                    <div class="agreement-bar-group">
                        <div class="agreement-label">Exp Final <span class="agreement-n">(n=${agr.expFinal.n})</span></div>
                        <div class="agreement-bar-row">
                            <div class="agreement-bar-bg">
                                <div class="agreement-fill ${agreeClass(agr.expFinal.rate)}" style="width: ${(agr.expFinal.rate * 100).toFixed(0)}%"></div>
                            </div>
                            <div class="agreement-val">${(agr.expFinal.rate * 100).toFixed(0)}%</div>
                        </div>
                        <div class="agreement-votes">${agr.expFinal.positive}⊕ ${agr.expFinal.negative}⊖</div>
                    </div>`;
                }
            }

            // Determine displayed accuracy heading
            let headingAcc;
            if (gf === 'control') headingAcc = stats.control.acc;
            else if (gf === 'experimental') headingAcc = stats.expFinal.acc;
            else headingAcc = stats.all.acc;

            return `
                <div class="image-card">
                    <div class="image-top-bar">
                        <div class="image-name-label">${img.originalName}</div>
                        <div class="kl-pill grade${img.klGrade}">KL ${img.klGrade}</div>
                    </div>
                    <div class="image-preview">
                        <img src="${imagePath}" alt="${img.name}" loading="lazy">
                    </div>
                    <div class="image-stats">
                        <div class="ai-info-row ${aiClass}">
                            <span class="ai-label">AI:</span>
                            <span class="ai-value">${aiPredText}</span>
                            <span class="ai-conf">(${aiConfPercent})</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Accuracy</span>
                            <span class="stat-val heading">${headingAcc.toFixed(0)}%</span>
                        </div>
                        <div class="correctness-breakdown">
                            ${correctnessBarsHtml}
                        </div>

                        <div class="agreement-section">
                            <div class="agreement-header">Annotator Agreement</div>
                            ${agreementHtml}
                            ${(gf === 'all' || gf === 'experimental') ? aiShiftHtml : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => App.init());
