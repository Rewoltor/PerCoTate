import nbformat
import sys

nb_path = '/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/NB4_psychometrics.ipynb'
try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
except Exception as e:
    print(f"Error reading notebook: {e}")
    sys.exit(1)

# 1. Update Cell 5 (IQ continuous predictor)
cell5_source = """# IQ score as continuous predictor (for IQ>0 group)
iq_positive = ps_psycho[ps_psycho['iq_score'] > 0].copy()

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# IQ vs accuracy (IQ>0 only)
axes[0].scatter(iq_positive['iq_score'], iq_positive['overall_accuracy'],
              alpha=0.6, color=COLORS['neutral'], edgecolor='black', s=80)
r1, p1 = stats.spearmanr(iq_positive['iq_score'], iq_positive['overall_accuracy'])
axes[0].set_title(f'IQ vs Accuracy (IQ>0 only, n={len(iq_positive)})\\nSpearman r={r1:.3f}, p={p1:.3f}')
axes[0].set_xlabel('IQ Score')
axes[0].set_ylabel('Overall Accuracy')

# IQ time remaining as motivation proxy
ps_psycho['iq_time_remaining'] = df.groupby('participant_id')['iq_time_remaining'].first().reindex(ps_psycho['participant_id']).values
axes[1].scatter(ps_psycho['iq_time_remaining'], ps_psycho['iq_score'],
              alpha=0.6, color=COLORS['neutral'], edgecolor='black', s=80)
r2, p2 = stats.spearmanr(ps_psycho['iq_time_remaining'], ps_psycho['iq_score'])
axes[1].set_title(f'IQ Time Remaining vs IQ Score\\nSpearman r={r2:.3f}, p={p2:.3f}')
axes[1].set_xlabel('Time Remaining (ms)')
axes[1].set_ylabel('IQ Score')

plt.tight_layout()
plt.show()

print('=== Statistical Tests: IQ Score as Continuous Predictor ===')
print(f'1. IQ vs Accuracy (IQ>0): Spearman r={r1:.3f}, p={p1:.3f}')
print(f'2. IQ Time Remaining vs IQ Score: Spearman r={r2:.3f}, p={p2:.3f}')

import statsmodels.api as sm
X = sm.add_constant(iq_positive['iq_score'])
model_iq = sm.OLS(iq_positive['overall_accuracy'], X).fit()
print('\\n=== OLS Regression: Overall Accuracy ~ IQ Score (IQ>0) ===')
print(model_iq.summary2().tables[1].round(4))
"""
nb.cells[5].source = cell5_source


# 2. Update Cell 7 (Significant correlations print)
cell7_source = nb.cells[7].source
# replace the print logic
cell7_source_new = cell7_source.split('# Highlight significant correlations')[0] + """# Highlight significant correlations
print('\\n=== Highlight: Significant & Marginal Correlations (p < 0.1) ===')
sig_corrs = corr_df[corr_df['p'] < 0.1]
if len(sig_corrs) > 0:
    for _, row in sig_corrs.iterrows():
        marker = '**' if row['p'] < 0.01 else ('*' if row['p'] < 0.05 else '†')
        print(f'  {row["Big5 Trait"]} x {row["Performance Metric"]}: r={row["r"]:.3f}, p={row["p"]:.4f} {marker}')
else:
    print('\\nNo significant correlations at p < 0.1')
"""
nb.cells[7].source = cell7_source_new


