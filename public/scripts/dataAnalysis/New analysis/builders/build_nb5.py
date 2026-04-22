import nbformat
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell

nb = new_notebook()
cells = []

cells.append(new_markdown_cell("""# NB5: Publication Figures
- **Purpose:** Produce all 10 requested publication-quality figures, exported to `.pdf` and `.png`.
"""))

cells.append(new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
from sklearn.metrics import accuracy_score
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.multitest import multipletests
from scipy import stats
import os
import sys, os; sys.path.append(os.path.abspath(".")); sys.path.append(os.path.abspath("..")); import helpers
import warnings

warnings.filterwarnings("ignore")

# Output directory
if not os.path.exists('figures'):
    os.makedirs('figures')

# Global plot settings
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('colorblind')
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['font.family'] = 'sans-serif'

def save_fig(fig, name):
    fig.savefig(f'figures/{name}.png', bbox_inches='tight')
    fig.savefig(f'figures/{name}.pdf', bbox_inches='tight')
    
print("Setup complete. Ready to generate figures.")
"""))

cells.append(new_code_cell("""# 1. Load data
df = helpers.load_data('exclude')
df_full = helpers.load_data('clinical') # Keep all images for distribution/noise figures
df_part = helpers.participant_summary(df)
df_img = helpers.image_summary(df_full)

df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)
df['human_correct_orig_int'] = df['human_correct_original'].astype(int)
"""))

cells.append(new_markdown_cell("""## Figure 1: GT Transition Sankey"""))
cells.append(new_code_cell("""print("Generating Fig 1: GT Transition Sankey")

source, target, value = [], [], []
for o in [0, 2, 3, 4]:
    for p in [0, 1, 2, 3, 4]:
        count = len(df_img[(df_img['gt_original']==o) & (df_img['gt_plat_kl']==p)])
        if count > 0:
            source.append(o)
            target.append(p + 5)
            value.append(count)

labels = ["Orig KL0", "Orig KL1", "Orig KL2", "Orig KL3", "Orig KL4",
          "Plat KL0", "Plat KL1", "Plat KL2", "Plat KL3", "Plat KL4"]

fig_sankey = go.Figure(data=[go.Sankey(
    node = dict(pad=15, thickness=20, line=dict(color="black", width=0.5), label=labels),
    link = dict(source=source, target=target, value=value)
)])
fig_sankey.update_layout(title_text="Original vs Platinum GT Label Flow", font_size=12, width=800, height=500)

try:
    fig_sankey.write_image("figures/Fig1_Transition_Sankey.png", scale=3)
    fig_sankey.write_image("figures/Fig1_Transition_Sankey.pdf")
except Exception as e:
    print("kaleido export failed, you may need to install kaleido. Returning HTML instead.")
    fig_sankey.show()
"""))

