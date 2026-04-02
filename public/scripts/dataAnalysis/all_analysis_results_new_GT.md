# NB0_data_loading.ipynb

# NB0 — Data Loading & Quality Dashboard

**Purpose**: Load, clean, validate, and explore the PerCoTate dataset.  
This notebook is purely descriptive — no hypothesis testing.  
All subsequent notebooks import from `helpers.py` which implements the same loading/cleaning pipeline.

---

#### Output
```text
CSV path: /Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/../outputs/csv/export_2026.03.22_12:22_1/participants.csv

```

## 1. Load & Clean

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════
Total rows:           5,950
Columns:              80
Unique participants:  68
Completers:           51
Dropouts:             17

```
```text
   age  ai_confidence  ai_prediction  ai_shown  big5_agreeableness  \
0   17         0.3771              0     False                3.17   
1   17         0.6423              0     False                3.17   
2   17         0.8646              0     False                3.17   

   big5_conscientiousness  big5_extraversion  big5_neuroticism  \
0                    3.67               2.92              2.83   
1                    3.67               2.92              2.83   
2                    3.67               2.92              2.83   

   big5_open_mindedness  big5_timestamp  ...  agreed_with_ai over_reliance  \
0                  3.67    1.770286e+12  ...             NaN           NaN   
1                  3.67    1.770286e+12  ...             NaN           NaN   
2                  3.67    1.770286e+12  ...             NaN           NaN   

  skepticism confidence_shift  trial_block    phase  symptom1_en  symptom2_en  \
0        NaN              NaN         1-10  Phase 1          NaN          NaN   
1        NaN              NaN         1-10  Phase 1          NaN          NaN   
2        NaN              NaN         1-10  Phase 1          NaN          NaN   

   kl_severity  has_psychometrics  
0      healthy               True  
1     doubtful               True  
2         mild               True  

[3 rows x 80 columns]
```

## 2. Data Types & Missing Values

#### Output
```text
Columns with missing values: 43


```
```text
                              missing_count  missing_pct
final_confidence                       2900         48.7
decision_changed                       2900         48.7
phase1_video_watched                   2900         48.7
reverted_decision                      2900         48.7
symptom1                               2900         48.7
symptom2                               2900         48.7
pre_ai_correct                         2900         48.7
ai_correct                             2900         48.7
changed_to_correct                     2900         48.7
final_decision                         2900         48.7
changed_to_incorrect                   2900         48.7
agreed_with_ai                         2900         48.7
over_reliance                          2900         48.7
skepticism                             2900         48.7
confidence_shift                       2900         48.7
symptom1_en                            2900         48.7
initial_confidence                     2900         48.7
symptom2_en                            2900         48.7
phase2_completed_at                     850         14.3
facet_responsibility                    500          8.4
facet_emotional_volatility              500          8.4
big5_extraversion                       500          8.4
big5_neuroticism                        500          8.4
big5_open_mindedness                    500          8.4
big5_timestamp                          500          8.4
facet_aesthetic_sensitivity             500          8.4
facet_anxiety                           500          8.4
facet_assertiveness                     500          8.4
facet_compassion                        500          8.4
facet_creative_imagination              500          8.4
facet_depression                        500          8.4
facet_energy_level                      500          8.4
facet_sociability                       500          8.4
facet_intellectual_curiosity            500          8.4
facet_organization                      500          8.4
iq_time_remaining                       500          8.4
iq_score                                500          8.4
iq_completed_at                         500          8.4
facet_productiveness                    500          8.4
facet_respectfulness                    500          8.4
big5_conscientiousness                  500          8.4
facet_trust                             500          8.4
big5_agreeableness                      500          8.4
```

#### Output
```text
<Figure size 1680x960 with 1 Axes>
```

## 3. Participant Demographics

#### Output
```text
=== Participant Demographics ===
N = 68
  Completers: 51 | Dropouts: 17
  Gender: {'female': 35, 'male': 33}
  Age: mean=16.3, SD=0.7, range=[15, 18]
  School: {'secondary': 61, 'primary': 7}
  Residence: {'budapest': 48, 'city': 13, 'village': 7}
  Treatment group: {'0': 34, '1': 34}

```

#### Output
```text
<Figure size 1920x1200 with 6 Axes>
```

## 4. Ground Truth & Class Balance

#### Output
```text
<Figure size 1920x600 with 3 Axes>
```
```text

Binary mapping: KL0→Healthy(0), KL1→Doubtful(1), KL2-4→Diseased(1)
Class balance: 38.0% Healthy vs 62.0% Diseased

```

## 5. AI Model Audit

#### Output
```text
AI Overall Accuracy: 66.0% (n=3050 trials)

```
```text
<Figure size 1680x600 with 3 Axes>
```
```text

AI Classification Report:
              precision    recall  f1-score   support

 Healthy (0)       0.54      0.74      0.62      1159
Diseased (1)       0.79      0.61      0.69      1891

    accuracy                           0.66      3050
   macro avg       0.67      0.67      0.66      3050
weighted avg       0.70      0.66      0.66      3050


```

#### Output
```text
<Figure size 1680x600 with 2 Axes>
```

## 6. Speeder Detection

Exploring multiple methods to identify participants who are not engaging genuinely with the task.

#### Output
```text
<Figure size 2160x600 with 3 Axes>
```
```text
Duration stats: min=1.2s, median=12.1s, mean=16.4s, max=151.0s
Trials < 3s: 538 (9.0%)
Trials < 5s: 1537 (25.8%)

```

#### Output
```text
           Method  Flagged Trials Flagged %  Flagged Participants  \
0      Fixed < 3s             538      9.0%                     0   
1      Fixed < 5s            1537     25.8%                     2   
2    Z-score < -2               0      0.0%                     0   
3  5th percentile             297      5.0%                     0   

  Acc (flagged) Acc (normal)  
0         74.5%        65.9%  
1         70.9%        65.2%  
2           N/A        66.6%  
3         74.1%        66.2%  
```
```text

→ This table helps decide which speeder threshold to use.
  A good threshold flags trials with notably lower accuracy.

```

## 7. Dropout Characterization

#### Output
```text
<Figure size 1920x600 with 3 Axes>
```
```text
Dropouts: 17 participants
  TG=0 dropouts: 7 (had Control only → have psychometrics)
  TG=1 dropouts: 10 (had AI only → NO psychometrics)

```

## 8. Quick Overview — Key Variable Distributions

#### Output
```text
<Figure size 2160x1200 with 6 Axes>
```

## 9. Crossover Design Verification

Verify the experimental structure: Phase 1 → Phase 2 crossover.

#### Output
```text
Crossover Design Verification:
Phase 1      Phase 2    
Control      AI-Assisted    27
AI-Assisted  Control        24
Name: count, dtype: int64

Phase × Condition trial counts (completers only):

```
```text
condition  AI-Assisted  Control
phase                          
Phase 1           1200     1350
Phase 2           1350     1200
```
```text

✓ Confirms: TG=0 → Phase1=Control, Phase2=AI | TG=1 → Phase1=AI, Phase2=Control

```

## Findings & Next Steps

**Key Data Quality Observations:**
1. Data is clean — missing values follow expected patterns (control trials lack AI-phase fields)
2. Crossover design verified: 51 completers, 17 dropouts (all Phase 1 only)
3. Class balance is roughly 50/50 (healthy vs diseased)
4. AI accuracy is ~70% as expected
5. 31/58 participants with IQ data scored 0 — critical subgroup to analyze

**Speeder threshold decision**: Review the comparison table above and decide which method to use for subsequent analyses.

**Next**: Proceed to NB1 (Performance & Accuracy) for hypothesis testing.


---

# NB1_performance_accuracy.ipynb

# NB1 — Performance & Accuracy Analysis

**Purpose**: Core hypothesis testing on human accuracy with and without AI assistance.  
Covers control vs AI accuracy, crossover analysis, order effects, self-correction, KL-grade stratification, and AI influence analysis.

---

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════
Loaded: 5950 trials, 68 participants
Completers: 51, Dropouts: 17

```

