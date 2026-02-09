# MRMC Study Dashboard

A standalone web-based visualization dashboard for the AI-Assisted Medical Annotation Study (Multi-Reader Multi-Case Trial).

## 📊 Overview

This dashboard visualizes Phase 1 results from the knee osteoarthritis annotation study, comparing performance between:
- **Control Group**
- **Experimental Group**

## 🚀 Quick Start

### Running Locally

Navigate to the `public/scripts/` directory and start a local server:

```bash
cd public/scripts
npx serve -p 8888
```

Then open: **http://localhost:8888/dataVisualizer/**

### Data Requirements

The dashboard loads data from:
```
/outputs/csv/export_YYYY.MM.DD_HH:MM_N/participants.csv
```

Update the `DATA_PATH` in `dataLoader.js` if your export folder differs.

---

## 📈 Dashboard Sections

### 1. Executive Summary
- Key metrics: participant counts, accuracy rates, AI impact
- Bar chart comparing Control vs Experimental vs AI Model accuracy

### 2. Hypothesis Testing
| Hypothesis | Description | Status |
|------------|-------------|--------|
| **H1** | AI support increases annotation accuracy 
| **H2** | IQ and Conscientiousness predict baseline accuracy 
| **H3** | AI benefits persist after crossover 

### 3. Fatigue Analysis
- Accuracy by trial block (1-10, 11-20, 21-30, 31-40, 41-50)
- Fatigue drop-off statistics for both groups

### 4. AI Interaction Patterns
- **Over-reliance Rate**: User correct, AI wrong → followed AI anyway
- **Effective Use Rate**: User wrong, AI correct → corrected by AI
- **AI Agreement Rate**: Final decision matches AI prediction
- **Decision Reversal Rate**: Changed decision after seeing AI

### 5. Personality Analysis
- Big Five trait correlations with accuracy
- **Key Finding**: High Neuroticism → Lower fatigue drop-off (r = 0.33)
- Dedicated Neuroticism vs Fatigue scatter plot with regression line

### 6. Time Analysis
- Average response time comparison 
- Time vs Accuracy scatter plot with linear regression line

### 7. KL Grade Analysis
- Accuracy breakdown by Kellgren-Lawrence severity grade (0, 2, 3, 4)

---

## 📁 File Structure

```
dataVisualizer/
├── index.html          # Main HTML structure
├── styles.css          # Premium dark theme with glassmorphism
├── dataLoader.js       # CSV parsing and data processing
├── statistics.js       # Statistical functions (t-test, correlation, regression)
├── charts.js           # Chart.js visualizations
├── app.js              # Main application logic
└── README.md           # This file
```

---

## 🔧 Technical Details

### Dependencies (loaded via CDN)
- **Chart.js 4.4.1** - Interactive charts and visualizations
- **PapaParse 5.4.1** - CSV parsing

### Data Processing Pipeline

1. **Load CSV** via PapaParse with `download: true`
2. **Process Trials**: Add computed fields (correctness, AI agreement, etc.)
3. **Extract Trial Numbers**: Parse `trial_id` (e.g., "trial_1" → 1)
4. **Group by Participant**: Aggregate metrics per participant
5. **Compute Statistics**: t-tests, correlations, p-values
6. **Render Charts**: Chart.js with custom dark theme

### Key Computed Fields

| Field | Description |
|-------|-------------|
| `isControl` | Treatment group starts with "0" |
| `isExperimental` | Treatment group starts with "1" |
| `isInitialCorrect` | Initial decision matches ground truth |
| `isFinalCorrect` | Final decision matches ground truth |
| `isAICorrect` | AI prediction matches ground truth |
| `changedDecision` | User changed their initial decision |
| `agreesWithAI` | Final decision matches AI prediction |
| `trialBlock` | Block number (1-5) based on trial number |

### Statistical Functions

- `independentTTest()` - Compare group means
- `pearsonCorrelation()` - Correlation coefficient with p-value
- `linearRegression()` - Slope, intercept, R² for trend lines

---

## 🎨 Design Features

- **Dark Theme**: `#0f172a` background with glassmorphism cards
- **Gradient Accents**: Blue (#3b82f6) to Purple (#8b5cf6)
- **Responsive Layout**: Adapts to tablet and mobile screens
- **Smooth Navigation**: Sidebar with scroll-based highlighting

---


## 🔍 Troubleshooting

### Chart shows 0 values
- Verify the `DATA_PATH` in `dataLoader.js` points to your CSV
- Check browser console for 404 errors

### CSV not loading
- Ensure the server is running from `public/scripts/` directory
- The path must be relative to the server root (`/outputs/...`)

### Charts not rendering
- Check browser console for JavaScript errors
- Ensure Chart.js CDN is accessible

---

## 📄 License

Part of the PerCoTate research project.
