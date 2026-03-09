import pandas as pd
from helpers import load_and_clean

df = load_and_clean()

# The user mentioned trial_id ends with the actual completed order.
# Examples: 'trial_1', 'p2_trial_50'
def extract_true_order(tid):
    if pd.isna(tid):
        return -1
    # Split by '_' and get the last part which should be a number
    parts = str(tid).split('_')
    try:
        return int(parts[-1])
    except ValueError:
        return -1

df['true_order_from_id'] = df['trial_id'].apply(extract_true_order)
df['derived_phase_trial'] = ((df['trial_order'] - 1) % 50) + 1

# Let's count how many match
matches = df['true_order_from_id'] == df['derived_phase_trial']
match_count = matches.sum()
total = len(df)

print(f"Total rows: {total}")
print(f"Matches between trial_end_time sort and trial_id suffix: {match_count}")
print(f"Mismatches: {total - match_count}")

if total - match_count > 0:
    print("\nSample mismatches:")
    mismatch_df = df[~matches][['participant_id', 'trial_id', 'trial_end_time', 'derived_phase_trial', 'true_order_from_id']].head(20)
    print(mismatch_df)
