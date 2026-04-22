import pandas as pd
import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf
import helpers
import sys
import os

sys.path.append(os.getcwd())

# 1. Load Data
KL1_STRATEGY = 'exclude' 
df = helpers.load_data(KL1_STRATEGY)
df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)

print("--- Investigating GEE NaN p-values ---")
print("Value counts for gt_plat_kl:")
print(df['gt_plat_kl'].value_counts())

print("\nRunning GEE with Difficulty interaction...")
try:
    m_diff = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai')) * gt_plat_kl", 
                     groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()
    print(m_diff.summary())
except Exception as e:
    print(f"Error: {e}")

# Try standardizing gt_plat_kl
df['gt_plat_kl_z'] = (df['gt_plat_kl'] - df['gt_plat_kl'].mean()) / df['gt_plat_kl'].std()
print("\nRunning GEE with Standardized Difficulty interaction...")
try:
    m_diff_z = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai')) * gt_plat_kl_z", 
                       groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()
    print(m_diff_z.summary())
except Exception as e:
    print(f"Error: {e}")
