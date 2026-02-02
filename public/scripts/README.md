# Firebase Firestore Export Pipeline

Complete automated pipeline for exporting Firestore data to JSON and CSV with comprehensive verification.

## Quick Start

### 1. Setup

```bash
cd public/scripts

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already done)
pip install -r requirements.txt

# Place your Firebase credentials in config/credentials/
# File should be named: percotate-firebase-adminsdk-fbsvc-435af6df84.json
```

### 2. Run the Pipeline

```bash
# Full pipeline: Export → Verify → CSV → Verify
python exportPipeline.py

# With verbose output
python exportPipeline.py --verbose

# Dry run (check configuration only)
python exportPipeline.py --dry-run
```

## Pipeline Stages

The pipeline runs 4 automated stages:

1. **Firebase Export** - Downloads all Firestore data to JSON
2. **Export Verification** - Verifies completeness against live database
3. **CSV Conversion** - Converts JSON to flat CSV files for analysis
4. **CSV Verification** - Validates CSV integrity and row counts

Each stage includes rigorous testing and reports results in real-time.

## Output Structure

```
outputs/
├── json/
│   └── firestore_export_YYYYMMDD_HHMMSS.json
├── csv/
│   └── export_YYYYMMDD_HHMMSS/
│       ├── participants.csv
│       ├── system_stats.csv
│       ├── user_identity.csv
│       └── export_metadata.csv
└── reports/
    └── pipeline_report_YYYYMMDD_HHMMSS.txt
```

## Command-Line Options

- `--verbose, -v` - Show detailed progress messages
- `--skip-export` - Skip Firebase export (use existing JSON)
- `--skip-csv` - Skip CSV conversion
- `--dry-run` - Check configuration without running

## CSV Output Format

### participants.csv

One row per trial, with participant data repeated for each trial:

**Participant Fields:**
- `participant_id`, `user_id`, `treatment_group`
- `age`, `gender`, `school`, `residence`, `experience_level`
- `big5_*` - Big Five personality traits and facets
- `iq_score`, `iq_time_remaining`, `iq_completed_at`
- Phase completion timestamps

**Trial Fields (one row per trial):**
- `trial_id`, `trial_duration`, `trial_start_time`, `trial_end_time`
- `initial_decision`, `final_decision`
- `initial_confidence`, `final_confidence`
- `ai_shown`, `ai_prediction`, `ai_confidence`
- `ground_truth_binary`, `ground_truth_raw`
- Image and symptom information

### Other CSV files

- `system_stats.csv` - System statistics
- `user_identity.csv` - User identity mappings
- `export_metadata.csv` - Export metadata and timestamps

## Example Output

```
╔══════════════════════════════════════════════════════════════╗
║         FIREBASE EXPORT PIPELINE - EXECUTION REPORT          ║
╚══════════════════════════════════════════════════════════════╝

Pipeline Started: 2026-02-02 10:28:41

┌──────────────────────────────────────────────────────────────┐
│ STAGE 1: FIREBASE EXPORT                              [✓PASS]│
├──────────────────────────────────────────────────────────────┤
│ Collections Exported: 3                                       │
│ Output File: firestore_export_20260202_102841.json           │
│ File Size: 20.4 KB                                            │
│ Status: [✓PASS]         Duration: 8.5s                       │
└──────────────────────────────────────────────────────────────┘

... [more stages]

╔══════════════════════════════════════════════════════════════╗
║                    PIPELINE STATUS: SUCCESS                   ║
╠══════════════════════════════════════════════════════════════╣
║ All stages completed successfully                             ║
║ Total Tests Run: 42                                           ║
║ Tests Passed: 42                                              ║
║ Tests Failed: 0                                               ║
╚══════════════════════════════════════════════════════════════╝

✅ Export completed successfully!
   Your data is ready for analysis.
```

## Directory Structure

```
public/scripts/
├── exportPipeline.py          # Main pipeline orchestrator
├── lib/                        # Core library modules
│   ├── firebase_export.py     # Firestore export
│   ├── export_verifier.py     # Export verification
│   ├── csv_converter.py       # JSON to CSV conversion  
│   └── csv_verifier.py        # CSV validation
├── config/
│   └── credentials/           # Firebase credentials (gitignored)
├── outputs/                   # All pipeline outputs
│   ├── json/                  # JSON exports
│   ├── csv/                   # CSV exports
│   └── reports/               # Pipeline reports
├── archive/                   # Old/deprecated files
├── venv/                      # Python virtual environment
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Troubleshooting

### Missing Credentials

```
❌ ERROR: Credentials file not found
   Please place your Firebase Admin SDK credentials in:
   config/credentials/percotate-firebase-adminsdk-fbsvc-435af6df84.json
```

**Solution**: Download your Firebase Admin SDK key and place it in the correct location.

### Pipeline Failures

If a stage fails, the pipeline stops and shows the error. Common issues:

- **Network errors**: Check internet connection
- **Permission errors**: Verify Firebase service account has Firestore read permissions
- **Disk space**: Ensure sufficient space for exports

Review the detailed report in `outputs/reports/` for more information.

### Testing

Run a dry run to verify configuration:

```bash
python exportPipeline.py --dry-run
```

## Legacy Files

Old scripts have been moved to `archive/`:

- `generate_data.py` - Synthetic data generator
- `synthetic_database_full.json` - Test data
- `jsonToCSV.py` - Old CSV converter (for synthetic data)
- `dataFlat/` - Old CSV outputs

These are preserved for reference but not part of the current pipeline.

## Next Steps

After running the pipeline:

1. **Review the CSV files** in `outputs/csv/export_*/`
2. **Load into your analysis tool** (R, Python, SPSS, Excel)
3. **Check the pipeline report** for any warnings or issues

The `participants.csv` file is in long format (one row per trial) and ready for regression analysis.
