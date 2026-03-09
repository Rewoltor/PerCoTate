import json

with open('NB3_temporal_dynamics.ipynb', 'r') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = ''.join(cell.get('source', []))
        if 'Carry-Over Effects by Treatment Group' in source and 't, p = stats.ttest_rel(subset' in source:
            new_source = """# Carry-over: compare Phase 1 vs Phase 2 performance by treatment group
ps = get_participant_summary(df)
ps_comp = ps[ps['is_completer']].copy()

# Phase 1 vs Phase 2 accuracy per treatment group
phase_data = completers.groupby(['participant_id', 'phase', 'treatment_group'])['user_correct'].mean().reset_index()
phase_pivot = phase_data.pivot_table(index=['participant_id', 'treatment_group'], 
                                      columns='phase', values='user_correct').reset_index()

fig, axes = plt.subplots(1, 2, figsize=(14, 6))
output_text = []

for idx, (tg, label) in enumerate([('0', 'TG0: Control → AI'), ('1', 'TG1: AI → Control')]):
    subset = phase_pivot[phase_pivot['treatment_group'] == tg]
    for _, row in subset.iterrows():
        axes[idx].plot([0, 1], [row['Phase 1'], row['Phase 2']], 'o-', 
                      alpha=0.3, color='gray', markersize=4)
    axes[idx].plot([0, 1], [subset['Phase 1'].mean(), subset['Phase 2'].mean()],
                 'o-', color='red', linewidth=3, markersize=10, label='Mean', zorder=5)
    axes[idx].set_xticks([0, 1])
    
    # Label with condition
    if tg == '0':
        axes[idx].set_xticklabels(['Phase 1\\n(Control)', 'Phase 2\\n(AI-Assisted)'])
    else:
        axes[idx].set_xticklabels(['Phase 1\\n(AI-Assisted)', 'Phase 2\\n(Control)'])
    
    axes[idx].set_ylabel('Accuracy')
    axes[idx].set_title(label)
    axes[idx].legend()
    axes[idx].set_ylim(0.3, 0.9)
    
    # Test phase difference
    t, p = stats.ttest_rel(subset['Phase 2'], subset['Phase 1'])
    axes[idx].text(0.5, 0.35, f'Paired t: p={p:.3f}', ha='center', fontsize=10,
                 bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    output_text.append(f'=== {label} ===\\nPhase 1 Mean Accuracy: {subset["Phase 1"].mean():.4f}\\nPhase 2 Mean Accuracy: {subset["Phase 2"].mean():.4f}\\nPaired t-test: t={t:.4f}, p={p:.4f}\\n')

plt.suptitle('Carry-Over Effects by Treatment Group', fontsize=14)
plt.tight_layout()
plt.show()

for text in output_text:
    print(text)
"""
            # To ensure it splits cleanly back into lines with \n
            cell['source'] = [line + '\n' for line in new_source.split('\n')]
            # removing trailing \n on last element if necessary
            cell['source'][-1] = cell['source'][-1].strip('\n')

with open('NB3_temporal_dynamics.ipynb', 'w') as f:
    json.dump(nb, f, indent=1)

print("success")
