import pandas as pd
from helpers import load_and_clean, derive_variables

df = load_and_clean()
df = derive_variables(df)

ai_trials = df[df['ai_shown'] == True]

print("Mean AI Confidence when AI is wrong:", ai_trials[ai_trials['ai_correct'] == False]['ai_confidence'].mean())
print("Mean AI Confidence when AI is correct:", ai_trials[ai_trials['ai_correct'] == True]['ai_confidence'].mean())

ai_wrong_high_conf = len(ai_trials[(ai_trials['ai_correct'] == False) & (ai_trials['ai_confidence'] > 0.9)])
print("Trials where AI is WRONG but Confidence > 90%:", ai_wrong_high_conf)