# 3. Update Cell 10 (Neuroticism & Stability prints)
cell10_source = """# Calculate per-participant performance drop: first half vs second half accuracy
# Using trial-level data
df_psycho = df[df['has_psychometrics']].copy()
df_psycho['within_phase_trial'] = ((df_psycho['trial_order'] - 1) % 50) + 1
df_psycho['half'] = df_psycho['within_phase_trial'].apply(lambda x: 'First' if x <= 25 else 'Second')

perf_stability = df_psycho.groupby(['participant_id', 'half'])['user_correct'].mean().unstack()
perf_stability['drop'] = perf_stability['First'] - perf_stability['Second']
perf_stability = perf_stability.reset_index()

# Merge with Big 5
perf_stability = perf_stability.merge(
    ps_psycho[['participant_id', 'big5_neuroticism', 'big5_conscientiousness', 'iq_score']],
    on='participant_id'
)

fig, axes = plt.subplots(1, 3, figsize=(18, 6))

# Neuroticism vs accuracy drop
axes[0].scatter(perf_stability['big5_neuroticism'], perf_stability['drop'],
              alpha=0.6, color=COLORS['over_reliance'], edgecolor='black', s=80)
r_drop, p_drop = stats.spearmanr(perf_stability['big5_neuroticism'], perf_stability['drop'])
axes[0].set_title(f'Neuroticism vs Performance Drop\\n(r={r_drop:.3f}, p={p_drop:.3f})')
axes[0].set_xlabel('Neuroticism Score')
axes[0].set_ylabel('Accuracy Drop (First half - Second half)')
axes[0].axhline(y=0, color='gray', linestyle='--', alpha=0.5)

# Conscientiousness vs mean duration
axes[1].scatter(ps_psycho['big5_conscientiousness'], ps_psycho['overall_mean_duration'],
              alpha=0.6, color=COLORS['correct'], edgecolor='black', s=80)
r_dur, p_dur = stats.spearmanr(ps_psycho['big5_conscientiousness'], ps_psycho['overall_mean_duration'])
axes[1].set_title(f'Conscientiousness vs Trial Duration\\n(r={r_dur:.3f}, p={p_dur:.3f})')
axes[1].set_xlabel('Conscientiousness Score')
axes[1].set_ylabel('Mean Trial Duration (s)')

# Neuroticism vs over-reliance
valid = ps_psycho[ps_psycho['over_reliance_rate'].notna()]
axes[2].scatter(valid['big5_neuroticism'], valid['over_reliance_rate'],
              alpha=0.6, color=COLORS['over_reliance'], edgecolor='black', s=80)
r_or, p_or = stats.spearmanr(valid['big5_neuroticism'], valid['over_reliance_rate'])
axes[2].set_title(f'Neuroticism vs Over-reliance\\n(r={r_or:.3f}, p={p_or:.3f})')
axes[2].set_xlabel('Neuroticism Score')
axes[2].set_ylabel('Over-reliance Rate')

plt.tight_layout()
plt.show()

print('=== Statistical Tests: Personality & Stability ===')
print(f'1. Neuroticism vs Accuracy Drop: Spearman r={r_drop:.3f}, p={p_drop:.3f}')
print(f'2. Conscientiousness vs Trial Duration: Spearman r={r_dur:.3f}, p={p_dur:.3f}')
print(f'3. Neuroticism vs Over-reliance: Spearman r={r_or:.3f}, p={p_or:.3f}')
"""
nb.cells[10].source = cell10_source


# 4. Update Cell 15 (Error fix)
cell15_source = """# Visualization: regression coefficients
fig, ax = plt.subplots(figsize=(10, 6))

coefs = model.params.drop('const')
ci = model.conf_int().drop('const')
errors = np.abs(ci.values - coefs.values[:, None]).T

colors = ['red' if p < 0.05 else 'gray' for p in model.pvalues.drop('const')]

y_pos = range(len(coefs))
ax.barh(y_pos, coefs.values, xerr=errors, color=colors, alpha=0.7,
       capsize=3, edgecolor='black', linewidth=0.5)
ax.set_yticks(y_pos)
ax.set_yticklabels([c.replace('big5_', '').capitalize() for c in coefs.index])
ax.axvline(x=0, color='black', linewidth=0.5)
ax.set_xlabel('Coefficient (with 95% CI)')
ax.set_title(f'Regression Coefficients (R²={model.rsquared:.3f})\\nRed = p<.05, Gray = n.s.')

plt.tight_layout()
plt.show()
"""
nb.cells[15].source = cell15_source

with open(nb_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)
print("Successfully modified NB4_psychometrics.ipynb!")
