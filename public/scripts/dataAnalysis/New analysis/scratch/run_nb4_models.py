import pandas as pd
import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf
import pingouin as pg
import helpers
import sys
import os

# Ensure we can import helpers
sys.path.append(os.getcwd())

# 1. Load Data
KL1_STRATEGY = 'exclude' 
df = helpers.load_data(KL1_STRATEGY)
df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)

print("--- GEE Model Comparisons ---")

# M1: Condition Only
m1 = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai'))", 
             groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()

# M2: Condition + Key Traits
m2 = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai')) + big5_conscientiousness + iq_score + big5_neuroticism", 
             groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()

# M3: Full model (With Interaction)
m3 = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai')) * iq_score + big5_conscientiousness", 
             groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()

print("M1 QIC:", m1.qic())
print("M2 QIC:", m2.qic())
print("M3 QIC:", m3.qic())

print("\n--- Best Performing Model (M2) Summary ---")
print(m2.summary())

print("\n--- Mediation: AI Feedback -> Confidence -> Accuracy ---")
df_med = df.dropna(subset=['final_confidence', 'human_correct_plat_int', 'condition']).copy()
df_med['condition_num'] = (df_med['condition'] == 'ai').astype(int)

# Removed logistic=True as it's unsupported in Pingouin 0.5.4
med = pg.mediation_analysis(data=df_med, x='condition_num', m='final_confidence', y='human_correct_plat_int', seed=42)
print("Mediation Summary:")
print(med)
