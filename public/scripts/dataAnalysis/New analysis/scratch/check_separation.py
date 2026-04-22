import pandas as pd
import helpers

df = helpers.load_data('exclude')
df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)

# Crosstab to check for separation
print("Crosstab: Condition vs Accuracy")
print(pd.crosstab(df['condition'], df['human_correct_plat_int']))

print("\nCrosstab: Difficulty vs Accuracy")
print(pd.crosstab(df['gt_plat_kl'], df['human_correct_plat_int']))

print("\nCrosstab: Condition x Difficulty vs Accuracy")
print(df.groupby(['condition', 'gt_plat_kl'])['human_correct_plat_int'].agg(['mean', 'count']))
