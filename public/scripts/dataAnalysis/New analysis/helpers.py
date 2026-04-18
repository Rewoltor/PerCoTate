import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Plotting defaults
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('colorblind')
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 12

def _get_label_direction(row):
    orig = row['gt_original_kl']
    plat = row['gt_plat_kl']
    if orig == 0 and plat == 0: return 'stable_neg'
    if orig >= 2 and plat >= 2: return 'stable_pos'
    if orig == 0 and plat >= 2: return 'fn_corrected'
    if orig >= 2 and plat == 0: return 'fp_corrected'
    if orig == 0 and plat == 1: return 'ambig_from_neg'
    if orig >= 2 and plat == 1: return 'ambig_from_pos'
    return 'other'

def load_data(kl1_strategy='exclude'):
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    participants_path = os.path.join(data_dir, 'participants.csv')
    radiologist_path = os.path.join(data_dir, 'Radiologist_Ground_Truth.csv')
    
    parts_df = pd.read_csv(participants_path)
    rad_df = pd.read_csv(radiologist_path)
    
    # Check for inconsistencies before overriding
    # Ensure trial_imageFileName matching
    df = parts_df.merge(rad_df, left_on='trial_image_name', right_on='trial_imageFileName', how='inner')
    
    df['gt_original_kl'] = df['gt_original']
    df['gt_original_binary'] = (df['gt_original_kl'] >= 2).astype(int)
    
    # If gt_plat_kl exists twice:
    if 'gt_plat_kl_y' in df.columns:
        df['gt_plat_kl'] = df['gt_plat_kl_y']
    
    if kl1_strategy == 'exclude':
        df = df[df['gt_plat_kl'] != 1].copy()
        df['gt_plat_binary'] = (df['gt_plat_kl'] >= 2).astype(int)
    elif kl1_strategy == 'clinical':
        df['gt_plat_binary'] = (df['gt_plat_kl'] >= 2).astype(int)
    elif kl1_strategy == 'sensitivity_1':
        df['gt_plat_binary'] = (df['gt_plat_kl'] >= 1).astype(int)
    else:
        raise ValueError(f"Unknown KL1 strategy: {kl1_strategy}")

    # Fill missing final_decision/confidence BEFORE computing metrics
    # Ensure trials with no-AI show the initial decision as the final one
    df['final_decision'] = df['final_decision'].fillna(df['initial_decision'])
    if 'final_confidence' in df.columns and 'initial_confidence' in df.columns:
        df['final_confidence'] = df['final_confidence'].fillna(df['initial_confidence'])
    
    # Final fallback for Control condition (no_ai) using the old 'confidence' column
    if 'confidence' in df.columns:
        df['final_confidence'] = df['final_confidence'].fillna(df['confidence'])
        df['initial_confidence'] = df['initial_confidence'].fillna(df['confidence'])

    df['label_changed'] = df['gt_plat_binary'] != df['gt_original_binary']
    df['label_direction'] = df.apply(_get_label_direction, axis=1)
    
    df['ai_correct_original'] = df['ai_prediction'] == df['gt_original_binary']
    df['ai_correct_plat'] = df['ai_prediction'] == df['gt_plat_binary']
    
    df['human_correct_original'] = df['final_decision'] == df['gt_original_binary']
    df['human_correct_plat'] = df['final_decision'] == df['gt_plat_binary']
    df['human_initial_correct_original'] = df['initial_decision'] == df['gt_original_binary']
    df['human_initial_correct_plat'] = df['initial_decision'] == df['gt_plat_binary']
    
    # Reliance metrics
    df['over_reliance'] = (df['ai_shown'] == True) & (df['ai_correct_plat'] == False) & (df['final_decision'] == df['ai_prediction'])
    df['appropriate_skepticism'] = (df['ai_shown'] == True) & (df['ai_correct_plat'] == False) & (df['final_decision'] != df['ai_prediction'])
    df['appropriate_reliance'] = (df['ai_shown'] == True) & (df['ai_correct_plat'] == True) & (df['final_decision'] == df['ai_prediction'])
    df['unwarranted_skepticism'] = (df['ai_shown'] == True) & (df['ai_correct_plat'] == True) & (df['final_decision'] != df['ai_prediction'])
    
    df['decision_changed'] = df['initial_decision'] != df['final_decision']
    df['session'] = df['current_phase'].apply(lambda x: 1 if 'phase1' in str(x) else 2)
    df['condition'] = df['ai_shown'].apply(lambda x: 'ai' if x else 'no_ai')
    
    df['trial_start_time'] = pd.to_numeric(df['trial_start_time'], errors='coerce')
    df['trial_order'] = df.groupby(['participant_id', 'session'])['trial_start_time'].rank(method='first', ascending=True).astype(int)
    
    assert not df[['gt_plat_kl', 'gt_original', 'ai_prediction', 'final_decision']].isnull().any().any(), "Null values detected in key columns"
    
    return df