cells.append(new_markdown_cell("""## Figure 2: Label Noise Summary (Two-panel)"""))
cells.append(new_code_cell("""print("Generating Fig 2: Label Noise Summary")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Original
sns.countplot(data=df_img, x='gt_original', hue='label_direction', ax=ax1, dodge=False, palette='muted', order=[0, 1, 2, 3, 4])
ax1.set_title('Original GT Distribution')
ax1.set_xlabel('Original KL Grade')

# Platinum
sns.countplot(data=df_img, x='gt_plat_kl', hue='label_direction', ax=ax2, dodge=False, palette='muted', order=[0, 1, 2, 3, 4])
ax2.set_title('Platinum GT Distribution')
ax2.set_xlabel('Platinum KL Grade')

ax1.legend_.remove()
ax2.legend(title='Label Direction', bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
save_fig(fig, 'Fig2_Label_Noise_Summary')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 3: Accuracy Paradox"""))
cells.append(new_code_cell("""print("Generating Fig 3: Accuracy Paradox")

df_clin = helpers.load_data('clinical') 
o_acc = accuracy_score(df_clin.drop_duplicates('trial_image_name')['gt_original_binary'], df_clin.drop_duplicates('trial_image_name')['ai_prediction'])
p_acc = accuracy_score(df_clin.drop_duplicates('trial_image_name')['gt_plat_binary'], df_clin.drop_duplicates('trial_image_name')['ai_prediction'])
h_o_acc = df_clin['human_correct_original'].mean()
h_p_acc = df_clin['human_correct_plat'].mean()

fig, ax = plt.subplots(figsize=(8, 5))
width = 0.35
x = np.arange(2)
ax.bar(x - width/2, [o_acc, h_o_acc], width, label='Evaluated with Original GT', color='#E67E22')
ax.bar(x + width/2, [p_acc, h_p_acc], width, label='Evaluated with Platinum GT', color='#2E86C1')

ax.set_xticks(x)
ax.set_xticklabels(['AI Model', 'Human Annotator (Overall)'])
ax.set_ylabel('Accuracy')
ax.set_title('The Accuracy Paradox')
ax.legend()
save_fig(fig, 'Fig3_Accuracy_Paradox')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 4: Reliance Taxonomy"""))
cells.append(new_code_cell("""print("Generating Fig 4: Reliance Taxonomy")

ai_df = df[df['condition'] == 'ai']
rel_cols = ['over_reliance', 'appropriate_skepticism', 'appropriate_reliance', 'unwarranted_skepticism']
rel_rates = ai_df.groupby('participant_id')[rel_cols].mean()
rel_rates = rel_rates.sort_values('over_reliance', ascending=False)

fig, ax = plt.subplots(figsize=(12, 6))
rel_rates.plot(kind='bar', stacked=True, colormap='RdYlBu', ax=ax, width=0.85)
ax.set_title("Reliance Taxonomy by Participant")
ax.set_ylabel("Fraction of AI Trials")
ax.set_xlabel("Participant ID")
ax.set_xticks([]) # Hide participant IDs as they are just hashes
ax.legend(bbox_to_anchor=(1.01, 1), loc='upper left')

save_fig(fig, 'Fig4_Reliance_Taxonomy')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 5: AI Confidence on Mislabeled Images"""))
cells.append(new_code_cell("""print("Generating Fig 5: AI Confidence on Mislabeled Images")

fig, ax = plt.subplots(figsize=(8, 5))
order = ['stable_neg', 'ambig_from_neg', 'fn_corrected', 'ambig_from_pos', 'stable_pos']
sns.boxplot(data=df_img, x='label_direction', y='ai_confidence', order=order, ax=ax, color='white')
sns.stripplot(data=df_img, x='label_direction', y='ai_confidence', order=order, ax=ax, alpha=0.7, jitter=True)

ax.set_title("AI Confidence Distributions by Ground Truth Error Type")
ax.set_xticklabels(['True Negatives', 'Ambig. from Neg.', 'False Negatives', 'Ambig. from Pos.', 'True Positives'], rotation=45)
ax.set_ylabel("AI Prediction Confidence")
ax.set_xlabel("")

save_fig(fig, 'Fig5_AI_Confidence_Mislabeled')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 6: Decision Flip Map"""))
cells.append(new_code_cell("""print("Generating Fig 6: Decision Flip Map")

# Pivot matrix for old GT and new GT accuracy
pivot_orig = df.pivot_table(index='participant_id', columns='trial_image_name', values='human_correct_orig_int')
pivot_plat = df.pivot_table(index='participant_id', columns='trial_image_name', values='human_correct_plat_int')

# Highlight inversions: 1=Correct under orig, 2=Correct under plat, 3=Correct under both
diff = pivot_orig + pivot_plat * 2

fig, ax = plt.subplots(figsize=(14, 8))
cmap = sns.color_palette(["#d73027", "#fc8d59", "#91bfdb", "#4575b4"])
sns.heatmap(diff, cmap=cmap, cbar=False, ax=ax)
ax.set_title("Decision Map: 0=Wrong Both, 1=Correct Only Orig, 2=Correct Only Plat, 3=Correct Both")
ax.set_yticks([])
ax.set_xticks([])
ax.set_xlabel("Images")
ax.set_ylabel("Participants")

save_fig(fig, 'Fig6_Decision_Flip_Map')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 7: Calibration Curves"""))
cells.append(new_code_cell("""print("Generating Fig 7: Calibration Curves")

calib = df.groupby(['condition', 'final_confidence'])['human_correct_plat'].mean().reset_index()

fig, ax = plt.subplots(figsize=(7, 5))
sns.lineplot(data=calib, x='final_confidence', y='human_correct_plat', hue='condition', marker='o', ax=ax)
ax.plot([1, 7], [1/7, 1], 'k--', alpha=0.3)
ax.set_title("Confidence Calibration")
ax.set_ylabel("Actual Accuracy (Platinum GT)")
ax.set_xlabel("Self-Reported Confidence")

save_fig(fig, 'Fig7_Calibration_Curves')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 8: Psychometric Heatmap"""))
cells.append(new_code_cell("""print("Generating Fig 8: Psychometric Heatmap")

b5_cols = ['big5_open_mindedness', 'big5_conscientiousness', 'big5_extraversion', 'big5_agreeableness', 'big5_neuroticism', 'iq_score']
outcomes = ['accuracy_plat', 'over_reliance_rate', 'appropriate_skepticism_rate']
res_psy = []
for out in outcomes:
    for c in b5_cols:
        r, p = stats.spearmanr(df_part[c], df_part[out], nan_policy='omit')
        res_psy.append({'Trait': c, 'Outcome': out, 'r': r, 'p_raw': p})

psy_df = pd.DataFrame(res_psy)
psy_df['p_fdr'] = multipletests(psy_df['p_raw'], method='fdr_bh')[1]

pivot_r = psy_df.pivot(index='Trait', columns='Outcome', values='r')
pivot_p = psy_df.pivot(index='Trait', columns='Outcome', values='p_fdr')

fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(pivot_r, mask=(pivot_p > 0.05), annot=True, cmap='coolwarm', center=0, ax=ax)
ax.set_title("Psychometric Correlations (Significant FDR < 0.05 only)")

save_fig(fig, 'Fig8_Psychometric_Heatmap')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 9: Learning Curves"""))
cells.append(new_code_cell("""print("Generating Fig 9: Learning Curves")

fig, ax = plt.subplots(figsize=(10, 5))
sns.regplot(data=df[df['condition']=='no_ai'], x='trial_order', y='human_correct_plat_int', lowess=True, scatter_kws={'alpha':0.1}, label='No AI', ax=ax)
sns.regplot(data=df[df['condition']=='ai'], x='trial_order', y='human_correct_plat_int', lowess=True, scatter_kws={'alpha':0.1}, label='AI', ax=ax)
ax.set_title("Learning Curves (LOESS Smoothed)")
ax.set_ylabel("Accuracy")
ax.legend()

save_fig(fig, 'Fig9_Learning_Curves')
plt.show()
"""))