## 1. Overall Accuracy: Control vs AI-Assisted

Primary comparison using two approaches:
- **All participants** (independent samples, includes dropouts)
- **Completers only** (paired, within-subject — highest power)

#### Output
```text
=== All Participants (Independent Samples) ===
Control: n=58, M=0.658, SD=0.063
AI-Assisted: n=61, M=0.674, SD=0.055
Independent t-test: t=1.523, p=0.1304, Cohen's d=0.279
Mann-Whitney U: U=2072, p=0.1063

```

#### Output
```text
=== Completers Only (Paired, Within-Subject) ===
Control: M=0.656, SD=0.066
AI-Assisted: M=0.673, SD=0.059
Difference: M=0.017, SD=0.099
Paired t-test: t=1.246, p=0.2185, Cohen's d (paired)=0.276
Wilcoxon signed-rank: W=436, p=0.2547
95% CI for AI-Control difference: [-0.011, 0.045]

```

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 2. Order Effects (Crossover Analysis)

Does the order matter? Compare TG=0 (Control first → then AI) vs TG=1 (AI first → then Control).

#### Output
```text
=== 2×2 Mixed ANOVA (Condition × Order) ===

```
```text
            Source  DF1  DF2       F   p_unc     np2
0  treatment_group    1   49  0.4981  0.4837  0.0101
1        condition    1   49  1.5371  0.2210  0.0304
2      Interaction    1   49  0.4817  0.4909  0.0097
```

#### Output
```text
<Figure size 1680x720 with 2 Axes>
```
```text
Phase 1 vs 2: t=-0.616, p=0.5407

```

## 3. AI Influence: Pre-AI vs Post-AI Accuracy

For AI-Assisted trials, compare initial_decision accuracy (before seeing AI) with final_decision accuracy (after seeing AI).  
This directly measures the AI's trial-level influence.

#### Output
```text
=== AI Influence (Trial-Level) ===
Pre-AI accuracy (initial_decision):  0.661
Post-AI accuracy (final_decision):   0.674
AI boost (post - pre):               0.014
AI model accuracy:                   0.660

McNemar contingency: a=1889, b=126 (hurt by AI), c=168 (helped by AI), d=867
McNemar test: χ²=6.000, p=0.0143
Trials helped by AI: 168 (5.5%)
Trials hurt by AI:   126 (4.1%)

```

#### Output
```text
=== AI Influence (Participant-Level) ===
Mean Pre-AI accuracy:  0.661
Mean Post-AI accuracy: 0.674
Mean AI boost:         0.014
Paired t-test: t=2.332, p=0.0231, d=0.237

Participants benefited: 31 (51%)
Participants hurt:     13 (21%)
Unchanged:             17

```

#### Output
```text
=== Baseline Comparison: Control vs Experimental Pre-AI Accuracy ===
Control initial accuracy: 0.658 (n=58)
Experimental pre-AI accuracy: 0.661 (n=61)

--- Completers (paired) ---
Control: 0.656, Exp pre-AI: 0.664
Paired t-test: t=0.617, p=0.5401
(Non-significant → baselines are equivalent, AI effect is real)

```

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 4. Self-Correction Analysis

When users change their decision after seeing AI (initial ≠ final), how often is it a correction vs an error?

#### Output
```text
=== Decision Changes in AI Trials ===
Total AI trials: 3050
Decision changed: 294 (9.6%)
Decision kept:    2756 (90.4%)

Of changes:
  Corrections (wrong→right): 168 (57.1%)
  Errors (right→wrong):      126 (42.9%)
  Net benefit:               42 trials

Changed TO agree with AI:   279 (94.9%)
Changed AWAY from AI:       15 (5.1%)

```

#### Output
```text
<Figure size 1680x720 with 2 Axes>
```

## 5. Accuracy by KL Severity Grade

#### Output
```text
=== Accuracy by KL Severity × Condition ===

```
```text
condition    AI-Assisted  Control
kl_severity                      
healthy            0.691    0.626
doubtful           0.597    0.608
mild               0.657    0.630
moderate           0.709    0.705
severe             0.984    0.994
```
```text

--- Chi-square tests per KL grade ---
  healthy: χ²=3.06, p=0.0804 (Control=62.6% vs AI=69.1%)
  doubtful: χ²=0.13, p=0.7179 (Control=60.8% vs AI=59.7%)
  mild: χ²=1.84, p=0.1750 (Control=63.0% vs AI=65.7%)
  moderate: χ²=0.01, p=0.9413 (Control=70.5% vs AI=70.9%)
  severe: χ²=0.20, p=0.6511 (Control=99.4% vs AI=98.4%)

```

#### Output
```text
<Figure size 1920x720 with 2 Axes>
```

## 6. IQ=0 Sensitivity Analysis

31 of 58 participants with IQ data scored 0. Exploring performance with and without them.

#### Output
```text
=== IQ=0 vs IQ>0 Performance Comparison ===

IQ=0 (n=31):
  Overall accuracy:       0.663 ± 0.034
  Control accuracy:       0.648
  AI accuracy:            0.680
  Mean trial duration:    14.5s

IQ>0 (n=27):
  Overall accuracy:       0.668 ± 0.040
  Control accuracy:       0.669
  AI accuracy:            0.666
  Mean trial duration:    16.5s

IQ>0 vs IQ=0: t=0.505, p=0.6153, d=0.133

=== Sensitivity: Main Result Excluding IQ=0 ===
Completers excl. IQ=0 (n=24):
  Control: 0.667, AI: 0.666
  Paired t: t=-0.089, p=0.9300, d=-0.027

```

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 7. Chance-Level Participant Detection & Sensitivity Analysis

#### Output
```text
§7a. Binomial Test: Are Participants Above Chance?
 
Total participants: 68
Significantly above chance (p<0.05): 67 (98.5%)
NOT significantly above chance:      1 (1.5%)

Above-chance group: M=0.669, SD=0.036
At-chance group:    M=0.600, SD=nan

--- Breakdown by Condition ---
Above-chance: Control=0.658, AI=0.676
At-chance:    Control=nan, AI=0.600

Control phase: 40/58 above chance (69.0%)
AI phase: 48/61 above chance (78.7%)

§7b. Sensitivity: Main Result Excluding At-Chance Participants
Engaged completers: n=51
Control: M=0.656
AI:      M=0.673
Paired t: t=1.246, p=0.2185, d=0.175


```
```text
<Figure size 2160x720 with 3 Axes>
```

## 8. Speed vs Accuracy: Is Faster = Worse?

#### Output
```text
§8a. Speed vs Accuracy (Participant-Level)
 
  Spearman: r=0.206, p=0.0918
  Pearson:  r=0.165, p=0.1789

  Control: r=0.118, p=0.3775 (n=58)
  AI-Assisted: r=0.173, p=0.1835 (n=61)

--- Accuracy by Speed Quartile ---
                mean_accuracy  std_accuracy  mean_duration   n
speed_quartile                                                
Q1 (fastest)            0.664         0.024          9.745  17
Q2                      0.659         0.040         14.260  17
Q3                      0.662         0.039         18.466  17
Q4 (slowest)            0.685         0.039         22.914  17

Trial-level speed vs accuracy: r=-0.024, p=0.0655



```
```text
<Figure size 2160x720 with 3 Axes>
```

## 9. Batch Effect Test (Two Classroom Cohorts)

