import pandas as pd
import sys
import os
sys.path.insert(0, './New analysis')
from helpers import load_data

df = load_data()

def get_temporal_change(grp, col, first_n=10, last_n=10):
    grp_sorted = grp.sort_values('trial_order')
    first = grp_sorted.head(first_n)[col].mean()
    last = grp_sorted.tail(last_n)[col].mean()
    return last - first

ai_speed = df[df['condition'] == 'ai'].groupby('participant_id').apply(lambda g: get_temporal_change(g, 'trial_duration'), include_groups=False).rename('speedup_ai')
ctrl_speed = df[df['condition'] == 'no_ai'].groupby('participant_id').apply(lambda g: get_temporal_change(g, 'trial_duration'), include_groups=False).rename('speedup_ctrl')

both = pd.concat([ai_speed, ctrl_speed], axis=1).dropna()
print(f'Control speedup: {both["speedup_ctrl"].mean():.2f}s')
print(f'AI speedup:      {both["speedup_ai"].mean():.2f}s')
print(f'Difference:      {both["speedup_ai"].mean() - both["speedup_ctrl"].mean():.2f}s')

from scipy import stats
t, p = stats.ttest_rel(both['speedup_ai'], both['speedup_ctrl'])
print(f'Paired t-test: t={t:.2f}, p={p:.4f}')
