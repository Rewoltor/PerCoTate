import nbformat
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell

nb = new_notebook()
cells = []

cells.append(new_markdown_cell("""# NB3: Psychometrics as Predictors
- **Question:** Do Big Five personality traits and non-verbal IQ predict annotation accuracy and reliance on AI?
- **Primary GT:** Platinum Consensus
- **KL1 Strategy:** Exclude (Strategy A)
- **Hypothesis:** Higher neuroticism predicts higher over-reliance on AI feedback, and baseline accuracy is modulated by IQ and conscientiousness.
- **Data Note:** The sample size for psychometrics is n=58. This consists of the 51 completers plus 7 dropouts from the Control-first group (TG=0) who completed Phase 1 and the psychometrics before dropping out. The missing rows correspond to the 10 dropouts from the AI-first group who did not reach the psychometrics phase.
"""))

cells.append(new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
import statsmodels.formula.api as smf
from scipy import stats
from statsmodels.stats.multitest import multipletests
import pingouin as pg
import warnings
import sys, os; sys.path.append(os.path.abspath(".")); sys.path.append(os.path.abspath("..")); import helpers

warnings.filterwarnings("ignore")

# 1. Load Data
df = helpers.load_data('exclude')
df['human_correct_plat_int'] = df['human_correct_plat'].astype(int)
df['over_reliance_int'] = df['over_reliance'].astype(int)
df['human_correct_orig_int'] = df['human_correct_original'].astype(int)

df_part = helpers.participant_summary(df)
df_img = helpers.image_summary(df)

b5_cols = ['big5_open_mindedness', 'big5_conscientiousness', 'big5_extraversion', 'big5_agreeableness', 'big5_neuroticism', 'iq_score']
facet_cols = [c for c in df_part.columns if c.startswith('facet_')]

print("Setup Complete.")
"""))

cells.append(new_markdown_cell("""## Section 1: Descriptive Psychometrics"""))
cells.append(new_code_cell("""print("--- Descriptive Psychometrics ---")
print(df_part[b5_cols].describe())

corr = df_part[b5_cols].corr(method='spearman')
plt.figure(figsize=(8,6))
sns.heatmap(corr, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
plt.title("Internal Correlation Matrix (Spearman)")
plt.show()

# VIF for multicollinearity
from statsmodels.stats.outliers_influence import variance_inflation_factor
X = sm.add_constant(df_part[b5_cols].dropna())
vif = pd.DataFrame()
vif["Variable"] = X.columns
vif["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
print("\\nVariance Inflation Factors (VIF > 5 indicates concern):")
print(vif)
"""))

cells.append(new_markdown_cell("""## Section 2: Psychometrics and Accuracy"""))
cells.append(new_code_cell("""print("--- Spearman Correlations (FDR Corrected) ---")
res = []
for cond in ['ai', 'no_ai']:
    acc_col = 'accuracy_ai_condition' if cond == 'ai' else 'accuracy_noai_condition'
    for c in b5_cols:
        r, p = stats.spearmanr(df_part[c], df_part[acc_col], nan_policy='omit')
        res.append({'Condition': cond, 'Trait': c, 'r': r, 'p_raw': p})

res_df = pd.DataFrame(res)
res_df['p_fdr'] = multipletests(res_df['p_raw'], method='fdr_bh')[1]
print(res_df.sort_values(['Condition', 'p_fdr']))

print("\\n--- GEE Model: Accuracy ~ Psychometrics + Condition ---")
# Using GEE instead of OLS to properly account for repeated trials
formula = "human_correct_plat_int ~ iq_score + big5_neuroticism + big5_conscientiousness + big5_open_mindedness + C(condition)"
m_acc = smf.gee(formula, groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()
print(m_acc.summary().tables[1])
"""))

cells.append(new_markdown_cell("""## Section 3: Psychometrics and Reliance Behavior"""))
cells.append(new_code_cell("""print("--- Reliance Behavior Predictors ---")
rel_res = []
for c in b5_cols:
    r, p = stats.spearmanr(df_part[c], df_part['over_reliance_rate'], nan_policy='omit')
    rel_res.append({'Trait': c, 'Outcome': 'over_reliance', 'r': r, 'p_raw': p})
    
    r2, p2 = stats.spearmanr(df_part[c], df_part['appropriate_skepticism_rate'], nan_policy='omit')
    rel_res.append({'Trait': c, 'Outcome': 'approp_skepticism', 'r': r2, 'p_raw': p2})

rel_df = pd.DataFrame(rel_res)
rel_df['p_fdr'] = multipletests(rel_df['p_raw'], method='fdr_bh')[1]
print(rel_df[rel_df['Outcome'] == 'over_reliance'].sort_values('p_fdr'))

print("\\n--- GEE Model: Over-Reliance ~ Psychometrics ---")
# Limit to AI condition since over_reliance only happens there
ai_df = df[df['condition'] == 'ai']
formula_rel = "over_reliance_int ~ iq_score + big5_neuroticism"
m_rel = smf.gee(formula_rel, groups=ai_df["participant_id"], data=ai_df, family=sm.families.Binomial()).fit()
print(m_rel.summary().tables[1])

# Directional test for Neuroticism (one-sided)
p_neu = m_rel.pvalues['big5_neuroticism'] / 2 if m_rel.params['big5_neuroticism'] > 0 else 1 - (m_rel.pvalues['big5_neuroticism'] / 2)
print(f"\\nOne-sided p-value for Neuroticism predicting higher Over-Reliance: p = {p_neu:.4f}")
"""))

cells.append(new_markdown_cell("""## Section 4: Facet-level Analysis"""))
cells.append(new_code_cell("""print("--- Facet-Level Exploratory Analysis ---")
if len(facet_cols) == 0:
    print("No facet columns found.")
else:
    f_res = []
    outcomes = ['accuracy_plat', 'over_reliance_rate', 'appropriate_skepticism_rate']
    for out in outcomes:
        for f in facet_cols:
            r, p = stats.spearmanr(df_part[f], df_part[out], nan_policy='omit')
            f_res.append({'Facet': f, 'Outcome': out, 'r': r, 'p_raw': p})
    
    f_df = pd.DataFrame(f_res)
    f_df['p_fdr'] = multipletests(f_df['p_raw'], method='fdr_bh')[1]
    
    # Heatmap of facets vs outcomes (colored by r, but only showing if FDR significant, or masking)
    pivot_r = f_df.pivot(index='Facet', columns='Outcome', values='r')
    pivot_p = f_df.pivot(index='Facet', columns='Outcome', values='p_fdr')
    
    # Mask non-significant correlations
    mask = pivot_p > 0.1 # Using 0.1 for exploratory visibility
    
    plt.figure(figsize=(10, 15))
    sns.heatmap(pivot_r, mask=mask, annot=True, cmap='coolwarm', center=0, cbar_kws={'label': 'Spearman r'})
    plt.title("Facet-Level Correlations (Masked if FDR p > 0.1)")
    plt.tight_layout()
    plt.show()
"""))

cells.append(new_markdown_cell("""## Section 5: Robustness Under GT Switch"""))
cells.append(new_code_cell("""print("--- GT Switch Robustness ---")
m_acc_orig = smf.gee("human_correct_orig_int ~ iq_score + big5_neuroticism + big5_conscientiousness + big5_open_mindedness + C(condition)", 
                     groups=df["participant_id"], data=df, family=sm.families.Binomial()).fit()

comp_df = pd.DataFrame({
    'Platinum (OR)': np.exp(m_acc.params),
    'Platinum (p)': m_acc.pvalues,
    'Original (OR)': np.exp(m_acc_orig.params),
    'Original (p)': m_acc_orig.pvalues
})

print(comp_df.round(3))
"""))

nb.cells = cells
with open('NB3_psychometrics.ipynb', 'w') as f:
    nbformat.write(nb, f)
