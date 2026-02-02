#!/usr/bin/env python3
"""
Firebase Export Pipeline
=========================
Complete automated pipeline for exporting Firestore data, verification, and CSV conversion.

This script orchestrates the entire export process:
1. Export data from Firebase Firestore
2. Verify export completeness
3. Convert JSON to CSV
4. Verify CSV files
5. Generate comprehensive report

Usage:
    python exportPipeline.py [--skip-export] [--skip-csv] [--verbose] [--dry-run]
"""

import sys
import argparse
from pathlib import Path
from datetime import datetime
import traceback

# Add lib directory to path
sys.path.insert(0, str(Path(__file__).parent / 'lib'))

from firebase_export import export_firestore
from export_verifier import verify_export_completeness
from csv_converter import convert_firestore_to_csv
from csv_verifier import verify_csv_files


class PipelineReport:
    """Generate formatted terminal reports for pipeline execution."""
    
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.stages = []
        self.start_time = datetime.now()
        
    def print_header(self):
        """Print pipeline header."""
        print("╔" + "═" * 62 + "╗")
        print("║" + "  FIREBASE EXPORT PIPELINE - EXECUTION REPORT  ".center(62) + "║")
        print("╚" + "═" * 62 + "╝")
        print()
        print(f"Pipeline Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
    
    def print_stage_header(self, stage_num, stage_name):
        """Print stage header."""
        print("┌" + "─" * 62 + "┐")
        print(f"│ STAGE {stage_num}: {stage_name.upper():<46} │")
        print("├" + "─" * 62 + "┤")
    
    def print_stage_footer(self, success, duration):
        """Print stage footer."""
        status = "[✓PASS]" if success else "[✗FAIL]"
        print(f"│ Status: {status:<15} Duration: {duration:.1f}s{' ' * 20} │")
        print("└" + "─" * 62 + "┘")
        print()
    
    def print_summary(self, success):
        """Print final summary."""
        duration = (datetime.now() - self.start_time).total_seconds()
        
        print("╔" + "═" * 62 + "╗")
        status_text = "SUCCESS" if success else "FAILED"
        print(f"║{f'PIPELINE STATUS: {status_text}'.center(62)}║")
        print("╠" + "═" * 62 + "╣")
        
        if success:
            print("║" + " All stages completed successfully".ljust(62) + "║")
        else:
            print("║" + " Pipeline encountered errors - see details above".ljust(62) + "║")
        
        # Calculate total tests
        total_tests = sum(s.get('tests_passed', 0) + s.get('tests_failed', 0) for s in self.stages)
        total_passed = sum(s.get('tests_passed', 0) for s in self.stages)
        total_failed = sum(s.get('tests_failed', 0) for s in self.stages)
        
        if total_tests > 0:
            print(f"║ Total Tests Run: {total_tests:<47} ║")
            print(f"║ Tests Passed: {total_passed:<50} ║")
            print(f"║ Tests Failed: {total_failed:<50} ║")
        
        print("╚" + "═" * 62 + "╝")
        print()
        print(f"Pipeline Duration: {duration:.1f} seconds")


def run_stage_1_export(credentials_path, output_dir, verbose):
    """Stage 1: Export from Firestore."""
    stage_start = datetime.now()
    
    def progress_cb(msg):
        if verbose:
            print(f"│ {msg:<60} │")
    
    try:
        result = export_firestore(credentials_path, output_dir, progress_cb)
        
        duration = (datetime.now() - stage_start).total_seconds()
        
        # Print results
        if not verbose:
            print(f"│ Collections Exported: {result['collections_count']:<41} │")
            print(f"│ Output File: {Path(result['export_file']).name:<48} │")
            print(f"│ File Size: {result['file_size'] / 1024:.1f} KB{' ' * 44} │")
        
        return {
            'success': True,
            'duration': duration,
            'export_file': result['export_file'],
            'export_data': result['export_data'],
            'tests_passed': 1,
            'tests_failed': 0
        }
        
    except Exception as e:
        duration = (datetime.now() - stage_start).total_seconds()
        print(f"│ ERROR: {str(e):<55} │")
        if verbose:
            traceback.print_exc()
        return {
            'success': False,
            'duration': duration,
            'error': str(e),
            'tests_passed': 0,
            'tests_failed': 1
        }


def run_stage_2_verify_export(export_data, credentials_path, verbose):
    """Stage 2: Verify export completeness."""
    stage_start = datetime.now()
    
    def progress_cb(msg):
        if verbose:
            print(f"│ {msg:<60} │")
    
    try:
        result = verify_export_completeness(export_data, credentials_path, progress_cb)
        
        duration = (datetime.now() - stage_start).total_seconds()
        
        # Print results
        if not verbose:
            print(f"│ Collections Verified: {result.collections_verified}/{result.collections_total:<38} │")
            print(f"│ Documents Verified: {result.total_export_docs}/{result.total_live_docs:<41} │")
            print(f"│ Data Integrity: {'100%' if result.success else 'FAILED':<44} │")
            print(f"│ Issues Found: {len(result.issues):<48} │")
        
        if result.issues:
            print("│" + " " * 62 + "│")
            print("│ Issues:" + " " * 54 + "│")
            for issue in result.issues[:5]:  # Show first 5 issues
                print(f"│   - {issue[:57]:<57} │")
        
        return {
            'success': result.success,
            'duration': duration,
            'verification_result': result,
            'tests_passed': result.collections_verified if result.success else 0,
            'tests_failed': len(result.issues)
        }
        
    except Exception as e:
        duration = (datetime.now() - stage_start).total_seconds()
        print(f"│ ERROR: {str(e):<55} │")
        if verbose:
            traceback.print_exc()
        return {
            'success': False,
            'duration': duration,
            'error': str(e),
            'tests_passed': 0,
            'tests_failed': 1
        }


def run_stage_3_csv_conversion(export_file, output_dir, verbose):
    """Stage 3: Convert JSON to CSV."""
    stage_start = datetime.now()
    
    try:
        # Create timestamped output directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_output_dir = Path(output_dir) / f"export_{timestamp}"
        
        result = convert_firestore_to_csv(
            export_file,
            str(csv_output_dir),
            verbose=verbose
        )
        
        duration = (datetime.now() - stage_start).total_seconds()
        
        # Print results
        if not verbose:
            print(f"│ CSV Files Created: {len(result['files']):<44} │")
            for collection_name, details in result['collections'].items():
                print(f"│   - {collection_name}.csv ({details['rows']} rows){' ' * (45 - len(collection_name) - len(str(details['rows'])))} │")
            print(f"│ Total Rows: {result['total_rows']:<48} │")
            print(f"│ Output Directory: {csv_output_dir.name:<44} │")
        
        return {
            'success': True,
            'duration': duration,
            'csv_dir': str(csv_output_dir),
            'conversion_result': result,
            'tests_passed': len(result['files']),
            'tests_failed': 0
        }
        
    except Exception as e:
        duration = (datetime.now() - stage_start).total_seconds()
        print(f"│ ERROR: {str(e):<55} │")
        if verbose:
            traceback.print_exc()
        return {
            'success': False,
            'duration': duration,
            'error': str(e),
            'tests_passed': 0,
            'tests_failed': 1
        }


def run_stage_4_verify_csv(csv_dir, export_file, export_data, verbose):
    """Stage 4: Verify CSV files."""
    stage_start = datetime.now()
    
    try:
        result = verify_csv_files(
            csv_dir,
            json_path=export_file,
            json_data=export_data
        )
        
        duration = (datetime.now() - stage_start).total_seconds()
        
        # Print results
        if not verbose:
            print(f"│ Files Verified: {result.files_verified:<46} │")
            print(f"│ Data Integrity Tests: {result.tests_passed} passed, {result.tests_failed} failed{' ' * (27 - len(str(result.tests_passed)) - len(str(result.tests_failed)))} │")
            print(f"│ Total Rows: {result.total_rows:<48} │")
        
        if result.issues:
            print("│" + " " * 62 + "│")
            print("│ Issues:" + " " * 54 + "│")
            for issue in result.issues[:5]:
                print(f"│   - {issue[:57]:<57} │")
        
        return {
            'success': result.success,
            'duration': duration,
            'csv_result': result,
            'tests_passed': result.tests_passed,
            'tests_failed': result.tests_failed
        }
        
    except Exception as e:
        duration = (datetime.now() - stage_start).total_seconds()
        print(f"│ ERROR: {str(e):<55} │")
        if verbose:
            traceback.print_exc()
        return {
            'success': False,
            'duration': duration,
            'error': str(e),
            'tests_passed': 0,
            'tests_failed': 1
        }


def save_detailed_report(stages, output_dir):
    """Save detailed text report to file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = Path(output_dir) / f"pipeline_report_{timestamp}.txt"
    
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        f.write("=" * 70 + "\n")
        f.write("FIREBASE EXPORT PIPELINE - DETAILED REPORT\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        for i, stage in enumerate(stages, 1):
            f.write(f"STAGE {i}: {stage.get('name', 'Unknown').upper()}\n")
            f.write("-" * 70 + "\n")
            f.write(f"Status: {'PASS' if stage.get('success') else 'FAIL'}\n")
            f.write(f"Duration: {stage.get('duration', 0):.2f}s\n")
            
            if 'error' in stage:
                f.write(f"Error: {stage['error']}\n")
            
            f.write("\n")
        
        f.write("=" * 70 + "\n")
    
    return str(report_path)


def run_pipeline(args):
    """Run the complete export pipeline."""
    reporter = PipelineReport(verbose=args.verbose)
    reporter.print_header()
    
    # Configuration
    script_dir = Path(__file__).parent
    credentials_path = script_dir / 'config' / 'credentials' / 'percotate-firebase-adminsdk-fbsvc-435af6df84.json'
    json_output_dir = script_dir / 'outputs' / 'json'
    csv_output_base = script_dir / 'outputs' / 'csv'
    reports_dir = script_dir / 'outputs' / 'reports'
    
    # Pre-flight checks
    if not credentials_path.exists():
        print(f"❌ ERROR: Credentials file not found at {credentials_path}")
        print("   Please place your Firebase Admin SDK credentials in:")
        print(f"   {credentials_path}")
        return 1
    
    if args.dry_run:
        print("✓ Dry run mode - checking configuration only")
        print(f"✓ Credentials found: {credentials_path}")
        print(f"✓ Output directories configured:")
        print(f"   - JSON: {json_output_dir}")
        print(f"   - CSV: {csv_output_base}")
        print(f"   - Reports: {reports_dir}")
        print("\n✓ All pre-flight checks passed!")
        return 0
    
    export_file = None
    export_data = None
    csv_dir = None
    all_success = True
    
    # Stage 1: Firebase Export
    if not args.skip_export:
        reporter.print_stage_header(1, "Firebase Export")
        stage1 = run_stage_1_export(str(credentials_path), str(json_output_dir), args.verbose)
        reporter.print_stage_footer(stage1['success'], stage1['duration'])
        
        stage1['name'] = 'Firebase Export'
        reporter.stages.append(stage1)
        
        if not stage1['success']:
            all_success = False
            print("❌ Pipeline failed at Stage 1")
            reporter.print_summary(False)
            return 1
        
        export_file = stage1['export_file']
        export_data = stage1['export_data']
    else:
        print("⚠ Skipping Stage 1 (Firebase Export)")
        print()
    
    # Stage 2: Export Verification
    if export_data is not None:
        reporter.print_stage_header(2, "Export Verification")
        stage2 = run_stage_2_verify_export(export_data, str(credentials_path), args.verbose)
        reporter.print_stage_footer(stage2['success'], stage2['duration'])
        
        stage2['name'] = 'Export Verification'
        reporter.stages.append(stage2)
        
        if not stage2['success']:
            all_success = False
            print("❌ Pipeline failed at Stage 2")
            reporter.print_summary(False)
            return 1
    
    # Stage 3: CSV Conversion
    if not args.skip_csv and export_file:
        reporter.print_stage_header(3, "CSV Conversion")
        stage3 = run_stage_3_csv_conversion(export_file, str(csv_output_base), args.verbose)
        reporter.print_stage_footer(stage3['success'], stage3['duration'])
        
        stage3['name'] = 'CSV Conversion'
        reporter.stages.append(stage3)
        
        if not stage3['success']:
            all_success = False
            print("❌ Pipeline failed at Stage 3")
            reporter.print_summary(False)
            return 1
        
        csv_dir = stage3['csv_dir']
    else:
        if args.skip_csv:
            print("⚠ Skipping Stage 3 (CSV Conversion)")
            print()
    
    # Stage 4: CSV Verification
    if csv_dir:
        reporter.print_stage_header(4, "CSV Verification")
        stage4 = run_stage_4_verify_csv(csv_dir, export_file, export_data, args.verbose)
        reporter.print_stage_footer(stage4['success'], stage4['duration'])
        
        stage4['name'] = 'CSV Verification'
        reporter.stages.append(stage4)
        
        if not stage4['success']:
            all_success = False
    
    # Print summary
    reporter.print_summary(all_success)
    
    # Save detailed report
    report_path = save_detailed_report(reporter.stages, str(reports_dir))
    
    # Print output files
    print("📊 OUTPUT FILES:")
    if export_file:
        print(f"  JSON Export:")
        print(f"    └─ {Path(export_file).relative_to(script_dir)} ({Path(export_file).stat().st_size / 1024:.1f} KB)")
        print()
    
    if csv_dir:
        print(f"  CSV Exports:")
        print(f"    └─ {Path(csv_dir).relative_to(script_dir)}/")
        for csv_file in Path(csv_dir).glob("*.csv"):
            size_kb = csv_file.stat().st_size / 1024
            print(f"       ├─ {csv_file.name} ({size_kb:.1f} KB)")
        print()
    
    print(f"  Pipeline Report:")
    print(f"    └─ {Path(report_path).relative_to(script_dir)}")
    print()
    
    if all_success:
        print("✅ Export completed successfully!")
        print("   Your data is ready for analysis.")
        return 0
    else:
        print("⚠ Pipeline completed with issues - review the report for details.")
        return 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Firebase Export Pipeline - Complete automated export and verification'
    )
    parser.add_argument(
        '--skip-export',
        action='store_true',
        help='Skip Firebase export (use existing JSON)'
    )
    parser.add_argument(
        '--skip-csv',
        action='store_true',
        help='Skip CSV conversion'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output with detailed progress'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Check configuration without running the pipeline'
    )
    
    args = parser.parse_args()
    
    try:
        return run_pipeline(args)
    except KeyboardInterrupt:
        print("\n\n⚠ Pipeline cancelled by user")
        return 130
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
