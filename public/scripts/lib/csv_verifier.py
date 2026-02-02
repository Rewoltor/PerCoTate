"""
CSV Verification Library
========================
Validates CSV files generated from Firestore exports.
"""

import csv
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field


@dataclass
class CSVVerificationResult:
    """Results from CSV verification."""
    success: bool = True
    files_verified: int = 0
    total_rows: int = 0
    tests_passed: int = 0
    tests_failed: int = 0
    issues: List[str] = field(default_factory=list)
    file_details: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    
    def add_issue(self, issue: str):
        """Add an issue and mark as failed."""
        self.issues.append(issue)
        self.success = False
        self.tests_failed += 1
    
    def pass_test(self):
        """Mark a test as passed."""
        self.tests_passed += 1


def verify_csv_file_structure(csv_path: Path, result: CSVVerificationResult) -> Dict[str, Any]:
    """
    Verify a single CSV file's structure and data integrity.
    
    Args:
        csv_path: Path to the CSV file
        result: VerificationResult to update
        
    Returns:
        Dictionary with file details
    """
    file_detail = {
        'path': str(csv_path),
        'exists': False,
        'readable': False,
        'rows': 0,
        'columns': 0,
        'valid_csv': False
    }
    
    # Test 1: File exists
    if not csv_path.exists():
        result.add_issue(f"File not found: {csv_path}")
        return file_detail
    
    file_detail['exists'] = True
    result.pass_test()
    
    # Test 2: File is readable
    try:
        file_size = csv_path.stat().st_size
        file_detail['size_bytes'] = file_size
        
        if file_size == 0:
            result.add_issue(f"File is empty: {csv_path.name}")
            return file_detail
        
        file_detail['readable'] = True
        result.pass_test()
    except Exception as e:
        result.add_issue(f"Cannot read file {csv_path.name}: {e}")
        return file_detail
    
    # Test 3: Valid CSV format
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            
            file_detail['rows'] = len(rows)
            file_detail['columns'] = len(reader.fieldnames) if reader.fieldnames else 0
            file_detail['column_names'] = reader.fieldnames
            file_detail['valid_csv'] = True
            
            result.total_rows += len(rows)
            result.pass_test()
    except Exception as e:
        result.add_issue(f"Invalid CSV format in {csv_path.name}: {e}")
        return file_detail
    
    # Test 4: Has headers
    if not reader.fieldnames or len(reader.fieldnames) == 0:
        result.add_issue(f"No column headers in {csv_path.name}")
        file_detail['has_headers'] = False
    else:
        file_detail['has_headers'] = True
        result.pass_test()
    
    # Test 5: Has data rows
    if len(rows) == 0:
        result.add_issue(f"No data rows in {csv_path.name}")
        file_detail['has_data'] = False
    else:
        file_detail['has_data'] = True
        result.pass_test()
    
    # Test 6: Check for required columns (collection-specific)
    filename = csv_path.stem
    required_columns = get_required_columns(filename)
    
    if required_columns:
        missing_columns = set(required_columns) - set(reader.fieldnames or [])
        if missing_columns:
            result.add_issue(
                f"{csv_path.name}: Missing required columns: {', '.join(missing_columns)}"
            )
            file_detail['missing_columns'] = list(missing_columns)
        else:
            file_detail['has_required_columns'] = True
            result.pass_test()
    
    # Test 7: Check for duplicate rows (based on ID column)
    fieldnames = reader.fieldnames or []
    id_columns = get_id_columns(filename, fieldnames)
    if id_columns:
        # Create composite key tuple
        ids = []
        for row in rows:
            key_parts = []
            has_val = False
            for col in id_columns:
                val = row.get(col)
                if val:
                    has_val = True
                key_parts.append(val)
            
            # Only count if at least one part of key is present
            if has_val:
                ids.append(tuple(key_parts))
                
        unique_ids = set(ids)
        
        if len(ids) != len(unique_ids):
            duplicates = len(ids) - len(unique_ids)
            result.add_issue(f"{csv_path.name}: {duplicates} duplicate row(s) found (keys: {id_columns})")
            file_detail['duplicate_rows'] = duplicates
        else:
            file_detail['no_duplicates'] = True
            result.pass_test()
    
    return file_detail


def get_required_columns(filename: str) -> List[str]:
    """
    Get required columns for a specific CSV file.
    
    Args:
        filename: Name of the CSV file (without extension)
        
    Returns:
        List of required column names
    """
    required_by_file = {
        'participants': ['participant_id', 'user_id', 'treatment_group'],
        'system_stats': ['document_id'],
        'user_identity': ['document_id'],
        'export_metadata': ['export_date', 'project_id']
    }
    
    return required_by_file.get(filename, [])


