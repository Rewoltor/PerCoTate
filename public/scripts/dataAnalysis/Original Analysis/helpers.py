"""
helpers.py — Shared utilities for PerCoTate Data Analysis
=========================================================

Central module imported by every notebook. Provides:
  - Data loading and type casting
  - Derived variable computation
  - Participant-level aggregation
  - Speeder detection
  - Plotting helpers and constants

Usage:
    from helpers import load_and_clean, derive_variables, COLORS, CSV_PATH
"""

import os
import warnings
import numpy as np
import pandas as pd

# Set to True  → use radiologist consensus ground truth (amb cases excluded)
# Set to False → use original database ground truth (unchanged behavior)
USE_RADIOLOGIST_GROUND_TRUTH = True

# How to handle KL1 (ambiguous/doubtful) images when radiologist GT is used:
# "exclude"          — drop all trials for ambiguous images
# "keep_as_positive" — treat KL1 as diseased (binary=1)
# "keep_as_negative" — treat KL1 as healthy  (binary=0)
RADIOLOGIST_AMBIGUOUS_ACTION = "exclude"

# ─────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────

# Default CSV path (relative to this file's directory)
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(
    _THIS_DIR,
    "..", "outputs", "csv", "export_2026.04.13_14:29_1", "participants.csv"
)

# Symptom Hungarian → English mapping
SYMPTOM_MAP = {
    "nincsen": "none",
    "tunet": "symptom",
    "bizonytalan": "uncertain",
}

# KL grade → severity label
KL_SEVERITY_MAP = {
    0: "healthy",
    1: "doubtful",
    2: "mild",
    3: "moderate",
    4: "severe",
}

# Consistent color palette for plots
COLORS = {
    "control": "#4C72B0",       # blue
    "ai": "#DD8452",            # orange
    "correct": "#55A868",       # green
    "incorrect": "#C44E52",     # red
    "over_reliance": "#8172B3", # purple
    "skepticism": "#CCB974",    # gold
    "neutral": "#64B5CD",       # light blue
}

CONDITION_PALETTE = {"Control": COLORS["control"], "AI-Assisted": COLORS["ai"]}

RADIO_GT_PATH = os.path.join(_THIS_DIR, "Radiologist_Ground_Truth.csv")

# ─────────────────────────────────────────────
# Data Loading & Cleaning
# ─────────────────────────────────────────────

