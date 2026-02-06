"""
Export Verification Library
============================
Verifies that Firestore exports are complete and match the live database.

Includes robust retry logic and pagination for handling large collections.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field

from google.api_core.retry import Retry
from google.api_core.exceptions import DeadlineExceeded, ServiceUnavailable

# Configuration for retry and pagination (matching firebase_export.py)
DEFAULT_RETRY = Retry(
    initial=1.0,           # Initial delay between retries (seconds)
    maximum=60.0,          # Maximum delay between retries (seconds)
    multiplier=2.0,        # Delay multiplier for exponential backoff
    deadline=600.0,        # Total timeout for the operation (10 minutes)
    predicate=lambda exc: isinstance(exc, (DeadlineExceeded, ServiceUnavailable))
)

BATCH_SIZE = 500  # Number of documents to fetch per batch


@dataclass
class VerificationResult:
    """Results from export verification."""
    success: bool
    total_live_docs: int = 0
    total_export_docs: int = 0
    collections_verified: int = 0
    collections_total: int = 0
    issues: List[str] = field(default_factory=list)
    collection_details: Dict[str, Dict[str, int]] = field(default_factory=dict)
    
    def add_issue(self, issue: str):
        """Add an issue to the results."""
        self.issues.append(issue)
        self.success = False


def count_documents_recursively(
    collection_ref, 
    collection_name: str = "",
    batch_size: int = BATCH_SIZE
) -> Dict[str, int]:
    """
    Count all documents in a collection and its subcollections.
    
    Uses pagination and retry logic to handle large collections.
    
    Args:
        collection_ref: Firestore collection reference
        collection_name: Name/path of the collection
        batch_size: Number of documents to fetch per batch
        
    Returns:
        Dictionary mapping collection paths to document counts
    """
    counts = {}
    doc_count = 0
    
    # Use paginated streaming with retry
    query = collection_ref.order_by('__name__').limit(batch_size)
    
    while True:
        docs = list(query.stream(retry=DEFAULT_RETRY))
        
        if not docs:
            break
        
        for doc in docs:
            doc_count += 1
            
            # Check subcollections
            subcollections = doc.reference.collections()
            for subcol in subcollections:
                subcol_path = f"{collection_name}/{doc.id}/{subcol.id}" if collection_name else f"{doc.id}/{subcol.id}"
                subcol_counts = count_documents_recursively(subcol, subcol_path, batch_size)
                counts.update(subcol_counts)
        
        # If we got fewer documents than the batch size, we've reached the end
        if len(docs) < batch_size:
            break
        
        # Move cursor to after the last document for next batch
        last_doc = docs[-1]
        query = collection_ref.order_by('__name__').start_after(last_doc).limit(batch_size)
    
    counts[collection_name if collection_name else "root"] = doc_count
    return counts


def count_export_documents(export_data: Dict[str, Any]) -> Dict[str, int]:
    """
    Count documents in the exported JSON data.
    
    Args:
        export_data: The exported JSON data
        
    Returns:
        Dictionary mapping collection paths to document counts
    """
    counts = {}
    collections = export_data.get('collections', {})
    
    for collection_name, collection_docs in collections.items():
        # Count root documents
        counts[collection_name] = len(collection_docs)
        
        # Count subcollection documents
        for doc_id, doc_data in collection_docs.items():
            if '_subcollections' in doc_data:
                for subcol_name, subcol_docs in doc_data['_subcollections'].items():
                    subcol_path = f"{collection_name}/{doc_id}/{subcol_name}"
                    counts[subcol_path] = len(subcol_docs)
    
    return counts


def verify_export_completeness(
    export_data: Dict[str, Any],
    credentials_path: str,
    progress_callback: Optional[Callable] = None
) -> VerificationResult:
    """
    Verify that an export contains all data from Firestore.
    
    Args:
        export_data: The exported JSON data (from export_firestore or loaded)
        credentials_path: Path to Firebase credentials
        progress_callback: Optional callback for progress updates
        
    Returns:
        VerificationResult with detailed results
    """
    result = VerificationResult(success=True)
    
    if progress_callback:
        progress_callback("Connecting to Firestore for verification...")
    
    # Initialize Firebase using shared utility
    from firebase_utils import init_firebase
    db = init_firebase(str(credentials_path))
    
    # Get collection names
    export_collections = export_data.get('collections', {})
    live_collection_names = [col.id for col in db.collections()]
    
    result.collections_total = len(live_collection_names)
    
    if progress_callback:
        progress_callback(f"Verifying {len(live_collection_names)} collection(s)...")
    
    # Verify each collection
    for col_name in live_collection_names:
        col_ref = db.collection(col_name)
        
        # Count live documents
        live_counts = count_documents_recursively(col_ref, col_name)
        
        # Count export documents
        if col_name not in export_collections:
            result.add_issue(f"Collection '{col_name}' missing from export")
            continue
        
        # Compare root collection
        live_root_count = live_counts.get(col_name, 0)
        export_docs = export_collections.get(col_name, {})
        export_root_count = len(export_docs)
        
        result.total_live_docs += live_root_count
        result.total_export_docs += export_root_count
        
        collection_detail = {
            'live': live_root_count,
            'export': export_root_count,
            'match': live_root_count == export_root_count
        }
        
        if live_root_count != export_root_count:
            result.add_issue(
                f"Collection '{col_name}': {live_root_count} live docs, "
                f"{export_root_count} in export (mismatch)"
            )
        
        # Check subcollections
        subcol_details = {}
        for subcol_path, live_subcol_count in live_counts.items():
            if subcol_path == col_name:
                continue  # Skip root
            
            # Find export count for this subcollection
            path_parts = subcol_path.split('/')
            if len(path_parts) >= 3:
                doc_id = path_parts[1]
                subcol_name = path_parts[2]
                
                export_subcol_count = 0
                if doc_id in export_docs:
                    doc_data = export_docs[doc_id]
                    if '_subcollections' in doc_data:
                        if subcol_name in doc_data['_subcollections']:
                            export_subcol_count = len(doc_data['_subcollections'][subcol_name])
                
                result.total_live_docs += live_subcol_count
                result.total_export_docs += export_subcol_count
                
                subcol_details[subcol_path] = {
                    'live': live_subcol_count,
                    'export': export_subcol_count,
                    'match': live_subcol_count == export_subcol_count
                }
                
                if live_subcol_count != export_subcol_count:
                    result.add_issue(
                        f"Subcollection '{subcol_path}': {live_subcol_count} live docs, "
                        f"{export_subcol_count} in export (mismatch)"
                    )
        
        if subcol_details:
            collection_detail['subcollections'] = subcol_details
        
        result.collection_details[col_name] = collection_detail
        result.collections_verified += 1
        
        if progress_callback:
            status = "✓" if collection_detail['match'] else "✗"
            progress_callback(f"  {status} {col_name}: {live_root_count} documents")
    
    return result


def verify_export_file(
    export_file_path: str,
    credentials_path: str,
    progress_callback: Optional[Callable] = None
) -> VerificationResult:
    """
    Verify an export file against live Firestore.
    
    Args:
        export_file_path: Path to the export JSON file
        credentials_path: Path to Firebase credentials
        progress_callback: Optional callback for progress updates
        
    Returns:
        VerificationResult with detailed results
    """
    if progress_callback:
        progress_callback(f"Loading export file: {export_file_path}")
    
    export_path = Path(export_file_path)
    if not export_path.exists():
        result = VerificationResult(success=False)
        result.add_issue(f"Export file not found: {export_file_path}")
        return result
    
    try:
        with open(export_path, 'r', encoding='utf-8') as f:
            export_data = json.load(f)
    except json.JSONDecodeError as e:
        result = VerificationResult(success=False)
        result.add_issue(f"Invalid JSON in export file: {e}")
        return result
    
    return verify_export_completeness(export_data, credentials_path, progress_callback)
