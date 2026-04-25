import json
import os

path = '/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/NB2_annotation_experiment.ipynb'

with open(path, 'r') as f:
    nb = json.load(f)

# Define the corrected code cell
new_code_cell_source = [
    "# --- 1. Aggregation Logic ---\n",
    "# Ensure trial_duration and trial_start_time are numeric\n",
    "df['trial_duration'] = pd.to_numeric(df['trial_duration'], errors='coerce')\n",
    "df['trial_start_time'] = pd.to_numeric(df['trial_start_time'], errors='coerce')\n",
    "\n",
    "# CRITICAL: Sort chronologically per participant/session before computing order\n",
    "df = df.sort_values(['participant_id', 'session', 'trial_start_time']).reset_index(drop=True)\n",
    "df['within_phase_trial'] = df.groupby(['participant_id', 'session']).cumcount() + 1\n",
    "\n",
    "# Aggregate to participant level for paired tests\n",
    "ps_dur = df.groupby(['participant_id', 'condition'])['trial_duration'].mean().unstack()\n",
    "ps_sess = df.groupby(['participant_id', 'session'])['trial_duration'].mean().unstack()\n",
    "\n",
    "# --- 2. Global Speedup (Session 2 vs Session 1) ---\n",
    "s1_mean = ps_sess[1].mean()\n",
    "s2_mean = ps_sess[2].mean()\n",
    "overall_speedup = (s1_mean - s2_mean) / s1_mean * 100\n",
    "\n",
    "print(\"--- Global Efficiency Metrics ---\")\n",
    "print(f\"Mean Duration Session 1: {s1_mean:.2f}s\")\n",
    "print(f\"Mean Duration Session 2: {s2_mean:.2f}s\")\n",
    "print(f\"Cohort Speedup (S1 -> S2): {overall_speedup:.2f}%\")\n",
    "\n",
    "# --- 3. AI-Driven Speedup (Condition Contrast) ---\n",
    "ai_mean = ps_dur['ai'].mean()\n",
    "ctrl_mean = ps_dur['no_ai'].mean()\n",
    "ai_efficiency_gain = (ctrl_mean - ai_mean) / ctrl_mean * 100\n",
    "\n",
    "print(f\"\\n--- AI-Driven Efficiency Analysis ---\")\n",
    "print(f\"Mean Duration (Control): {ctrl_mean:.2f}s\")\n",
    "print(f\"Mean Duration (AI-Assisted): {ai_mean:.2f}s\")\n",
    "print(f\"AI Efficiency Gain: {ai_efficiency_gain:.2f}%\")\n",
    "\n",
    "# Paired t-test for condition effect\n",
    "import pingouin as pg\n",
    "t_res = pg.ttest(ps_dur['ai'], ps_dur['no_ai'], paired=True)\n",
    "t_val = t_res['T'].values[0]\n",
    "p_val = t_res['p-val'].values[0]\n",
    "\n",
    "print(f\"Paired t-test (AI vs Control): t={t_val:.3f}, p={p_val:.4f}\")\n",
    "if p_val < 0.05:\n",
    "    print(\"Result: Statistically significant efficiency gain with AI assistance.\")\n",
    "else:\n",
    "    print(\"Result: Efficiency gain is not statistically significant at the participant level.\")\n",
    "\n",
    "# --- 4. Within-Phase Habituation (M3 Logic) ---\n",
    "def get_temporal_change(grp, col='trial_duration', n=10):\n",
    "    # Now that df is sorted, head/tail correctly represent early/late\n",
    "    first = grp.head(n)[col].mean()\n",
    "    last = grp.tail(n)[col].mean()\n",
    "    return last - first\n",
    "\n",
    "speedup_rates = df.groupby(['participant_id', 'condition']).apply(\n",
    "    lambda g: get_temporal_change(g)\n",
    ").unstack()\n",
    "\n",
    "print(f\"\\n--- Habituation (Early vs Late Trials) ---\")\n",
    "print(f\"AI Speedup Rate: {speedup_rates['ai'].mean():.2f}s improvement\")\n",
    "print(f\"Control Speedup Rate: {speedup_rates['no_ai'].mean():.2f}s improvement\")\n",
    "\n",
    "# --- 5. Visualization ---\n",
    "plt.figure(figsize=(10, 5))\n",
    "sns.lineplot(data=df, x='within_phase_trial', y='trial_duration', hue='condition', \n",
    "             palette=helpers.CONDITION_PALETTE, alpha=0.8)\n",
    "plt.title(\"Habitutation Curve: Trial Duration Over Phase Progression\")\n",
    "plt.xlabel(\"Trial Number (within phase)\")\n",
    "plt.ylabel(\"Duration (seconds)\")\n",
    "plt.ylim(0, 40) # Focus on the typical range\n",
    "plt.legend(title=\"Condition\")\n",
    "plt.show()"
]

# Find where the Section 5 code cell is (it has "restored_code_5" id from my previous script)
for cell in nb['cells']:
    if cell['id'] == 'restored_code_5':
        cell['source'] = new_code_cell_source
        break

with open(path, 'w') as f:
    json.dump(nb, f, indent=1)

print("Successfully fixed chronological sorting in NB2 Section 5.")