def participant_summary(df):
    def mode_or_first(series):
        return series.mode()[0] if not series.mode().empty else series.iloc[0]
        
    res = []
    for pid, pdf in df.groupby('participant_id'):
        acc_orig = pdf['human_correct_original'].mean()
        acc_plat = pdf['human_correct_plat'].mean()
        
        pdf_ai = pdf[pdf['condition'] == 'ai']
        pdf_noai = pdf[pdf['condition'] == 'no_ai']
        
        acc_ai_plat = pdf_ai['human_correct_plat'].mean() if len(pdf_ai) > 0 else np.nan
        acc_noai_plat = pdf_noai['human_correct_plat'].mean() if len(pdf_noai) > 0 else np.nan
        
        or_rate = pdf_ai['over_reliance'].mean() if len(pdf_ai) > 0 else np.nan
        as_rate = pdf_ai['appropriate_skepticism'].mean() if len(pdf_ai) > 0 else np.nan
        
        mean_conf_init = pdf['initial_confidence'].mean()
        mean_conf_final = pdf['final_confidence'].mean()
        conf_change = mean_conf_final - mean_conf_init
        
        row = {
            'participant_id': pid,
            'accuracy_original': acc_orig,
            'accuracy_plat': acc_plat,
            'accuracy_ai_condition': acc_ai_plat,
            'accuracy_noai_condition': acc_noai_plat,
            'over_reliance_rate': or_rate,
            'appropriate_skepticism_rate': as_rate,
            'mean_confidence_initial': mean_conf_init,
            'mean_confidence_final': mean_conf_final,
            'confidence_change': conf_change,
            'n_trials_ai': len(pdf_ai),
            'n_trials_noai': len(pdf_noai),
        }
        
        # Add big 5 logic
        b5_cols = [c for c in pdf.columns if c.startswith('big5_') or c.startswith('facet_') or c == 'iq_score' or c in ['age', 'gender', 'treatment_group']]
        for c in b5_cols:
            row[c] = pdf[c].iloc[0]
            
        res.append(row)
    return pd.DataFrame(res)

def image_summary(df):
    res = []
    for img, idf in df.groupby('trial_image_name'):
        row = {
            'image_name': img,
            'gt_plat_kl': idf['gt_plat_kl'].iloc[0],
            'gt_original': idf['gt_original'].iloc[0],
            'label_changed': idf['label_changed'].iloc[0],
            'label_direction': idf['label_direction'].iloc[0],
            'ai_confidence': idf['ai_confidence'].mean(),
            'ai_correct_plat': idf['ai_correct_plat'].iloc[0],
            'ai_correct_original': idf['ai_correct_original'].iloc[0],
            'mean_human_accuracy_plat': idf['human_correct_plat'].mean(),
            'mean_human_accuracy_original': idf['human_correct_original'].mean(),
            'n_annotators': len(idf)
        }
        res.append(row)
    return pd.DataFrame(res).sort_values('image_name')
