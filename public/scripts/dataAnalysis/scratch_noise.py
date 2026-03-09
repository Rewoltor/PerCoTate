import pandas as pd
import numpy as np
from helpers import load_and_clean, derive_variables

df = load_and_clean()
df = derive_variables(df)

# We want cases where both AI and annotators disagree with the ground truth.
# First, let's see how many unique images there are.
print("Total unique images:", df['trial_original_image_name'].nunique())

# For each image, let's compute:
# 1. The ground truth (should be constant per image, but let's check)
# 2. AI prediction (should be constant per image)
# 3. Human consensus (what did the majority of humans guess?)

# Let's group by trial_original_image_name
image_stats = df.groupby('trial_original_image_name').agg(
    ground_truth=('ground_truth_binary', 'first'),
    ai_pred=('ai_prediction', 'first'),
    num_trials=('participant_id', 'count'),
    human_pred_1_count=('user_decision', lambda x: sum(x == 1)),
    human_pred_0_count=('user_decision', lambda x: sum(x == 0))
).reset_index()

# Calculate human consensus
image_stats['human_consensus'] = np.where(
    image_stats['human_pred_1_count'] > image_stats['human_pred_0_count'], 1.0, 0.0
)
image_stats['human_consensus_ratio'] = np.maximum(image_stats['human_pred_1_count'], image_stats['human_pred_0_count']) / image_stats['num_trials']

# Label noise candidate: AI disagrees with GT AND Human Consensus disagrees with GT
# Which means AI == Human Consensus AND AI != GT
suspicious = image_stats[(image_stats['ai_pred'] == image_stats['human_consensus']) & 
                         (image_stats['ai_pred'] != image_stats['ground_truth'])]

print(f"Found {len(suspicious)} suspicious images out of {len(image_stats)}.")
suspicious = suspicious.sort_values('human_consensus_ratio', ascending=False)
print("Top suspicious images:")
print(suspicious[['trial_original_image_name', 'ground_truth', 'ai_pred', 'human_consensus', 'human_consensus_ratio']].head(20))

suspicious.to_csv('suspicious_images.csv', index=False)

