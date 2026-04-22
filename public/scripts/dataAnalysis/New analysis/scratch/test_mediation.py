import pandas as pd
import numpy as np
import pingouin as pg
import helpers

# 1. Load Data
KL1_STRATEGY = 'exclude' 
df = helpers.load_data(KL1_STRATEGY)

df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)

print("--- Mediation: AI Feedback -> Confidence -> Accuracy ---")
df_med = df.dropna(subset=['final_confidence', 'human_correct_plat_int', 'condition']).copy()
df_med['condition_num'] = (df_med['condition'] == 'ai').astype(int)

try:
    # Try without logistic argument
    med = pg.mediation_analysis(data=df_med, x='condition_num', m='final_confidence', y='human_correct_plat_int', seed=42)
    print("Mediation Summary (auto):")
    print(med)
except Exception as e:
    print(f"Error without logistic: {e}")

try:
    # Try with logistic argument just to be sure if I missed something
    med = pg.mediation_analysis(data=df_med, x='condition_num', m='final_confidence', y='human_correct_plat_int', logistic=True, seed=42)
    print("Mediation Summary (with logistic=True):")
    print(med)
except Exception as e:
    print(f"Error with logistic=True: {e}")
