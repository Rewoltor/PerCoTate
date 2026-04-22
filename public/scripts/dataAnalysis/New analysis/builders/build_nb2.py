import nbformat
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell

nb = new_notebook()

cells = []

cells.append(new_markdown_cell("""# NB2: Core Annotation Experiment
- **Question:** Does AI assistance improve annotation accuracy, and how do users rely on it?
- **Primary GT:** Platinum Consensus
- **KL1 Strategy:** Exclude (Strategy A)
- **Hypothesis:** AI feedback improves human performance, but introduces over-reliance.
"""))

cells.append(new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
import statsmodels.formula.api as smf
from scipy import stats
from sklearn.metrics import brier_score_loss
import pingouin as pg
import warnings
import sys, os; sys.path.append(os.path.abspath(".")); sys.path.append(os.path.abspath("..")); import helpers

warnings.filterwarnings("ignore")

# 1. Load Data
KL1_STRATEGY = 'exclude' 
df = helpers.load_data(KL1_STRATEGY)
df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)
df_part = helpers.participant_summary(df)
df_img = helpers.image_summary(df)

print(f"Setup Complete: Data loaded using '{KL1_STRATEGY}' strategy.")
"""))

cells.append(new_markdown_cell("""## Section 1: Primary Accuracy Analysis
Note: While the original specification requested a mixed-effects logistic regression `(1|participant_id) + (1|trial_image)`, Python's `statsmodels` struggles with crossed random effects in logistic regression. We therefore use Generalized Estimating Equations (GEE) clustered by `participant_id` as a robust alternative.
"""))
cells.append(new_code_cell("""print("--- Primary Accuracy Analysis ---")
print("Overall Accuracy by Condition:")
acc_by_cond = df.groupby('condition')['human_correct_plat'].mean()
print(acc_by_cond)
print(f"\\nAI Boost (Signed Difference): {acc_by_cond['ai'] - acc_by_cond['no_ai']:.3f}")

print("\\n--- GEE Model: Accuracy ~ Condition ---")
model = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai'))", 
                groups=df["participant_id"], 
                data=df, family=sm.families.Binomial())
result = model.fit()

# Extract OR, CI, p-value
summary_df = pd.DataFrame({
    'Odds Ratio': np.exp(result.params),
    'Lower 95% CI': np.exp(result.conf_int()[0]),
    'Upper 95% CI': np.exp(result.conf_int()[1]),
    'p-value': result.pvalues
})
print(summary_df.round(3))

print("\\n--- Participant-Level Effect Size (Cohen's d) ---")
# Cohen's d on paired data (accuracy per participant in AI vs no-AI)
ai_accs = df_part['accuracy_ai_condition'].dropna()
noai_accs = df_part['accuracy_noai_condition'].dropna()
# Not all participants did both, but most did. Let's do a strict paired subset.
paired = df_part.dropna(subset=['accuracy_ai_condition', 'accuracy_noai_condition'])
d = pg.compute_effsize(paired['accuracy_ai_condition'], paired['accuracy_noai_condition'], eftype='cohen', paired=True)
print(f"Cohen's d (AI vs No-AI): {d:.3f}")

print("\\n--- Repeated Measures ANOVA on Participant Accuracy ---")
# Melt for ANOVA
melted = paired.melt(id_vars=['participant_id'], value_vars=['accuracy_ai_condition', 'accuracy_noai_condition'], var_name='condition', value_name='accuracy')
aov = pg.rm_anova(data=melted, dv='accuracy', within='condition', subject='participant_id')
print(aov)
"""))

cells.append(new_markdown_cell("""## Section 2: MRMC Design Analysis"""))
cells.append(new_code_cell("""print("--- MRMC Design Analysis ---")
model_mrmc = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai')) * C(session) + C(treatment_group)", 
                     groups=df["participant_id"], data=df, family=sm.families.Binomial())
result_mrmc = model_mrmc.fit()
print(result_mrmc.summary().tables[1])

print("\\nInterpretation: Look at the condition:session interaction term to assess order effects (carryover).")
"""))

cells.append(new_markdown_cell("""## Section 3: Human-AI Reliance Analysis"""))
cells.append(new_code_cell("""print("--- Human-AI Reliance Analysis ---")
rel_cols = ['over_reliance', 'appropriate_skepticism', 'appropriate_reliance', 'unwarranted_skepticism']

rel_means = []
for c in rel_cols:
    val = df[df['condition']=='ai'][c].mean()
    rel_means.append({'Metric': c, 'Mean Rate': val})
print(pd.DataFrame(rel_means).to_markdown(index=False, floatfmt=".3f"))

# Stacked Bar Chart of Reliance Taxonomy
ai_df = df[df['condition'] == 'ai']
rel_rates = ai_df.groupby('participant_id')[rel_cols].mean()
rel_rates['sum'] = rel_rates.sum(axis=1)
rel_rates = rel_rates.sort_values('over_reliance', ascending=False)

rel_rates[rel_cols].plot(kind='bar', stacked=True, figsize=(12, 6), colormap='RdYlBu')
plt.title("Reliance Taxonomy by Participant (Sorted by Over-Reliance)")
plt.ylabel("Fraction of AI Trials")
plt.xlabel("Participant ID")
plt.xticks(rotation=90, fontsize=8)
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.show()

print("\\n--- AI Influence on Accuracy per Image ---")
img_acc_pre = ai_df.groupby(['trial_image_name', 'ai_correct_plat'])['human_initial_correct_plat'].mean().reset_index()
img_acc_post = ai_df.groupby(['trial_image_name', 'ai_correct_plat'])['human_correct_plat'].mean().reset_index()

img_infl = pd.merge(img_acc_pre, img_acc_post, on=['trial_image_name', 'ai_correct_plat'])
img_infl['delta'] = img_infl['human_correct_plat'] - img_infl['human_initial_correct_plat']

plt.figure(figsize=(10,6))
sns.scatterplot(data=img_infl, x='human_initial_correct_plat', y='human_correct_plat', hue='ai_correct_plat', s=100)
plt.plot([0, 1], [0, 1], 'k--', alpha=0.5)
plt.title("AI Influence: Pre-AI vs Post-AI Accuracy per Image")
plt.xlabel("Initial Human Accuracy (Before AI)")
plt.ylabel("Final Human Accuracy (After AI)")
plt.show()
"""))