#### Output
```text
Batch distribution (participants):
batch
1    34
2    34
Name: count, dtype: int64

batch          1     2
date                  
2026-02-05  1650     0
2026-02-06     0  1299
2026-03-05  1448     0
2026-03-06     2  1551
============================================================
§9. Batch Effect Test
============================================================
Batch 1: n=34
Batch 2: n=34

Metric                       Batch1 M(SD)       Batch2 M(SD)            t       p Sig
------------------------------------------------------------------------------------------
  Overall Accuracy           0.665(0.037)   0.671(0.037)    -0.66  0.5123  
  Control Accuracy           0.653(0.062)   0.664(0.065)    -0.66  0.5133  
  AI Accuracy                0.673(0.063)   0.677(0.046)    -0.28  0.7776  
  Over-Reliance Rate         0.164(0.053)   0.162(0.048)    +0.13  0.8979  
  Skepticism Rate            0.164(0.065)   0.161(0.073)    +0.13  0.8936  
  Mean Duration (s)          17.448(5.210)   15.245(5.153)    +1.75  0.0843  
  Extraversion               3.439(0.739)   3.414(0.637)    +0.14  0.8922  
  Neuroticism                3.056(0.799)   2.851(0.750)    +1.01  0.3192  
  Conscientiousness          3.603(0.635)   3.247(0.743)    +1.96  0.0547  

── Demographic Distribution by Batch ──
  gender: χ²=0.00, p=1.0000
  school: χ²=0.64, p=0.4248
  treatment_group: χ²=0.00, p=1.0000


```
```text
<Figure size 2160x720 with 3 Axes>
```
```text
INTERPRETATION:
  If any metric is significant (marked *), batch is a confound
  that should be controlled for in the personality analyses.
  If nothing is significant, batches are equivalent — report as such.

```

## Findings & Next Steps

**Summarize key findings here after running the notebook:**

1. Control vs AI accuracy comparison (paired & independent)
2. Order effects (any significant interaction?)
3. AI influence magnitude (pre vs post accuracy)
4. Self-correction: net benefit of decision changes
5. KL severity: which grades are hardest?
6. IQ=0 sensitivity: does exclusion change the main result?

**Next**: NB2 for detailed Human-AI interaction analysis (over-reliance, skepticism, calibration).


---

# NB2_human_ai_interaction.ipynb

# NB2 — Human-AI Interaction Analysis

**Purpose**: Dissect how users interact with AI predictions.  
Covers over-reliance, skepticism, agreement rates, confidence calibration, symptom analysis, and reversion behavior.

---

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════
AI trials: 3050, Participants with AI data: 61

```

## 1. Agreement, Over-reliance & Skepticism Rates

#### Output
```text
=== Human-AI Interaction Rates ===
Agreement rate (final == ai_prediction):  0.660
Over-reliance (agree with WRONG AI):      0.163
Skepticism (reject CORRECT AI):           0.163

When AI is CORRECT (n=2013):
  Followed AI: 0.754
  Skepticism:  0.246
When AI is WRONG (n=1037):
  Followed AI (over-reliance): 0.479
  Rejected AI:                 0.521

```

#### Output
```text
=== Outcome Matrix ===

```
```text
   ai_correct agreed_with_ai  count  user_acc  % of trials
0    AI Wrong    Rejected AI    540       1.0         17.7
1    AI Wrong    Followed AI    497       0.0         16.3
2  AI Correct    Rejected AI    496       0.0         16.3
3  AI Correct    Followed AI   1517       1.0         49.7
```

#### Output
```text
<Figure size 2160x720 with 4 Axes>
```

## 2. AI Confidence Effect

Does higher `ai_confidence` lead to more agreement and higher over-reliance?

#### Output
```text
=== Agreement & Accuracy by AI Confidence Quartile ===

```
```text
                  agreement_rate  over_reliance_rate  skepticism_rate  \
ai_conf_quartile                                                        
Q1 (low)                   0.585               0.241            0.194   
Q2                         0.541               0.145            0.187   
Q3                         0.646               0.141            0.188   
Q4 (high)                  0.877               0.120            0.077   

                  user_accuracy  ai_accuracy  n_trials  mean_conf  
ai_conf_quartile                                                   
Q1 (low)                  0.565        0.538       793      0.196  
Q2                        0.668        0.583       732      0.548  
Q3                        0.671        0.692       793      0.781  
Q4 (high)                 0.803        0.833       732      0.946  
```
```text

Spearman: AI confidence → Agreement: r=0.212, p=0.0000

```

#### Output
```text
<Figure size 1680x720 with 2 Axes>
```

## 3. Confidence Calibration

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 4. Confidence Shift Analysis

How does seeing AI prediction change user confidence?

#### Output
```text
=== Confidence Shift in AI Trials ===
Mean shift: 0.219
Shift when decision CHANGED: 0.041
Shift when decision KEPT:    0.238

Agreed with AI: mean shift = 0.484 (n=2014)
Disagreed with AI: mean shift = -0.297 (n=1036)

AI was correct: mean shift = 0.311 (n=2013)
AI was wrong: mean shift = 0.039 (n=1037)

```

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 5a. Symptom Category Analysis

Do users who report "uncertain" (bizonytalan) show different AI interaction patterns?

#### Output
```text
=== Symptom Category Analysis ===

```
```text
             n_trials  user_accuracy  agreement_rate  over_reliance  \
symptom1_en                                                           
none             1514          0.612           0.646          0.207   
symptom          1076          0.761           0.686          0.102   
uncertain         460          0.676           0.648          0.161   

             skepticism  decision_changed  mean_confidence  
symptom1_en                                                 
none              0.181             0.100            5.266  
symptom           0.137             0.072            5.699  
uncertain         0.163             0.141            4.650  
```
```text

Chi-square (symptom1 × accuracy): χ²=63.489, p=0.0000

```

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 5b. Metacognition Check: Do "Uncertain" Reports Track Image Difficulty?

#### Output
```text
§5b. Metacognition: Do Uncertain Reports Track Image Difficulty?
  Spearman r(uncertain_rate ~ human_accuracy) = -0.074, p = 0.6097

── Mean Uncertainty Rate: Ambiguous vs Clear Images ──
                   mean    std  count
difficulty_group                     
Ambiguous (KL1)   0.175  0.048     12
Ambiguous (KL2)   0.155  0.035     21
Clear (KL0)       0.112  0.054      6
Clear (KL3)       0.168  0.056      8
Clear (KL4)       0.060  0.019      3

── Trial-Level: Uncertain vs Non-Uncertain Reporters ──
  Uncertain trials: 460 | Other: 2590

```
```text
<Figure size 1920x720 with 2 Axes>
```

## 6. Reversion Analysis

When users use the "revert" button (changing their decision), what drives it?

#### Output
```text
=== Reversion Analysis ===
Total AI trials with revert data: 3050
Reverted: 294 (9.6%)

Accuracy when reverted:     0.571
Accuracy when NOT reverted: 0.685

Reversion TO AI:   279 (94.9%)
Reversion AWAY from AI: 15 (5.1%)

Accuracy when reverted TO AI:   0.573
Accuracy when reverted AWAY:    0.533

```

#### Output
```text
/var/folders/1g/t32yf_mn5pd5ymkl2yywtctr0000gn/T/ipykernel_79266/1179545837.py:17: UserWarning: set_ticklabels() should only be used with a fixed number of ticks, i.e. after set_ticks() or using a FixedLocator.
  axes[1].set_xticklabels(['Not Reverted', 'Reverted'])

```
```text
<Figure size 1680x720 with 2 Axes>
```

## Findings & Next Steps

**Summarize after running:**

1. Overall over-reliance vs skepticism balance
2. AI confidence effect: does higher AI confidence drive more agreement?
3. Calibration quality across conditions
4. Confidence shift patterns
5. Symptom category effects on interaction
6. Reversion patterns and their outcomes

**Next**: NB3 for temporal dynamics and fatigue analysis.


---

# NB3_temporal_dynamics.ipynb

# NB3 — Temporal Dynamics & Fatigue Analysis

**Purpose**: Model how performance changes over the 50-trial sequence within each phase.  
Covers learning curves, speed trends, fatigue detection, AI reliance drift, and carry-over effects.

---

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════
Total trials: 5950, Completers: 51

```

