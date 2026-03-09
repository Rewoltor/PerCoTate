import pandas as pd
from helpers import load_and_clean, derive_variables

df = load_and_clean()
df = derive_variables(df)

ai_trials = df[df['ai_shown'] == True]
ai_kl = ai_trials.groupby('kl_severity')['ai_correct'].agg(['mean', 'count'])
print(ai_kl)