cells.append(new_markdown_cell("""## Section 4: Confidence Analysis"""))
cells.append(new_code_cell("""print("--- Confidence Analysis ---")
calib = df.groupby(['condition', 'final_confidence'])['human_correct_plat'].mean().reset_index()

plt.figure(figsize=(8,5))
sns.lineplot(data=calib, x='final_confidence', y='human_correct_plat', hue='condition', marker='o')
plt.plot([1, 7], [1/7, 1], 'k--', alpha=0.3, label='Perfect Calibration (approx)')
plt.title("Confidence Calibration Curve")
plt.xlabel("Reported Final Confidence (1-7)")
plt.ylabel("Actual Accuracy (Platinum GT)")
plt.show()

ai_only = df[df['condition'] == 'ai'].dropna(subset=['initial_confidence', 'final_confidence'])
t_res = stats.ttest_rel(ai_only['initial_confidence'], ai_only['final_confidence'])
print(f"Paired t-test on Initial vs Final Confidence (AI cond): t={t_res.statistic:.3f}, p={t_res.pvalue:.4f}")
print(f"Mean Initial: {ai_only['initial_confidence'].mean():.3f}, Mean Final: {ai_only['final_confidence'].mean():.3f}")

print("\\nConfidence change by AI Correctness:")
ai_only['conf_change'] = ai_only['final_confidence'] - ai_only['initial_confidence']
print(ai_only.groupby('ai_correct_plat')['conf_change'].mean())

# Brier Score (requires probabilities [0,1], mapping 1-7 to 0-1 range roughly, or using actual GT)
# Map confidence to prob of class 1: if decision is 1, prob = conf/7. If 0, prob = 1 - (conf/7)
df['prob_1'] = df.apply(lambda x: x['final_confidence']/7.0 if x['final_decision'] == 1 else 1 - (x['final_confidence']/7.0), axis=1)
# Brier score only works strictly on valid prob predictions.
valid = df.dropna(subset=['prob_1'])
brier = brier_score_loss(valid['gt_plat_binary'], valid['prob_1'])
print(f"\\nOverall Brier Score (Platinum GT): {brier:.3f}")
"""))

cells.append(new_markdown_cell("""## Section 5: Temporal Dynamics"""))
cells.append(new_code_cell("""print("--- Temporal Dynamics ---")
plt.figure(figsize=(10,5))
# LOESS smoothing
sns.lmplot(data=df, x='trial_order', y='human_correct_plat_int', hue='condition', lowess=True, scatter_kws={'alpha':0.1}, height=6, aspect=1.5)
plt.title("Learning Curve (LOESS Smoothed Accuracy vs Trial Order)")
plt.show()

# Fatigue Check
def get_block(order):
    if order <= 17: return 'Block 1 (1-17)'
    elif order <= 34: return 'Block 2 (18-34)'
    else: return 'Block 3 (35-50)'

df['trial_block'] = df['trial_order'].apply(get_block)
block_acc = df.groupby(['participant_id', 'trial_block'])['human_correct_plat_int'].mean().reset_index()
aov_fatigue = pg.rm_anova(data=block_acc, dv='human_correct_plat_int', within='trial_block', subject='participant_id')
print("Repeated Measures ANOVA for Fatigue (Accuracy across Blocks):")
print(aov_fatigue)

plt.figure(figsize=(10,5))
sns.regplot(data=df, x='trial_order', y='trial_duration', lowess=True, scatter_kws={'alpha': 0.1})
plt.title("Trial Duration over Time (Fatigue/Speed-up Check)")
plt.ylim(0, 60)
plt.show()
"""))

nb.cells = cells

cells.append(new_markdown_cell("""## Section 6: Brittle Benefit / Withdrawal Effect"""))
cells.append(new_code_cell("""print("--- Brittle Benefit / Withdrawal Effect ---")
# Look at TG=1 (AI first, Control second)
df_tg1 = df[df['treatment_group'] == 1]
part_acc_tg1 = df_tg1.groupby(['participant_id', 'session'])['human_correct_plat'].mean().unstack()
part_acc_tg1 = part_acc_tg1.dropna() # completers in TG=1
if not part_acc_tg1.empty and 1 in part_acc_tg1.columns and 2 in part_acc_tg1.columns:
    print(f"TG=1 (AI first) Accuracy - Session 1 (AI): {part_acc_tg1[1].mean():.3f}")
    print(f"TG=1 (AI first) Accuracy - Session 2 (Control): {part_acc_tg1[2].mean():.3f}")
    from scipy.stats import wilcoxon, ttest_rel
    t_stat, t_p = ttest_rel(part_acc_tg1[1], part_acc_tg1[2])
    w_stat, w_p = wilcoxon(part_acc_tg1[1], part_acc_tg1[2])
    print(f"Paired t-test (Session 1 vs 2): t={t_stat:.3f}, p={t_p:.4f}")
    print(f"Wilcoxon test (Session 1 vs 2): W={w_stat}, p={w_p:.4f}")
else:
    print("Not enough data for TG=1 session comparison.")
"""))

with open('NB2_annotation_experiment.ipynb', 'w') as f:
    nbformat.write(nb, f)
