# Medical Imaging Annotation Study — New Analysis Pipeline

This project contains a rigorous, publication-ready analysis pipeline for the knee X-ray osteoarthritis annotation study. It focus on the impact of label noise revealed by a platinum standard radiologist consensus.

## Study Context
The study examines how high school students annotate knee X-rays under two conditions (AI assistance vs. No AI) and how the quality of the ground truth labels affects performance metrics. 

### Key Findings
The original ground truth (OAI repository) contains systematic, directionally biased noise, particularly in the negative class. This pipeline quantifies that noise and its downstream effects on AI evaluation and human psychometric predictors.

## Project Structure
- `helpers.py`: Core data loading, cleaning, joining, and metric derivation logic.
- `NB0_data_quality.ipynb`: Pipeline validation and radiologist inter-rater reliability.
- `NB1_ground_truth_comparison.ipynb`: Metric shifts (Accuracy Paradox) between Original and Platinum GT.
- `NB2_annotation_experiment.ipynb`: Core experimental results using mixed-effects models.
- `NB3_psychometrics.ipynb`: Personality (Big Five) and IQ as predictors of performance/reliance.
- `NB4_integrated_models.ipynb`: Unified predictive models and mediation analysis.
- `NB5_figures.ipynb`: Centralized generation of all publication-quality figures.
- `data/`: Contains `participants.csv` and `Radiologist_Ground_Truth.csv`.
- `figures/`: Output directory for generated visualizations.

## KL1 Handling Strategies
The pipeline supports three toggleable strategies for handling borderline (KL1) cases:
1. **Strategy A (Exclusion)**: Remove KL1 images (Primary).
2. **Strategy B (Clinical)**: Map KL1 → 0 (Healthy).
3. **Strategy C (Sensitivity)**: Treat KL1 as a separate class or bound.

## Environment Setup
Run the following to set up the environment and local kernel:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m ipykernel install --user --name percotate-new-analysis --display-name "Python (PerCoTate New Analysis)"
```
When opening notebooks, ensure you select the **"Python (PerCoTate New Analysis)"** kernel.
