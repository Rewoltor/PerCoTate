
import sys, os, warnings
import numpy as np
import pandas as pd
from scipy import stats
import pingouin as pg
import statsmodels.api as sm
import statsmodels.formula.api as smf

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)
warnings.filterwarnings('ignore', category=UserWarning)

# Add search path for helpers
sys.path.insert(0, '/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis')
from helpers import (
    load_and_clean, derive_variables, get_participant_summary,
    get_completers, setup_plotting, COLORS, CONDITION_PALETTE
)

# 1. Data Loading & Preparation
df = load_and_clean()
df = derive_variables(df)

# Add within-phase trial for modeling
df['within_phase_trial'] = ((df['trial_order'] - 1) % 50) + 1
df['within_phase_trial_z'] = (df['within_phase_trial'] - 25) / 25  # center & scale

# Numeric condition for modeling
df['is_ai'] = df['ai_shown'].astype(int)

# KL severity as ordered numeric
kl_num_map = {'healthy': 0, 'mild': 1, 'moderate': 2, 'severe': 3}
df['kl_severity_num'] = df['kl_severity'].map(kl_num_map)

print(f'\n--- Data Loaded ---\nTotal trials: {len(df)}, Participants: {df["participant_id"].nunique()}')

# Prepare model data
model_data = df[['user_correct', 'is_ai', 'within_phase_trial_z', 
                 'kl_severity_num', 'participant_id']].dropna()

# 2. Model 1: Base Mixed-Effects
print('\n=== Model 1: Base Mixed-Effects Model ===')
model1 = smf.mixedlm(
    'user_correct ~ is_ai + within_phase_trial_z + kl_severity_num',
    data=model_data,
    groups=model_data['participant_id']
).fit(reml=False)
print(model1.summary())

# 3. Model 2: Condition x Time Interaction
print('\n=== Model 2: With Condition x Time Interaction ===')
model2 = smf.mixedlm(
    'user_correct ~ is_ai * within_phase_trial_z + kl_severity_num',
    data=model_data,
    groups=model_data['participant_id']
).fit(reml=False)
print(model2.summary())

# 4. Model 3: Psychometrics
model3_data = df[df['has_psychometrics']].copy()
model3_data = model3_data[[
    'user_correct', 'is_ai', 'within_phase_trial_z', 'kl_severity_num',
    'participant_id', 'iq_score', 'big5_neuroticism', 'big5_conscientiousness'
]].dropna()

# Center psychometric variables
for col in ['iq_score', 'big5_neuroticism', 'big5_conscientiousness']:
    model3_data[f'{col}_c'] = model3_data[col] - model3_data[col].mean()

print(f'\n=== Model 3: With Psychometrics (n={model3_data["participant_id"].nunique()} participants) ===')
model3 = smf.mixedlm(
    'user_correct ~ is_ai * within_phase_trial_z + kl_severity_num + iq_score_c + big5_neuroticism_c + big5_conscientiousness_c',
    data=model3_data,
    groups=model3_data['participant_id']
).fit(reml=False)
print(model3.summary())

# 5. Mixed Logistic Regression (GLMM) for comparison
print('\n=== Mixed Logistic Regression (GLMM) ===')
glmm_data = model_data.copy()
# Note: BinomialBayesMixedGLM is slow/approximate, using a simpler approach if possible
# but we will stick to the NB5 logic
glmm_model = sm.BinomialBayesMixedGLM.from_formula(
    "user_correct ~ is_ai + within_phase_trial_z + kl_severity_num",
    {"participant": "0 + C(participant_id)"},
    glmm_data
)
glmm_result = glmm_model.fit_vb()
print(glmm_result.summary())

# 6. Mediation Analysis
print('\n=== Mediation Analysis: AI -> Confidence -> Accuracy ===')
med_data = df[['user_correct', 'is_ai', 'user_confidence', 'participant_id']].dropna()

# Path c: AI -> Accuracy
c_val = smf.mixedlm('user_correct ~ is_ai', data=med_data, 
                       groups=med_data['participant_id']).fit(reml=False)
# Path a: AI -> Confidence
a_val = smf.mixedlm('user_confidence ~ is_ai', data=med_data,
                       groups=med_data['participant_id']).fit(reml=False)
# Path c' and b: AI + Confidence -> Accuracy
med_model = smf.mixedlm('user_correct ~ is_ai + user_confidence', data=med_data,
                         groups=med_data['participant_id']).fit(reml=False)

print(f"Path c (AI -> Acc):    beta={c_val.params['is_ai']:.4f}, p={c_val.pvalues['is_ai']:.4f}")
print(f"Path a (AI -> Conf):   beta={a_val.params['is_ai']:.4f}, p={a_val.pvalues['is_ai']:.4f}")
print(f"Path c' (Direct Acc):  beta={med_model.params['is_ai']:.4f}, p={med_model.pvalues['is_ai']:.4f}")
print(f"Path b (Conf -> Acc):  beta={med_model.params['user_confidence']:.4f}, p={med_model.pvalues['user_confidence']:.4f}")

indirect = a_val.params['is_ai'] * med_model.params['user_confidence']
print(f"Indirect effect:       {indirect:.4f}")

# 7. Model Comparison Table
summary = pd.DataFrame({
    'Model': ['M1: Base', 'M2: + Interaction', 'M3: + Psychometrics'],
    'AIC': [model1.aic, model2.aic, model3.aic],
    'BIC': [model1.bic, model2.bic, model3.bic]
})
print('\n=== Model Comparison ===')
print(summary.to_string(index=False))
