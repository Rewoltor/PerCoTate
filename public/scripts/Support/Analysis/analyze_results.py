import sys
import os
import glob
import subprocess

#Here is the line to run it:
# "/Users/martonbaltay/Documents/FeelGoodAI/Code/Supporting scripts/.venv/bin/python" "/Users/martonbaltay/Documents/FeelGoodAI/Code/Supporting scripts/Analysis/analyze_results.py"

# If `pandas` is not available in the current interpreter, try to re-run
# this script using the project's local venv Python (./.venv/bin/python).
try:
    import pandas as pd
except Exception:
    # Determine script and project locations
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))

    # Candidate venv python paths (common locations relative to the project)
    venv_candidates = [
        os.path.join(project_root, '.venv', 'bin', 'python'),
        os.path.join(project_root, '..', '.venv', 'bin', 'python'),
        os.path.join(script_dir, '.venv', 'bin', 'python'),
    ]

    venv_python = None
    for p in venv_candidates:
        if os.path.exists(p):
            venv_python = p
            break

    if venv_python and os.path.abspath(sys.executable) != os.path.abspath(venv_python):
        print("`pandas` not found in this Python. Re-running with:", venv_python)
        os.execv(venv_python, [venv_python, os.path.abspath(__file__)] + sys.argv[1:])

    # No usable venv found or already running inside it
    print("Error: `pandas` is not installed in this Python environment.")
    print("Activate the project's venv or run using the venv python:")
    print(f'  source "{project_root}/.venv/bin/activate"')
    print(f'  "{project_root}/.venv/bin/python" {os.path.abspath(__file__)}')
    sys.exit(1)

import statsmodels.formula.api as smf
import numpy as np

# ==========================================
# 1. LOAD & PREP
# ==========================================

# Robust file finding
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
candidates = glob.glob(os.path.join(root_dir, '**', './experiment_data_flat6.csv'), recursive=True)

if not candidates:
    # Fallback for local testing if directory structure differs
    candidates = glob.glob('./experiment_data_flat6.csv')

if not candidates:
    raise FileNotFoundError("No CSV files found. Please ensure './experiment_data_flat6.csv' is in the workspace.")

# Concatenate if multiple found
dfs = [pd.read_csv(p) for p in sorted(candidates)]
df = pd.concat(dfs, ignore_index=True)

# Filter for the Experiment Phase only
df_exp = df[df['phase'] == 'experiment'].copy()

# ---------------------------------------------------------
# THE FIX: DATA TRANSFORMATIONS & CENTERING
# ---------------------------------------------------------

# 1. Create Y (Outcome): Accuracy
df_exp['is_correct'] = (df_exp['user_response'] == df_exp['csv_ground_truth_binary']).astype(int)

# 2. Create X1 (Predictor): Treatment Coded
df_exp['treatment_coded'] = df_exp['treatmentGroup'].map({'control': 0, 'treatment': 1})

# 3. THE CENTER: Breaking Multicollinearity
# We calculate the mean of the cognitive score
mean_iq = df_exp['cognitive_score'].mean()

# We subtract that mean from every score
df_exp['cognitive_score_centered'] = df_exp['cognitive_score'] - mean_iq

print(f"Data Prep Complete.")
print(f"Average Cognitive Score (Center Point): {mean_iq:.2f}")
print(f"Analyzing {len(df_exp)} trials across {df_exp['participant_id'].nunique()} participants.")

# ==========================================
# 2. RUN THE MODEL (The "Centered" Version)
# ==========================================

# We use the centered variable in the formula
model = smf.ols(formula='is_correct ~ treatment_coded * cognitive_score_centered', data=df_exp)
results = model.fit()

# ==========================================
# 3. INTERPRETATION
# ==========================================
print("\n" + "="*50)
print("CENTERED REGRESSION RESULTS")
print("="*50)
print(results.summary())

# Helper to interpret the specific intercept based on the mean
print("\n" + "="*50)
print("INTERPRETATION GUIDE")
print("="*50)
print(f"1. Intercept: The predicted accuracy for a CONTROL user with a score of {mean_iq:.2f}.")
print(f"2. Treatment: The accuracy boost for that same AVERAGE user.")
print(f"3. Interaction: The 'Equalizer' effect (Difference in slopes).")