cells.append(new_markdown_cell("""## Figure 10: Model Comparison"""))
cells.append(new_code_cell("""print("Generating Fig 10: Model Comparison Coefficient Plot")

m3 = smf.gee("human_correct_plat_int ~ C(condition, Treatment('no_ai')) + iq_score + big5_neuroticism + big5_conscientiousness + gt_plat_kl + ai_correct_plat", 
             groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()

params = m3.params
conf = m3.conf_int()
conf['OR'] = np.exp(params)
conf.columns = ['Lower CI', 'Upper CI', 'OR']
conf[['Lower CI', 'Upper CI']] = np.exp(conf[['Lower CI', 'Upper CI']])

# Exclude intercept
conf = conf.drop('Intercept')

fig, ax = plt.subplots(figsize=(8, 6))
# Calculate errors for errorbar (must be positive distances from the point)
y_err_lower = conf['OR'] - conf['Lower CI']
y_err_upper = conf['Upper CI'] - conf['OR']

ax.errorbar(conf['OR'], np.arange(len(conf)), xerr=[y_err_lower, y_err_upper], fmt='o', color='black', capsize=5)
ax.axvline(1, color='red', linestyle='--')
ax.set_yticks(np.arange(len(conf)))
ax.set_yticklabels(conf.index)
ax.set_xlabel("Odds Ratio (95% CI)")
ax.set_title("Full Model (M3) Predictors of Accuracy")

save_fig(fig, 'Fig10_Model_Comparison')
plt.show()
"""))

nb.cells = cells
with open('NB5_figures.ipynb', 'w') as f:
    nbformat.write(nb, f)