def get_id_columns(filename: str, columns: List[str]) -> List[str]:
    """
    Determine the ID columns for duplicate checking.
    
    Args:
        filename: Name of the CSV file (without extension)
        columns: List of column names in the file
        
    Returns:
        List of columns forming the unique key
    """
    if filename == 'participants':
        # Composite key for participants: participant_id + trial_id
        # (Since trial IDs like 'trial_1' might repeat across participants)
        keys = ['participant_id', 'trial_id']
        if all(k in columns for k in keys):
            return keys
            
    id_columns_by_file = {
        'system_stats': ['document_id'],
        'user_identity': ['document_id'],
    }
    
    preferred_ids = id_columns_by_file.get(filename)
    if preferred_ids and all(k in columns for k in preferred_ids):
        return preferred_ids
    
    # Fallback to single ID columns
    for col in ['document_id', 'id', 'user_id', 'participant_id']:
        if col in columns:
            return [col]
    
    return []


def verify_row_counts(
    csv_files: List[Path],
    json_data: Dict[str, Any],
    result: CSVVerificationResult
):
    """
    Verify that CSV row counts match expected counts from JSON.
    
    For participants with trials, the CSV will have more rows than JSON documents
    because trials are flattened into separate rows.
    
    Args:
        csv_files: List of CSV file paths
        json_data: Original JSON export data
        result: VerificationResult to update
    """
    collections = json_data.get('collections', {})
    
    for csv_path in csv_files:
        filename = csv_path.stem
        
        if filename == 'export_metadata':
            continue  # Skip metadata file
        
        if filename not in collections:
            result.add_issue(f"CSV file {filename}.csv has no corresponding collection in JSON")
            continue
        
        # For participants, we expect MORE rows in CSV because trials are flattened
        if filename == 'participants':
            # Count expected rows (one per trial)
            expected_rows = 0
            for doc_id, doc_data in collections['participants'].items():
                subcols = doc_data.get('_subcollections', {})
                trials = subcols.get('trials', {})
                if trials:
                    expected_rows += len(trials)
                else:
                    expected_rows += 1  # Participant with no trials = 1 row
            
            # Count actual rows
            try:
                with open(csv_path, 'r', encoding='utf-8') as f:
                    actual_rows = sum(1 for line in f) - 1  # Subtract header
                
                if actual_rows == expected_rows:
                    result.pass_test()
                else:
                    result.add_issue(
                        f"participants.csv: Expected {expected_rows} rows (one per trial), "
                        f"found {actual_rows} rows"
                    )
            except Exception as e:
                result.add_issue(f"Error counting rows in {filename}.csv: {e}")
        else:
            # For other collections, row count should match document count
            expected_docs = len(collections[filename])
            
            try:
                with open(csv_path, 'r', encoding='utf-8') as f:
                    actual_rows = sum(1 for line in f) - 1  # Subtract header
                
                if actual_rows == expected_docs:
                    result.pass_test()
                else:
                    result.add_issue(
                        f"{filename}.csv: Expected {expected_docs} rows, found {actual_rows} rows"
                    )
            except Exception as e:
                result.add_issue(f"Error counting rows in {filename}.csv: {e}")


def verify_csv_files(
    csv_dir: str,
    json_path: Optional[str] = None,
    json_data: Optional[Dict[str, Any]] = None
) -> CSVVerificationResult:
    """
    Verify all CSV files in a directory.
    
    Args:
        csv_dir: Directory containing CSV files
        json_path: Optional path to original JSON export for validation
        json_data: Optional JSON data (if already loaded)
        
    Returns:
        CSVVerificationResult with detailed results
    """
    result = CSVVerificationResult()
    csv_dir = Path(csv_dir)
    
    if not csv_dir.exists() or not csv_dir.is_dir():
        result.add_issue(f"CSV directory not found: {csv_dir}")
        return result
    
    # Find all CSV files
    csv_files = list(csv_dir.glob("*.csv"))
    
    if not csv_files:
        result.add_issue(f"No CSV files found in {csv_dir}")
        return result
    
    # Verify each file
    for csv_path in csv_files:
        file_detail = verify_csv_file_structure(csv_path, result)
        result.file_details[csv_path.name] = file_detail
        result.files_verified += 1
    
    # If JSON data provided, verify row counts
    if json_path or json_data:
        if json_data is None and json_path:
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    json_data = json.load(f)
            except Exception as e:
                result.add_issue(f"Cannot load JSON file for validation: {e}")
                return result
        
        if json_data:
            verify_row_counts(csv_files, json_data, result)
    
    return result
