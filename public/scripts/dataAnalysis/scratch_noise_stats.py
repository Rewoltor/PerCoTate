import pandas as pd
import numpy as np
from scipy import stats
from helpers import load_and_clean, derive_variables

df = load_and_clean()
df = derive_variables(df)

# Group by image
image_stats = df.groupby('trial_original_image_name').agg(
    ground_truth=('ground_truth_binary', 'first'),
    ai_pred=('ai_prediction', 'first'),
    total_votes=('participant_id', 'count')
).reset_index()

# Get the count of votes matching the AI prediction (which we suspect is the True label if GT is noise)
# Wait, let's just count votes that DISAGREE with the ground truth
def count_disagreements(image_name):
    trials = df[df['trial_original_image_name'] == image_name]
    gt = trials['ground_truth_binary'].iloc[0]
    disagreements = sum(trials['user_decision'] != gt)
    return disagreements

image_stats['disagree_votes'] = image_stats['trial_original_image_name'].apply(count_disagreements)
image_stats['disagree_ratio'] = image_stats['disagree_votes'] / image_stats['total_votes']

# Mathematical test: Binomial test
# Null hypothesis: The probability of disagreeing with ground truth is <= 0.5. 
# If they disagree significantly > 50% of the time, the ground truth is likely wrong.
def calculate_p_value(row):
    # binomtest(k, n, p) where k=successes (disagreements), n=trials, p=0.5
    res = stats.binomtest(row['disagree_votes'], row['total_votes'], p=0.5, alternative='greater')
    return res.pvalue

image_stats['p_value'] = image_stats.apply(calculate_p_value, axis=1)

# Flag as noise if AI also disagrees with GT AND p_value < 0.05
# Let's apply Bonferroni correction for 50 images: alpha = 0.05 / 50 = 0.001
alpha = 0.05
image_stats['is_noise_candidate'] = (image_stats['ai_pred'] != image_stats['ground_truth']) & (image_stats['p_value'] < alpha)

noise_candidates = image_stats[image_stats['is_noise_candidate']].sort_values('p_value')
print(noise_candidates)