## 1. Learning Curves: Accuracy Over Trials

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```
```text
Control: First 10 (0.653) vs Last 10 (0.672): t=-0.683, p=0.4949
AI-Assisted: First 10 (0.644) vs Last 10 (0.648): t=-0.120, p=0.9048

```

## 2. Speed Trends: Trial Duration Over Time

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```
```text
Control duration trend: r=-0.145, p=0.0000 (negative = speeding up)
AI-Assisted duration trend: r=-0.401, p=0.0000 (negative = speeding up)

```

## 3. Fatigue Crash Detection

Is there a specific point where accuracy drops sharply?

#### Output
```text
=== Half-Phase Accuracy Comparison ===
Control: First half (0.665) vs Second half (0.651): t=0.783, p=0.4339
AI-Assisted: First half (0.677) vs Second half (0.671): t=0.348, p=0.7281

```
```text
<Figure size 1680x720 with 2 Axes>
```

## 4. AI Reliance Over Time

Does over-reliance on AI increase as participants get fatigued?

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```

## 5. Confidence Trends Over Time

#### Output
```text
<Figure size 1680x720 with 2 Axes>
```
```text
Control confidence trend: r=-0.032, p=0.0879
AI-Assisted confidence trend: r=0.003, p=0.8580

```

## 6. Carry-Over Effects (Completers Only)

For completers: does Phase 1 experience affect Phase 2 performance?

#### Output
```text
<Figure size 1680x720 with 2 Axes>
```
```text
=== TG0: Control → AI ===
Phase 1 Mean Accuracy: 0.6570
Phase 2 Mean Accuracy: 0.6652
Paired t-test: t=0.4150, p=0.6815

=== TG1: AI → Control ===
Phase 1 Mean Accuracy: 0.6825
Phase 2 Mean Accuracy: 0.6550
Paired t-test: t=-1.3985, p=0.1753


```

## 6b. Learning Effect: Does AI Exposure Improve Subsequent

#### Output
```text
§6b. Learning Effect Investigation
 

COMPARISON: TG1 Control (Phase 2, AFTER AI) vs TG0 Control (Phase 1, NO prior AI)
  TG0 Control: M=0.657, SD=0.066, n=27
  TG1 Control: M=0.655, SD=0.068, n=24
  Difference:  -0.002
  Independent t-test: t=-0.108, p=0.9141
  Mann-Whitney (TG1 > TG0): U=309.0, p=0.6157
  Cohen's d: -0.030

--- Learning Curve: TG1 Control (after AI) vs TG0 Control (no prior AI) ---
Block        TG0 (naive)      TG1 (post-AI)    Diff    
----------------------------------------------------
  1-10       0.663 ± 0.133  0.638 ± 0.147  -0.025
  11-20       0.674 ± 0.165  0.658 ± 0.161  -0.016
  21-30       0.659 ± 0.176  0.667 ± 0.117  +0.007
  31-40       0.648 ± 0.142  0.604 ± 0.160  -0.044
  41-50       0.641 ± 0.119  0.708 ± 0.147  +0.068

TG1: AI accuracy → Control accuracy: r=-0.145, p=0.4989
  (positive r = those who performed better WITH AI also do better WITHOUT it)

--- Carry-Over Detail ---
TG0 (Control→AI):
  Phase 1 Control: 0.657
  Phase 2 AI:      0.665
  Change:          +0.008

TG1 (AI→Control):
  Phase 1 AI:      0.683
  Phase 2 Control: 0.655
  Change:          -0.028

INTERPRETATION:
  If TG1's Control accuracy is NOT significantly below their AI accuracy,
  this suggests a LEARNING EFFECT: the AI helped them develop skills
  that persisted even after AI was removed.
  Compare TG1 Control to TG0 Control for the strongest evidence.

```
```text
<Figure size 2160x720 with 3 Axes>
```

## 7. Reversion Rate Trends

#### Output
```text
<Figure size 1200x600 with 1 Axes>
```
```text
Reversion trend: r=-0.047, p=0.0090
  Positive r = increasing reversions over time

```

## 8. AI Deliberation Time: Mechanism Investigation

#### Output
```text
§8. AI Deliberation Time: Are Participants Shortcutting?

── M1: Following AI vs Rejecting AI → Trial Duration ──
  Followed AI:  M=24.78s, SD=15.59s, n=2014
  Rejected AI:  M=25.54s, SD=15.49s, n=1036
  Difference:   -0.76s
  t-test (2-sided): t=-1.285, p=0.1987
  Mann-Whitney (followed < rejected): U=997086.5, p=0.0225

  → No significant difference in decision time by AI agreement.

── Duration for Correct vs Incorrect Decisions (AI trials) ──
  Correct: M=24.79s | Wrong: M=25.55s
  t=-1.257, p=0.2090

── M2: Increasing AI Reliance → Increasing Speed-Up? ──
  Spearman r=-0.020, p=0.8756
  (Negative r = more reliance growth → more speed-up, i.e. trust shortcut accumulates)

── M3: Is Speed-Up Stronger in AI Than Control? ──
  Control speed-up:  M=-3.68s
  AI speed-up:       M=-18.25s
  Difference:        -14.57s
  t-test: t=-8.904, p=0.0000
  → AI condition produces SIGNIFICANTLY MORE speed-up than Control.
    This is condition-specific, not pure task habituation.

── Mixed Model: trial_duration ~ is_ai × within_phase_trial ──
  is_ai                               β=+27.050  SE=0.601  p=0.0000  ***
  within_phase_trial                  β=-0.088  SE=0.014  p=0.0000  ***
  is_ai:within_phase_trial            β=-0.344  SE=0.020  p=0.0000  ***

  ⚠  Key coefficient: is_ai:within_phase_trial
     Negative & significant = AI condition speeds up FASTER over time
     This confirms the AI shortcutting is progressive, not just a level shift

```
```text
<Figure size 2520x720 with 3 Axes>
```

## Findings & Next Steps

**Summarize after running:**

1. Learning curves: is there improvement over trials?
2. Speed trends: are participants speeding up (fatigue/disengagement)?
3. Fatigue crash: any sharp drop-off point?
4. AI reliance drift: does over-reliance increase with fatigue?
5. Carry-over effects: does Phase 1 condition affect Phase 2?
6. Reversion trends over time

**Next**: NB4 for psychometric analysis.


---

# NB4_psychometrics.ipynb

# NB4 — Psychometrics & Motivation Analysis

**Purpose**: Link personality traits (Big Five) and IQ to task performance.  
Covers IQ=0 analysis, Big5 correlations, personality profiles, and predictive modeling.

> **Note**: Only 58 of 68 participants have psychometric data.  
> The 10 TG=1 dropouts have no Big5/IQ scores and are excluded from all analyses here.

---

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════
Participants with psychometrics: 58 / 68
  Completers: 51
  Dropouts: 7

```

## 1. IQ Score Analysis

31 of 58 participants scored IQ=0. Is this a motivation issue?

#### Output
```text
=== IQ Score Distribution ===
count    58.000000
mean      1.155172
std       1.641584
min       0.000000
25%       0.000000
50%       0.000000
75%       2.000000
max       6.000000
Name: iq_score, dtype: float64

IQ=0: 31 (53.4%)
IQ>0: 27 (46.6%)

```
```text
<Figure size 2160x720 with 3 Axes>
```

#### Output
```text
=== IQ=0 vs IQ>0 Comprehensive Comparison ===

```
```text
                 Metric IQ=0 (mean±SD) IQ>0 (mean±SD)      t       p      d  \
0      Overall Accuracy    0.663±0.034    0.668±0.040   0.51  0.6153   0.13   
1      Control Accuracy    0.648±0.065    0.669±0.059   1.25  0.2176   0.33   
2           AI Accuracy    0.680±0.056    0.666±0.061  -0.86  0.3943  -0.24   
3     Mean Duration (s)   14.462±4.567   16.461±4.772   1.63  0.1091   0.43   
4    Over-reliance Rate    0.156±0.046    0.177±0.049   1.59  0.1193   0.44   
5       Skepticism Rate    0.164±0.073    0.158±0.061  -0.37  0.7162  -0.10   
6  Decision Change Rate    0.087±0.083    0.105±0.079   0.81  0.4239   0.23   

  sig  
0      
1      
2      
3      
4      
5      
6      
```