def load_and_clean(csv_path: str | None = None) -> pd.DataFrame:
    """
    Load the participants CSV and apply type casting + chronological sorting.

    Returns a DataFrame with proper dtypes and a sequential `trial_order`
    column (1-based, per participant, sorted by trial_end_time).
    """
    if csv_path is None:
        csv_path = CSV_PATH

    df = pd.read_csv(csv_path)


    # ── Numeric columns ──
    numeric_cols = [
        "age", "ai_confidence", "ai_prediction", "confidence",
        "ground_truth_binary", "ground_truth_raw",
        "trial_duration", "trial_end_time", "trial_start_time",
    ]
    # These may be absent in control trials (empty strings)
    optional_numeric = [
        "initial_confidence", "final_confidence",
        "initial_decision", "final_decision",
        "iq_score", "iq_time_remaining",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in optional_numeric:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # ── Boolean columns ──
    # ai_shown: pandas auto-parses True/False as bool
    df["ai_shown"] = df["ai_shown"].astype(bool)
    # reverted_decision: mixed True/False strings + NaN (empty in control trials)
    df["reverted_decision"] = df["reverted_decision"].map(
        {True: True, False: False, "True": True, "False": False}
    )  # NaN stays NaN

    # ── Big 5 traits & facets ──
    big5_cols = [c for c in df.columns if c.startswith("big5_") or c.startswith("facet_")]
    for col in big5_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # ── Timestamps ──
    for col in ["big5_timestamp", "iq_completed_at",
                 "phase1_completed_at", "phase2_completed_at"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

    # ── Categorical ──
    df["treatment_group"] = df["treatment_group"].astype(str)
    df["participant_id"] = df["participant_id"].astype(str)

    # ── Chronological sort & trial order ──
    df = df.sort_values(
        ["participant_id", "trial_end_time"]
    ).reset_index(drop=True)

    df["trial_order"] = (
        df.groupby("participant_id").cumcount() + 1
    )

    # Determine completion status BEFORE any rows are potentially dropped
    # by the radiologist GT filter (which removes 'amb' cases).
    _max_trials = df.groupby("participant_id")["trial_order"].transform("max")
    df["is_completer"] = _max_trials >= 100

    # ── Radiologist GT swap (toggle) ──
    if USE_RADIOLOGIST_GROUND_TRUTH:
        df = _apply_radiologist_ground_truth(df, ambiguous_action=RADIOLOGIST_AMBIGUOUS_ACTION)

    return df


def _apply_radiologist_ground_truth(
    df: pd.DataFrame,
    ambiguous_action: str = "exclude",
) -> pd.DataFrame:
    """
    Replace ground_truth_binary with radiologist consensus labels.

    Loads the CSV at RADIO_GT_PATH and remaps ground_truth_binary and 
    ground_truth_raw. Dynamically detects columns like 'Corrected Truth' 
    or 'physician_n' to ensure a smooth integration.

    Parameters
    ----------
    df : DataFrame from load_and_clean() — BEFORE derive_variables()
    ambiguous_action : how to handle KL1 (ambiguous/doubtful) images
        "exclude"          — drop all trials for ambiguous images (default)
        "keep_as_positive" — treat KL1 as diseased (binary=1)
        "keep_as_negative" — treat KL1 as healthy  (binary=0)

    Returns
    -------
    DataFrame with updated ground_truth_binary, ground_truth_raw, and a gt_source column.
    """
    if not os.path.exists(RADIO_GT_PATH):
        warnings.warn(f"Radiologist ground truth file not found: {RADIO_GT_PATH}. Skipping swap.")
        return df

    radio_gt = pd.read_csv(RADIO_GT_PATH)

    # ── 1. Identify Columns ──
    img_col = next((c for c in ["trial_imageFileName", "image_name", "image"] if c in radio_gt.columns), "trial_imageFileName")
    if img_col not in radio_gt.columns:
         raise KeyError(f"Could not find image filename column in {RADIO_GT_PATH}.")

    # Ground Truth columns
    raw_col = next((c for c in ["Ground_Truth_Raw", "Corrected Truth"] if c in radio_gt.columns), None)
    bin_col = next((c for c in ["Ground_Truth_Binary"] if c in radio_gt.columns), None)
    
    # Handle multi-physician case
    rater_cols = [c for c in radio_gt.columns if "physician_" in c or "rater_" in c]
    if raw_col is None and rater_cols:
        # Calculate consensus as median (robust for KL scale)
        radio_gt["Ground_Truth_Raw"] = radio_gt[rater_cols].median(axis=1).round().astype(int)
        raw_col = "Ground_Truth_Raw"
        print(f"  (Calculated consensus from {len(rater_cols)} raters)")

    if raw_col is None:
        raise KeyError(f"No ground truth column ('Corrected Truth', 'Ground_Truth_Raw') found in {RADIO_GT_PATH}")

    # ── 2. Build Mappings ──
    # If bin_col exists (values 0,1,2), use it. Otherwise derive from KL raw (0-4).
    if bin_col:
        gt_map_bin = dict(zip(radio_gt[img_col], radio_gt[bin_col]))
    else:
        # 0 -> 0 (Healthy), 1 -> 1 (Ambiguous), 2-4 -> 2 (Diseased)
        def map_kl_to_tri(v):
            try:
                v = float(v)
                if v == 0: return 0
                if v == 1: return 1
                return 2
            except: return 1
        gt_map_bin = {row[img_col]: map_kl_to_tri(row[raw_col]) for _, row in radio_gt.iterrows()}
    
    gt_map_raw = dict(zip(radio_gt[img_col], radio_gt[raw_col]))

    # ── 3. Apply Mapping ──
    df["_radio_label"] = df["trial_image_name"].map(gt_map_bin)
    df["_radio_raw"] = df["trial_image_name"].map(gt_map_raw)

    n_before = len(df)
    amb_images = df.loc[df["_radio_label"] == 1, "trial_image_name"].unique()
    n_amb_trials = (df["_radio_label"] == 1).sum()

    if ambiguous_action == "exclude":
        df = df[df["_radio_label"] != 1].copy()
    elif ambiguous_action == "keep_as_positive":
        df.loc[df["_radio_label"] == 1, "_radio_label"] = 2
    elif ambiguous_action == "keep_as_negative":
        df.loc[df["_radio_label"] == 1, "_radio_label"] = 0

    # Count flips before final binary swap
    old_gt = df["ground_truth_binary"].copy()
    # Map 2 (Diseased) -> 1
    new_gt = df["_radio_label"].replace({2: 1}).astype(float)
    new_raw = df["_radio_raw"].astype(float)
    
    n_flips = (old_gt != new_gt).sum()
    flipped_images = df.loc[old_gt != new_gt, "trial_image_name"].unique()

    df["ground_truth_binary"] = new_gt
    df["ground_truth_raw"] = new_raw
    df["gt_source"] = f"radiologist ({os.path.basename(RADIO_GT_PATH)})"
    df.drop(columns=["_radio_label", "_radio_raw"], inplace=True)

    # ── Summary ──
    print("═" * 55)
    print("  RADIOLOGIST GROUND TRUTH APPLIED")
    print(f"  File: {os.path.basename(RADIO_GT_PATH)}")
    print("═" * 55)
    print(f"  Amb images (KL1):  {len(amb_images)} images, {n_amb_trials} trials")
    print(f"  Action taken:      {ambiguous_action.upper()}")
    print(f"  Rows:              {n_before} → {len(df)}")
    print(f"  Label flips:       {n_flips} trials ({len(flipped_images)} images)")
    if len(flipped_images) > 0:
        print(f"  Flipped images:    {sorted(flipped_images, key=lambda x: int(x.replace('.png','')) if x.replace('.png','').isdigit() else x)}")
    print(f"  New class balance: 0={int((df['ground_truth_binary']==0).sum())}  1={int((df['ground_truth_binary']==1).sum())}")
    print("═" * 55)

    return df


# ─────────────────────────────────────────────
# Derived Variables
# ─────────────────────────────────────────────

def derive_variables(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add all computed/derived columns to the DataFrame.

    This function is idempotent — calling it multiple times is safe.
    """
    df = df.copy()

    # ── Condition label ──
    df["condition"] = df["ai_shown"].map({True: "AI-Assisted", False: "Control"})

    # ── Unified user decision & confidence ──
    # Control: only initial_decision / confidence exist
    # AI-Assisted: final_decision / final_confidence are the "true" answer
    df["user_decision"] = np.where(
        df["ai_shown"],
        df["final_decision"],
        df["initial_decision"],
    )
    df["user_confidence"] = np.where(
        df["ai_shown"],
        df["final_confidence"],
        df["confidence"],
    )

    # ── Correctness ──
    # Primary: the "true" user accuracy
    df["user_correct"] = (
        df["user_decision"] == df["ground_truth_binary"]
    ).astype(float)
    # Handle NaN user_decision → NaN correctness
    df.loc[df["user_decision"].isna(), "user_correct"] = np.nan

    # Pre-AI baseline (AI trials only): was initial_decision correct?
    df["pre_ai_correct"] = np.where(
        df["ai_shown"],
        (df["initial_decision"] == df["ground_truth_binary"]).astype(float),
        np.nan,
    )

    # ── AI correctness ──
    df["ai_correct"] = np.where(
        df["ai_shown"],
        (df["ai_prediction"] == df["ground_truth_binary"]).astype(float),
        np.nan,
    )

    # ── Decision change (AI trials only) ──
    df["decision_changed"] = np.where(
        df["ai_shown"],
        (df["initial_decision"] != df["final_decision"]).astype(float),
        np.nan,
    )

    # Self-correction: changed AND became correct
    df["changed_to_correct"] = np.where(
        df["ai_shown"],
        (
            (df["initial_decision"] != df["final_decision"])
            & (df["final_decision"] == df["ground_truth_binary"])
        ).astype(float),
        np.nan,
    )

    # Changed to incorrect: changed AND became wrong
    df["changed_to_incorrect"] = np.where(
        df["ai_shown"],
        (
            (df["initial_decision"] != df["final_decision"])
            & (df["final_decision"] != df["ground_truth_binary"])
        ).astype(float),
        np.nan,
    )

    # ── Human-AI agreement (AI trials only) ──
    df["agreed_with_ai"] = np.where(
        df["ai_shown"],
        (df["final_decision"] == df["ai_prediction"]).astype(float),
        np.nan,
    )

    # Over-reliance: agreed with WRONG AI
    df["over_reliance"] = np.where(
        df["ai_shown"],
        (
            (df["final_decision"] == df["ai_prediction"])
            & (df["ai_prediction"] != df["ground_truth_binary"])
        ).astype(float),
        np.nan,
    )

    # Skepticism: disagreed with CORRECT AI
    df["skepticism"] = np.where(
        df["ai_shown"],
        (
            (df["final_decision"] != df["ai_prediction"])
            & (df["ai_prediction"] == df["ground_truth_binary"])
        ).astype(float),
        np.nan,
    )

    # ── Confidence shift (AI trials only) ──
    df["confidence_shift"] = np.where(
        df["ai_shown"],
        df["final_confidence"] - df["initial_confidence"],
        np.nan,
    )

    # ── Trial blocks (quintiles of 10 within each phase of 50) ──
    # trial_order 1-50 for phase 1, 51-100 for phase 2 (completers)
    # We want within-phase blocks, so use modular arithmetic
    phase_trial = ((df["trial_order"] - 1) % 50) + 1  # 1-50 within each phase
    df["trial_block"] = pd.cut(
        phase_trial,
        bins=[0, 10, 20, 30, 40, 50],
        labels=["1-10", "11-20", "21-30", "31-40", "41-50"],
    )

    # ── Phase indicator ──
    df["phase"] = np.where(df["trial_order"] <= 50, "Phase 1", "Phase 2")

    # ── Symptom category mapping ──
    df["symptom1_en"] = df["symptom1"].map(SYMPTOM_MAP)
    df["symptom2_en"] = df["symptom2"].map(SYMPTOM_MAP)

    # ── KL severity label ──
    df["kl_severity"] = df["ground_truth_raw"].map(KL_SEVERITY_MAP)

    # ── Participant completion status ──
    # If load_and_clean already determined this (to avoid dropping rows breaking it)
    if "is_completer" not in df.columns:
        trials_per_p = df.groupby("participant_id")["trial_order"].transform("max")
        df["is_completer"] = trials_per_p >= 100

    # ── Has psychometric data ──
    df["has_psychometrics"] = df["big5_agreeableness"].notna()

    # ── Sanity assertions ──
    # Over-reliance should never coexist with ai_correct
    ai_mask = df["ai_shown"] == True
    assert not (
        (df.loc[ai_mask, "over_reliance"] == 1)
        & (df.loc[ai_mask, "ai_correct"] == 1)
    ).any(), "Sanity check failed: over_reliance when AI is correct"

    # Skepticism should never coexist with ai_incorrect
    assert not (
        (df.loc[ai_mask, "skepticism"] == 1)
        & (df.loc[ai_mask, "ai_correct"] == 0)
    ).any(), "Sanity check failed: skepticism when AI is incorrect"

    # Exclude images with known label noise after variables are derived
    # noisy_images = [
    #     "9023935L.png",
    #     "9998089R.png",
    #     "9788301L.png",
    #     "9360243L.png",
    #     "9299531R.png"
    # ]
    # if "trial_original_image_name" in df.columns:
    #     df = df[~df["trial_original_image_name"].isin(noisy_images)]

    return df


# ─────────────────────────────────────────────
# Participant-Level Aggregation
# ─────────────────────────────────────────────

def get_participant_summary(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate trial-level data to one row per participant.

    Returns a DataFrame with demographics, accuracy metrics, timing,
    and psychometric scores.
    """
    # Separate summaries by condition
    summaries = []

    for pid, grp in df.groupby("participant_id"):
        row = {
            "participant_id": pid,
            "age": grp["age"].iloc[0],
            "gender": grp["gender"].iloc[0],
            "school": grp["school"].iloc[0],
            "residence": grp["residence"].iloc[0],
            "treatment_group": grp["treatment_group"].iloc[0],
            "is_completer": grp["is_completer"].iloc[0],
            "n_trials": len(grp),
        }

        # Control phase stats
        ctrl = grp[grp["condition"] == "Control"]
        if len(ctrl) > 0:
            row["control_accuracy"] = ctrl["user_correct"].mean()
            row["control_mean_confidence"] = ctrl["user_confidence"].mean()
            row["control_mean_duration"] = ctrl["trial_duration"].mean()
            row["control_n_trials"] = len(ctrl)
        else:
            row["control_accuracy"] = np.nan
            row["control_mean_confidence"] = np.nan
            row["control_mean_duration"] = np.nan
            row["control_n_trials"] = 0

        # AI phase stats
        ai = grp[grp["condition"] == "AI-Assisted"]
        if len(ai) > 0:
            row["ai_accuracy"] = ai["user_correct"].mean()
            row["ai_pre_ai_accuracy"] = ai["pre_ai_correct"].mean()
            row["ai_mean_confidence"] = ai["user_confidence"].mean()
            row["ai_mean_duration"] = ai["trial_duration"].mean()
            row["ai_n_trials"] = len(ai)
            row["ai_agreement_rate"] = ai["agreed_with_ai"].mean()
            row["over_reliance_rate"] = ai["over_reliance"].mean()
            row["skepticism_rate"] = ai["skepticism"].mean()
            row["decision_change_rate"] = ai["decision_changed"].mean()
            row["self_correction_rate"] = ai["changed_to_correct"].mean()
        else:
            for k in ["ai_accuracy", "ai_pre_ai_accuracy",
                       "ai_mean_confidence", "ai_mean_duration",
                       "ai_n_trials", "ai_agreement_rate",
                       "over_reliance_rate", "skepticism_rate",
                       "decision_change_rate", "self_correction_rate"]:
                row[k] = np.nan

        # Overall accuracy
        row["overall_accuracy"] = grp["user_correct"].mean()
        row["overall_mean_duration"] = grp["trial_duration"].mean()

        # Psychometrics (participant-level, same across all rows)
        row["iq_score"] = grp["iq_score"].iloc[0]
        row["has_psychometrics"] = grp["has_psychometrics"].iloc[0]
        for col in [c for c in grp.columns if c.startswith("big5_") and c != "big5_timestamp"]:
            row[col] = grp[col].iloc[0]
        for col in [c for c in grp.columns if c.startswith("facet_")]:
            row[col] = grp[col].iloc[0]

        summaries.append(row)

    return pd.DataFrame(summaries)


def get_completers(df: pd.DataFrame) -> pd.DataFrame:
    """Filter to only participants who completed both phases (100 trials)."""
    return df[df["is_completer"]].copy()


def get_dropouts(df: pd.DataFrame) -> pd.DataFrame:
    """Filter to only participants who completed only one phase (50 trials)."""
    return df[~df["is_completer"]].copy()


# ─────────────────────────────────────────────
# Speeder Detection
# ─────────────────────────────────────────────

def flag_speeders(
    df: pd.DataFrame,
    method: str = "fixed",
    threshold: float = 3.0,
    z_threshold: float = -2.0,
    percentile: float = 5.0,
) -> pd.DataFrame:
    """
    Flag trials and participants suspected of speeding.

    Parameters
    ----------
    method : str
        'fixed'      — flag trials below `threshold` seconds
        'zscore'     — flag trials with per-participant z-score < `z_threshold`
        'percentile' — flag trials below the `percentile`-th percentile overall

    Returns
    -------
    DataFrame with added columns:
        'is_speeder_trial' (bool per trial)
        'speeder_trial_pct' (% of speeder trials per participant)
        'is_speeder_participant' (bool, True if >50% of trials are speeder)
    """
    df = df.copy()

    if method == "fixed":
        df["is_speeder_trial"] = df["trial_duration"] < threshold
    elif method == "zscore":
        stats = df.groupby("participant_id")["trial_duration"].transform
        df["_z"] = (df["trial_duration"] - stats("mean")) / stats("std")
        df["is_speeder_trial"] = df["_z"] < z_threshold
        df.drop(columns=["_z"], inplace=True)
    elif method == "percentile":
        cutoff = np.percentile(df["trial_duration"].dropna(), percentile)
        df["is_speeder_trial"] = df["trial_duration"] < cutoff
    else:
        raise ValueError(f"Unknown method: {method}")

    # Participant-level summary
    speeder_pct = df.groupby("participant_id")["is_speeder_trial"].mean()
    df["speeder_trial_pct"] = df["participant_id"].map(speeder_pct)
    df["is_speeder_participant"] = df["speeder_trial_pct"] > 0.5

    return df


# ─────────────────────────────────────────────
# Plotting Helpers
# ─────────────────────────────────────────────

def setup_plotting():
    """Configure matplotlib/seaborn for publication-quality figures."""
    import matplotlib.pyplot as plt
    import seaborn as sns

    sns.set_theme(
        style="whitegrid",
        context="notebook",
        font_scale=1.1,
        rc={
            "figure.figsize": (10, 6),
            "figure.dpi": 120,
            "axes.titlesize": 14,
            "axes.labelsize": 12,
            "legend.fontsize": 10,
            "xtick.labelsize": 10,
            "ytick.labelsize": 10,
            "figure.titlesize": 16,
        },
    )
    return plt, sns


def add_significance(ax, x1, x2, y, p_value, height=0.02):
    """Add a significance bracket between two bars on a plot."""
    stars = (
        "***" if p_value < 0.001
        else "**" if p_value < 0.01
        else "*" if p_value < 0.05
        else "n.s."
    )
    ax.plot([x1, x1, x2, x2], [y, y + height, y + height, y], color="black", lw=1.2)
    ax.text((x1 + x2) / 2, y + height, stars, ha="center", va="bottom", fontsize=12)