#### Output
```text
<Figure size 1680x720 with 2 Axes>
```
```text
=== Statistical Tests: IQ Score as Continuous Predictor ===
1. IQ vs Accuracy (IQ>0): Spearman r=-0.075, p=0.710
2. IQ Time Remaining vs IQ Score: Spearman r=-0.674, p=0.000

=== OLS Regression: Overall Accuracy ~ IQ Score (IQ>0) ===
           Coef.  Std.Err.        t   P>|t|  [0.025  0.975]
const     0.6776    0.0146  46.4391  0.0000  0.6475  0.7076
iq_score -0.0038    0.0050  -0.7615  0.4535 -0.0141  0.0065

```

## 2a. Big Five Personality Correlations

#### Output
```text
=== Big Five × Performance Correlations (Spearman) ===

```
```text
           Big5 Trait Performance Metric      r      p   n sig
0       Agreeableness        Overall Acc -0.287  0.029  58   *
1       Agreeableness        Control Acc -0.453  0.000  58   *
2       Agreeableness             AI Acc  0.177  0.214  51    
3       Agreeableness      Over-reliance -0.103  0.474  51    
4       Agreeableness         Skepticism -0.047  0.742  51    
5       Agreeableness      Mean Duration  0.120  0.372  58    
6   Conscientiousness        Overall Acc  0.078  0.558  58    
7   Conscientiousness        Control Acc -0.028  0.836  58    
8   Conscientiousness             AI Acc  0.150  0.292  51    
9   Conscientiousness      Over-reliance -0.040  0.779  51    
10  Conscientiousness         Skepticism -0.105  0.463  51    
11  Conscientiousness      Mean Duration  0.103  0.444  58    
12       Extraversion        Overall Acc -0.019  0.890  58    
13       Extraversion        Control Acc  0.214  0.107  58    
14       Extraversion             AI Acc -0.271  0.054  51   †
15       Extraversion      Over-reliance -0.165  0.247  51    
16       Extraversion         Skepticism  0.352  0.011  51   *
17       Extraversion      Mean Duration  0.011  0.936  58    
18        Neuroticism        Overall Acc  0.102  0.448  58    
19        Neuroticism        Control Acc  0.128  0.337  58    
20        Neuroticism             AI Acc -0.079  0.583  51    
21        Neuroticism      Over-reliance -0.226  0.110  51    
22        Neuroticism         Skepticism  0.284  0.044  51   *
23        Neuroticism      Mean Duration  0.089  0.508  58    
24    Open_mindedness        Overall Acc  0.113  0.398  58    
25    Open_mindedness        Control Acc  0.111  0.408  58    
26    Open_mindedness             AI Acc -0.044  0.760  51    
27    Open_mindedness      Over-reliance -0.182  0.202  51    
28    Open_mindedness         Skepticism  0.171  0.230  51    
29    Open_mindedness      Mean Duration  0.258  0.050  58   †
```
```text

=== Highlight: Significant & Marginal Correlations (p < 0.1) ===
  Agreeableness x Overall Acc: r=-0.287, p=0.0288 *
  Agreeableness x Control Acc: r=-0.453, p=0.0004 **
  Extraversion x AI Acc: r=-0.271, p=0.0542 †
  Extraversion x Skepticism: r=0.352, p=0.0112 *
  Neuroticism x Skepticism: r=0.284, p=0.0436 *
  Open_mindedness x Mean Duration: r=0.258, p=0.0504 †

```

#### Output
```text
<Figure size 1440x720 with 2 Axes>
```

## 2b. FDR-Corrected Big5 × Performance Correlations

#### Output
```text
§2b. Big Five × Performance: Spearman Correlations with FDR Correction
     Method: Benjamini-Hochberg (q < 0.05)

Trait                Metric                 r     p_raw  sig_raw     p_fdr  sig_fdr Survives?
------------------------------------------------------------------------------------------
  Agreeableness      Control Acc       -0.453    0.0004      ***    0.0054       **  ✓
  Agreeableness      Overall Acc       -0.287    0.0288        *    0.2162           ✗
  Extraversion       Control Acc       +0.214    0.1067             0.4128           ✗
  Neuroticism        Over-reliance     -0.226    0.1101             0.4128           ✗
  Open-Mindedness    Over-reliance     -0.182    0.2023             0.6070           ✗
  Extraversion       Over-reliance     -0.165    0.2472             0.6180           ✗
  Neuroticism        Control Acc       +0.128    0.3367             0.6461           ✗
  Open-Mindedness    Overall Acc       +0.113    0.3977             0.6461           ✗
  Open-Mindedness    Control Acc       +0.111    0.4079             0.6461           ✗
  Neuroticism        Overall Acc       +0.102    0.4478             0.6461           ✗
  Agreeableness      Over-reliance     -0.103    0.4738             0.6461           ✗
  Conscientiousness  Overall Acc       +0.078    0.5584             0.6980           ✗
  Conscientiousness  Over-reliance     -0.040    0.7789             0.8900           ✗
  Conscientiousness  Control Acc       -0.028    0.8363             0.8900           ✗
  Extraversion       Overall Acc       -0.019    0.8900             0.8900           ✗

Findings surviving FDR correction: 1/15

  ✓ Agreeableness × Control Acc: r=-0.453, p_fdr=0.0054


```
```text
<Figure size 2160x720 with 4 Axes>
```

## 3. Neuroticism & Performance Stability

Does high neuroticism correlate with bigger accuracy drops over time?

#### Output
```text
<Figure size 2160x720 with 3 Axes>
```
```text
=== Statistical Tests: Personality & Stability ===
1. Neuroticism vs Accuracy Drop: Spearman r=-0.112, p=0.401
2. Conscientiousness vs Trial Duration: Spearman r=0.103, p=0.444
3. Neuroticism vs Over-reliance: Spearman r=-0.226, p=0.110

```

## 4. PCA & Personality Profiles

#### Output
```text
<Figure size 2160x720 with 4 Axes>
```

## 5. Exploratory Regression: Predicting Accuracy from Psychometrics

#### Output
```text
=== OLS Regression: Overall Accuracy ~ Big5 + IQ ===
                         Coef.  Std.Err.        t   P>|t|  [0.025  0.975]
const                   0.7081    0.0563  12.5834  0.0000  0.5952  0.8211
big5_agreeableness     -0.0194    0.0097  -1.9981  0.0511 -0.0389  0.0001
big5_conscientiousness  0.0079    0.0079   1.0024  0.3209 -0.0079  0.0236
big5_extraversion      -0.0082    0.0080  -1.0199  0.3126 -0.0243  0.0079
big5_neuroticism        0.0006    0.0070   0.0865  0.9314 -0.0135  0.0147
big5_open_mindedness    0.0076    0.0093   0.8123  0.4204 -0.0112  0.0263
iq_score               -0.0013    0.0031  -0.4277  0.6707 -0.0075  0.0049

R² = 0.104, Adj. R² = -0.001
F(6, 51) = 0.990, p = 0.4422
n = 58

⚠️  Interpret with caution at n=58. Exploratory only.

=== Multicollinearity Test (Variance Inflation Factor) ===
               Feature  VIF Score
    big5_agreeableness       1.10
big5_conscientiousness       1.30
     big5_extraversion       1.28
      big5_neuroticism       1.25
  big5_open_mindedness       1.42
              iq_score       1.08

Diagnostics: VIF < 5 is good. VIF > 5 indicates problematic multicollinearity.

```

#### Output
```text
<Figure size 1200x720 with 1 Axes>
```

## Findings & Next Steps

**Summarize after running:**

1. IQ=0 group characteristics and performance implications
2. Big5 correlates of performance (any significant personality predictors?)
3. Neuroticism → performance stability link
4. Conscientiousness → engagement/duration link
5. PCA personality profiles and their relation to accuracy
6. Regression model: how much variance explained?

**Next**: NB5 for integrated mixed-effects models combining all dimensions.


---

# NB5_integrated_models.ipynb

# NB5 — Integrated Models

**Purpose**: Combine all dimensions into multivariate models.  
Covers mixed-effects logistic regression, interaction effects, and mediation analysis.

> This is an exploratory notebook. Results should be interpreted with caution given the sample size.

---

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════
Total trials: 5950, Participants: 68

```

## 1. Mixed-Effects Logistic Regression: Base Model

`user_correct ~ is_ai + within_phase_trial + kl_severity + (1 | participant_id)`

#### Output
```text
Model data: 4522 trials, 68 participants
=== Model 1: Base Mixed-Effects Model ===
            Mixed Linear Model Regression Results
==============================================================
Model:              MixedLM  Dependent Variable:  user_correct
No. Observations:   4522     Method:              ML          
No. Groups:         68       Scale:               0.2083      
Min. group size:    38       Log-Likelihood:      -2884.3576  
Max. group size:    76       Converged:           Yes         
Mean group size:    66.5                                      
--------------------------------------------------------------
                     Coef. Std.Err.   z    P>|z| [0.025 0.975]
--------------------------------------------------------------
Intercept            0.568    0.015 37.608 0.000  0.539  0.598
is_ai                0.024    0.014  1.756 0.079 -0.003  0.051
within_phase_trial_z 0.004    0.012  0.382 0.702 -0.019  0.028
kl_severity_num      0.088    0.008 10.351 0.000  0.071  0.104
Group Var            0.002    0.002                           
==============================================================


```
```text
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:2237: ConvergenceWarning: The MLE may be on the boundary of the parameter space.
  warnings.warn(msg, ConvergenceWarning)

```

# 1.1 Mixed Logistic Regression (GLMM)

`user_correct ~ is_ai + within_phase_trial + kl_severity + (1 | participant_id)`

#### Output
```text
Model data: 4522 trials, 68 participants
=== Mixed Logistic Regression (GLMM) ===
                    Binomial Mixed GLM Results
===================================================================
                     Type Post. Mean Post. SD   SD  SD (LB) SD (UB)
-------------------------------------------------------------------
Intercept               M     0.2319   0.0325                      
is_ai                   M     0.1168   0.0458                      
within_phase_trial_z    M     0.0208   0.0562                      
kl_severity_num         M     0.4388   0.0243                      
participant             V    -1.5338   0.0864 0.216   0.181   0.256
===================================================================
Parameter types are mean structure (M) and variance structure (V)
Variance parameters are modeled as log standard deviations

```

## 2. Model with Interaction: Condition × Time

Does the fatigue effect differ by condition?

#### Output
```text
=== Model 2: With Condition × Time Interaction ===
                Mixed Linear Model Regression Results
=====================================================================
Model:                 MixedLM    Dependent Variable:    user_correct
No. Observations:      4522       Method:                ML          
No. Groups:            68         Scale:                 0.2083      
Min. group size:       38         Log-Likelihood:        -2883.5780  
Max. group size:       76         Converged:             Yes         
Mean group size:       66.5                                          
---------------------------------------------------------------------
                           Coef.  Std.Err.   z    P>|z| [0.025 0.975]
---------------------------------------------------------------------
Intercept                   0.568    0.015 37.564 0.000  0.538  0.597
is_ai                       0.025    0.014  1.800 0.072 -0.002  0.052
within_phase_trial_z        0.019    0.017  1.160 0.246 -0.013  0.052
is_ai:within_phase_trial_z -0.029    0.023 -1.249 0.212 -0.075  0.017
kl_severity_num             0.088    0.008 10.373 0.000  0.071  0.105
Group Var                   0.002    0.002                           
=====================================================================


--- Model Comparison ---
Model 1 AIC: 5780.7, BIC: 5819.2
Model 2 AIC: 5781.2, BIC: 5826.1
Lower AIC/BIC = better fit

```
```text
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:2237: ConvergenceWarning: The MLE may be on the boundary of the parameter space.
  warnings.warn(msg, ConvergenceWarning)

```

## 3. Model with Psychometrics

Add IQ and Big5 traits (only for participants with psychometric data).

#### Output
```text
Model 3 data: 4142 trials, 58 participants
=== Model 3: With Psychometrics ===
                Mixed Linear Model Regression Results
=====================================================================
Model:                 MixedLM    Dependent Variable:    user_correct
No. Observations:      4142       Method:                ML          
No. Groups:            58         Scale:                 0.2094      
Min. group size:       38         Log-Likelihood:        -2648.8624  
Max. group size:       76         Converged:             Yes         
Mean group size:       71.4                                          
---------------------------------------------------------------------
                           Coef.  Std.Err.   z    P>|z| [0.025 0.975]
---------------------------------------------------------------------
Intercept                   0.567    0.015 37.298 0.000  0.537  0.597
is_ai                       0.020    0.014  1.399 0.162 -0.008  0.048
within_phase_trial_z        0.019    0.017  1.135 0.256 -0.014  0.052
is_ai:within_phase_trial_z -0.033    0.025 -1.341 0.180 -0.081  0.015
kl_severity_num             0.089    0.009  9.958 0.000  0.071  0.106
iq_score_c                 -0.005    0.005 -1.019 0.308 -0.016  0.005
big5_neuroticism_c          0.027    0.011  2.469 0.014  0.006  0.049
big5_conscientiousness_c   -0.010    0.012 -0.809 0.419 -0.034  0.014
Group Var                   0.001    0.002                           
=====================================================================


```
```text
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/base/model.py:607: ConvergenceWarning: Maximum Likelihood optimization failed to converge. Check mle_retvals
  warnings.warn("Maximum Likelihood optimization failed to "
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:2200: ConvergenceWarning: Retrying MixedLM optimization with lbfgs
  warnings.warn(
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:1634: UserWarning: Random effects covariance is singular
  warnings.warn(msg)
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:2237: ConvergenceWarning: The MLE may be on the boundary of the parameter space.
  warnings.warn(msg, ConvergenceWarning)

```

#### Output
```text
<Figure size 1920x720 with 2 Axes>
```

## 4. Mediation Analysis: Does Confidence Mediate AI → Accuracy?

Path: AI assistance → User confidence → Accuracy

#### Output
```text
=== Mediation Analysis: AI → Confidence → Accuracy ===
n = 5950 trials

Path c (AI → Accuracy): β=0.0165, p=0.1773

```
```text
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:2237: ConvergenceWarning: The MLE may be on the boundary of the parameter space.
  warnings.warn(msg, ConvergenceWarning)

```
```text
Path a (AI → Confidence): β=-0.0353, p=0.3167
Path c' (AI → Accuracy, controlling for confidence): β=0.0199, p=0.1016
Path b (Confidence → Accuracy, controlling for AI): β=0.0548, p=0.0000

Indirect effect (a × b): -0.0019
Total effect (c): 0.0165
Proportion mediated: -11.7%

⚠️  For formal mediation, consider bootstrap CIs (e.g., via process or custom bootstrap)

```
```text
/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/venv/lib/python3.13/site-packages/statsmodels/regression/mixed_linear_model.py:2237: ConvergenceWarning: The MLE may be on the boundary of the parameter space.
  warnings.warn(msg, ConvergenceWarning)

```

## 5. Model Summary & Comparison

#### Output
```text
=== Model Comparison ===

```
```text
                 Model  n_trials  n_participants       AIC       BIC  \
0             M1: Base      4522              68  5780.715  5819.215   
1    M2: + Interaction      4522              68  5781.156  5826.073   
2  M3: + Psychometrics      4142              58  5317.725  5381.014   

   AI_effect_p  
0        0.079  
1        0.072  
2        0.162  
```

## Findings & Next Steps

**Summarize after running:**

1. Does AI condition significantly predict accuracy after controlling for time and difficulty?
2. Is there a condition × time interaction (differential fatigue)?
3. Do psychometric variables add predictive value?
4. Does confidence mediate the AI → accuracy relationship?
5. Which model fits best based on AIC/BIC?

---

**Pipeline complete.** All analyses from NB0–NB5 provide a comprehensive, defensible investigation of the PerCoTate experiment.


---

# NB6_label_noise_audit.ipynb

# NB6 — Label Noise Audit

**Purpose**: Explore potential label noise in the “ground_truth_binary” column by finding trials where *both* the AI model and the human consensus significantly disagree with the provided ground truth.

#### Output
```text
═══════════════════════════════════════════════════════
  RADIOLOGIST GROUND TRUTH APPLIED
═══════════════════════════════════════════════════════
  Amb images excluded:  13 images, 1547 trials
  Rows:                 5950 → 5950
  Label flips:          1190 trials (10 images)
  Flipped images:       ['8.png', '9.png', '10.png', '13.png', '17.png', '21.png', '25.png', '41.png', '44.png', '50.png']
  New class balance:    0=2261  1=3689
═══════════════════════════════════════════════════════

```

## 1. Grouping by Image
We calculate the total votes and disagreement counts for each unique image.

## 2. Statistical Testing (Binomial Test)
Null Hypothesis: Humans choose the ground truth label with probability ≥ 0.5. If they systematically choose the incorrect label at a significant rate (p < 0.05), the ground truth is likely noisy.

#### Output
```text
Found 4 candidate images with significant label noise.

```
```text
   trial_original_image_name  ground_truth  ai_pred  human_pred  \
49              9998089R.png           1.0        0         0.0   
41              9788301L.png           1.0        0         0.0   
20              9299531R.png           0.0        1         1.0   
40              9719890R.png           1.0        0         0.0   

    disagree_votes  total_votes  disagree_ratio       p_value  
49              97          119        0.815126  9.959377e-13  
41              96          119        0.806723  4.267672e-12  
20              81          119        0.680672  5.028935e-05  
40              70          119        0.588235  3.314567e-02  
```

## 3. Per-Image Difficulty Analysis

#### Output
```text
======================================================================
§3. Per-Image Difficulty Analysis
======================================================================

Total unique images: 50
Trials per image: {'min': 119.0, 'mean': 119.0, 'max': 119.0}

--- Difficulty Distribution ---
  Very Difficult (<40%): 5 images (10.0%)
  Ambiguous (40-60%): 15 images (30.0%)
  Moderate (60-80%): 14 images (28.0%)
  Easy (>80%): 16 images (32.0%)

--- 10 Most Difficult Images (lowest human accuracy) ---
trial_original_image_name kl_severity  ground_truth  ai_prediction  human_accuracy  ai_accuracy      binom_p  human_ai_agreement
             9998089R.png    moderate           1.0              0        0.184874          0.0 1.991875e-12            0.836066
             9788301L.png        mild           1.0              0        0.193277          0.0 8.535344e-12            0.803279
             9299531R.png    doubtful           0.0              1        0.319328          0.0 1.005787e-04            0.721311
             9142551R.png        mild           1.0              1        0.352941          1.0 1.710529e-03            0.442623
             9911788L.png        mild           1.0              1        0.378151          1.0 9.966324e-03            0.393443
             9719890R.png        mild           1.0              0        0.411765          0.0 6.629133e-02            0.639344
             9143031L.png    doubtful           0.0              0        0.420168          1.0 9.852363e-02            0.491803
             9466142R.png        mild           1.0              0        0.428571          0.0 1.421320e-01            0.557377
             9354156R.png        mild           1.0              1        0.436975          1.0 1.991584e-01            0.606557
             9827858L.png        mild           1.0              1        0.436975          1.0 1.991584e-01            0.459016

--- 10 Easiest Images (highest human accuracy) ---
trial_original_image_name kl_severity  ground_truth  ai_prediction  human_accuracy  ai_accuracy      binom_p  human_ai_agreement
             9626432R.png        mild           1.0              0        0.907563          0.0 3.524446e-21            0.147541
             9037494R.png        mild           1.0              1        0.915966          1.0 3.518196e-22            0.950820
             9683886R.png        mild           1.0              1        0.932773          1.0 2.539588e-24            0.950820
             9075939L.png        mild           1.0              1        0.983193          1.0 2.148917e-32            0.983607
             9267247L.png      severe           1.0              1        0.983193          1.0 2.148917e-32            0.967213
             9271965R.png      severe           1.0              1        0.983193          1.0 2.148917e-32            0.983607
             9667180L.png     healthy           0.0              0        0.991597          1.0 3.611119e-34            1.000000
             9311154L.png    moderate           1.0              1        0.991597          1.0 3.611119e-34            0.983607
             9113018R.png        mild           1.0              1        1.000000          1.0 3.009266e-36            1.000000
             9056326L.png      severe           1.0              1        1.000000          1.0 3.009266e-36            1.000000

--- Known Noisy Images (NB6 §2) ---
trial_original_image_name kl_severity  ground_truth  ai_prediction  human_accuracy  ai_accuracy      binom_p  human_ai_agreement
             9023935L.png    moderate           1.0              1        0.865546          1.0 9.546634e-17            0.901639
             9299531R.png    doubtful           0.0              1        0.319328          0.0 1.005787e-04            0.721311
             9360243L.png    moderate           1.0              1        0.764706          1.0 5.801974e-09            0.803279
             9788301L.png        mild           1.0              0        0.193277          0.0 8.535344e-12            0.803279
             9998089R.png    moderate           1.0              0        0.184874          0.0 1.991875e-12            0.836066

--- Human Accuracy by KL Severity (Image-Level) ---
             count   mean    std    min    25%    50%    75%    max
kl_severity                                                        
doubtful      12.0  0.602  0.162  0.319  0.521  0.597  0.672  0.874
healthy        6.0  0.660  0.192  0.487  0.527  0.601  0.731  0.992
mild          21.0  0.643  0.237  0.193  0.437  0.639  0.840  1.000
moderate       8.0  0.707  0.241  0.185  0.666  0.735  0.847  0.992
severe         3.0  0.989  0.010  0.983  0.983  0.983  0.992  1.000

Human vs AI accuracy correlation (per image): r=0.306, p=0.0308
  (high r = humans and AI agree on which images are hard)


```
```text
/var/folders/1g/t32yf_mn5pd5ymkl2yywtctr0000gn/T/ipykernel_79347/3338247030.py:122: FutureWarning: 

Passing `palette` without assigning `hue` is deprecated and will be removed in v0.14.0. Assign the `x` variable to `hue` and set `legend=False` for the same effect.

  sns.boxplot(data=kl_data, x='kl_severity', y='human_accuracy',

```
```text
<Figure size 2520x1440 with 6 Axes>
```
```text

--- Complete Per-Image Difficulty Table (sorted by accuracy) ---
trial_original_image_name kl_severity  ground_truth_raw  human_accuracy  ai_accuracy binom_p  binom_significant   difficulty_category  mean_confidence  human_ai_agreement
             9998089R.png    moderate               3.0           0.185          0.0  0.0000               True Very Difficult (<40%)             5.34               0.836
             9788301L.png        mild               2.0           0.193          0.0  0.0000               True Very Difficult (<40%)             5.39               0.803
             9299531R.png    doubtful               1.0           0.319          0.0  0.0001               True Very Difficult (<40%)             4.97               0.721
             9142551R.png        mild               2.0           0.353          1.0  0.0017               True Very Difficult (<40%)             4.99               0.443
             9911788L.png        mild               2.0           0.378          1.0  0.0100               True Very Difficult (<40%)             4.97               0.393
             9719890R.png        mild               2.0           0.412          0.0  0.0663              False    Ambiguous (40-60%)             4.92               0.639
             9143031L.png    doubtful               1.0           0.420          1.0  0.0985              False    Ambiguous (40-60%)             5.03               0.492
             9466142R.png        mild               2.0           0.429          0.0  0.1421              False    Ambiguous (40-60%)             5.14               0.557
             9354156R.png        mild               2.0           0.437          1.0  0.1992              False    Ambiguous (40-60%)             5.07               0.607
             9827858L.png        mild               2.0           0.437          1.0  0.1992              False    Ambiguous (40-60%)             5.09               0.459
             9598675R.png    doubtful               1.0           0.471          1.0  0.5825              False    Ambiguous (40-60%)             4.98               0.557
             9870268R.png     healthy               0.0           0.487          1.0  0.8546              False    Ambiguous (40-60%)             5.19               0.590
             9261557L.png     healthy               0.0           0.504          1.0  1.0000              False    Ambiguous (40-60%)             5.17               0.492
             9253225L.png        mild               2.0           0.513          0.0  0.8546              False    Ambiguous (40-60%)             5.32               0.541
             9097360L.png    doubtful               1.0           0.538          1.0  0.4635              False    Ambiguous (40-60%)             4.91               0.557
             9534110L.png        mild               2.0           0.563          1.0  0.1992              False    Ambiguous (40-60%)             4.95               0.689
             9397988L.png    doubtful               1.0           0.580          0.0  0.0985              False    Ambiguous (40-60%)             4.96               0.443
             9648224L.png    doubtful               1.0           0.597          0.0  0.0433               True    Ambiguous (40-60%)             5.08               0.443
             9717450L.png     healthy               0.0           0.597          1.0  0.0433               True    Ambiguous (40-60%)             5.23               0.689
             9140556L.png    doubtful               1.0           0.597          0.0  0.0433               True    Ambiguous (40-60%)             5.08               0.410
             9645608L.png     healthy               0.0           0.605          1.0  0.0274               True     Moderate (60-80%)             4.90               0.590
             9862321L.png    doubtful               1.0           0.613          0.0  0.0168               True     Moderate (60-80%)             5.05               0.607
             9797850R.png    moderate               3.0           0.622          1.0  0.0100               True     Moderate (60-80%)             5.22               0.656
             9043461R.png        mild               2.0           0.622          0.0  0.0100               True     Moderate (60-80%)             4.84               0.393
             9035779L.png        mild               2.0           0.639          1.0  0.0032               True     Moderate (60-80%)             5.03               0.574
             9043461L.png    doubtful               1.0           0.664          1.0  0.0004               True     Moderate (60-80%)             5.19               0.738
             9008884R.png    moderate               3.0           0.681          0.0  0.0001               True     Moderate (60-80%)             5.03               0.377
             9046206L.png        mild               2.0           0.689          0.0  0.0000               True     Moderate (60-80%)             4.96               0.311
             9100699L.png    doubtful               1.0           0.697          1.0  0.0000               True     Moderate (60-80%)             5.07               0.738
             9606955R.png    moderate               3.0           0.706          0.0  0.0000               True     Moderate (60-80%)             5.24               0.361
             9448315L.png        mild               2.0           0.714          1.0  0.0000               True     Moderate (60-80%)             5.41               0.820
             9810475L.png        mild               2.0           0.731          0.0  0.0000               True     Moderate (60-80%)             5.19               0.344
             9360243L.png    moderate               3.0           0.765          1.0  0.0000               True     Moderate (60-80%)             5.39               0.803
             9872350R.png     healthy               0.0           0.773          1.0  0.0000               True     Moderate (60-80%)             5.34               0.787
             9322109R.png        mild               2.0           0.824          1.0  0.0000               True           Easy (>80%)             5.34               0.869
             9305336L.png        mild               2.0           0.840          0.0  0.0000               True           Easy (>80%)             5.05               0.213
             9304828L.png    moderate               3.0           0.840          1.0  0.0000               True           Easy (>80%)             5.55               0.902
             9480211R.png    doubtful               1.0           0.857          1.0  0.0000               True           Easy (>80%)             5.61               0.852
             9023935L.png    moderate               3.0           0.866          1.0  0.0000               True           Easy (>80%)             5.18               0.902
             9166468R.png    doubtful               1.0           0.874          1.0  0.0000               True           Easy (>80%)             5.70               0.852
             9626432R.png        mild               2.0           0.908          0.0  0.0000               True           Easy (>80%)             5.29               0.148
             9037494R.png        mild               2.0           0.916          1.0  0.0000               True           Easy (>80%)             5.79               0.951
             9683886R.png        mild               2.0           0.933          1.0  0.0000               True           Easy (>80%)             5.92               0.951
             9075939L.png        mild               2.0           0.983          1.0  0.0000               True           Easy (>80%)             6.13               0.984
             9267247L.png      severe               4.0           0.983          1.0  0.0000               True           Easy (>80%)             6.47               0.967
             9271965R.png      severe               4.0           0.983          1.0  0.0000               True           Easy (>80%)             6.69               0.984
             9667180L.png     healthy               0.0           0.992          1.0  0.0000               True           Easy (>80%)             6.36               1.000
             9311154L.png    moderate               3.0           0.992          1.0  0.0000               True           Easy (>80%)             6.18               0.984
             9113018R.png        mild               2.0           1.000          1.0  0.0000               True           Easy (>80%)             6.30               1.000
             9056326L.png      severe               4.0           1.000          1.0  0.0000               True           Easy (>80%)             6.58               1.000

```

## 4. Image-Level Analysis: AI-Correct vs AI-Wrong Images

#### Output
```text
§4. AI-Correct vs AI-Wrong Images: Population Comparison

  AI-correct images: 33
  AI-wrong images:   17

Metric                 AI-Correct M(SD)       AI-Wrong M(SD)              t       p      d
----------------------------------------------------------------------------------------
  Human Accuracy       0.718(0.214)        0.565(0.204)         +2.43  0.0187  +0.73 *
  AI Agreement Rate    0.754(0.194)        0.479(0.195)         +4.73  0.0000  +1.41 ***
  Over-Reliance Rate   0.000(0.000)        0.479(0.195)        -14.25  0.0000  -3.47 ***
  Skepticism Rate      0.246(0.194)        0.000(0.000)         +5.22  0.0000  +1.80 ***
  Mean Confidence      5.483(0.545)        5.110(0.163)         +2.75  0.0084  +0.93 **

── KL Severity Distribution (AI-correct vs AI-wrong) ──
kl_severity  doubtful  healthy  mild  moderate  severe
ai_accuracy                                           
AI Correct          7        6    12         5       3
AI Wrong            5        0     9         3       0
  Chi-square: χ²=5.73, p=0.2204

── AI-Wrong: Noisy Label vs Genuinely Difficult ──
  Noisy (inverted label):  n=3, human_acc=0.232, agreement=0.787
  Genuinely difficult:     n=14, human_acc=0.637, agreement=0.413


```
```text
/var/folders/1g/t32yf_mn5pd5ymkl2yywtctr0000gn/T/ipykernel_79347/3841925601.py:131: FutureWarning: 

Passing `palette` without assigning `hue` is deprecated and will be removed in v0.14.0. Assign the `x` variable to `hue` and set `legend=False` for the same effect.

  sns.boxplot(data=rel_data, x='AI Status', y='Over-Reliance', ax=axes[2],

```
```text
<Figure size 2520x720 with 3 Axes>
```

## Findings
These printed `trial_original_image_name` files have an artificially inverted `ground_truth_binary`. The AI model correctly identified them, and the vast majority of human annotators strongly agreed with the AI rather than the assigned ground truth at a statistically significant level.


---

