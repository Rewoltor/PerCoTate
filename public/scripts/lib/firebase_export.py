"""
Firestore Export Library
=========================
Core library for exporting data from Firebase Firestore.

This module provides functions to export all collections and documents
from Firestore, including subcollections, with proper type conversion.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Callable


def convert_firestore_value(value: Any) -> Any:
    """
    Recursively convert Firestore data types to JSON-serializable Python types.
    
    Args:
        value: The value to convert
        
    Returns:
        JSON-serializable version of the value
    """
    if isinstance(value, datetime):
        return value.isoformat()
    elif isinstance(value, firestore.DocumentReference):
        return {
            "_type": "DocumentReference",
            "path": value.path,
            "id": value.id
        }
    elif isinstance(value, firestore.GeoPoint):
        return {
            "_type": "GeoPoint",
            "latitude": value.latitude,
            "longitude": value.longitude
        }
    elif isinstance(value, dict):
        return {k: convert_firestore_value(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [convert_firestore_value(item) for item in value]
    else:
        return value


def export_collection(
    collection_ref,
    collection_name: str = "",
    progress_callback: Optional[Callable] = None
) -> Dict[str, Any]:
    """
    Export all documents from a collection, including subcollections.
    
    Args:
        collection_ref: Firestore collection reference
        collection_name: Name of the collection (for progress reporting)
        progress_callback: Optional callback function for progress updates
        
    Returns:
        Dictionary with document IDs as keys and document data as values
    """
    documents = {}
    doc_count = 0
    
    if progress_callback:
        progress_callback(f"Exporting collection: {collection_name}")
    
    for doc in collection_ref.stream():
        doc_data = doc.to_dict()
        
        # Convert Firestore-specific types
        converted_data = convert_firestore_value(doc_data)
        
        # Add document metadata
        converted_data["_documentId"] = doc.id
        converted_data["_documentPath"] = doc.reference.path
        
        # Check for subcollections
        subcollections = doc.reference.collections()
        subcollection_data = {}
        
        for subcol in subcollections:
            subcol_name = subcol.id
            subcol_path = f"{collection_name}/{doc.id}/{subcol_name}"
            subcollection_data[subcol_name] = export_collection(
                subcol,
                subcol_path,
                progress_callback
            )
        
        if subcollection_data:
            converted_data["_subcollections"] = subcollection_data
        
        documents[doc.id] = converted_data
        doc_count += 1
    
    if progress_callback:
        progress_callback(f"  → Exported {doc_count} documents from {collection_name}")
    
    return documents


def export_firestore(
    credentials_path: str,
    output_path: str,
    progress_callback: Optional[Callable] = None
) -> Dict[str, Any]:
    """
    Export all collections and documents from Firestore.
    
    Args:
        credentials_path: Path to Firebase Admin SDK credentials JSON
        output_path: Directory or full path to save the export file
        progress_callback: Optional callback for progress updates
        
    Returns:
        Dictionary containing export results and file path
    """
    credentials_path = Path(credentials_path)
    output_target = Path(output_path)
    
    if not credentials_path.exists():
        raise FileNotFoundError(f"Credentials file not found: {credentials_path}")
    
    # Initialize Firebase using shared utility
    from firebase_utils import init_firebase
    
    if progress_callback:
        progress_callback("Initializing Firebase Admin SDK...")
    
    db = init_firebase(str(credentials_path))
    
    if progress_callback:
        progress_callback("Connected to Firestore")
    
    # Discover collections
    if progress_callback:
        progress_callback("Discovering collections...")
    
    collections = db.collections()
    collection_names = [col.id for col in collections]
    
    if not collection_names:
        raise Exception("No collections found in Firestore")
    
    if progress_callback:
        progress_callback(f"Found {len(collection_names)} collection(s): {', '.join(collection_names)}")
    
    # Export all collections
    firestore_data = {}
    
    for collection_name in collection_names:
        collection_ref = db.collection(collection_name)
        firestore_data[collection_name] = export_collection(
            collection_ref,
            collection_name,
            progress_callback
        )
    
    # Create export data structure
    export_timestamp = datetime.now().isoformat()
    
    # Extract project ID from credentials
    with open(credentials_path, 'r') as f:
        creds = json.load(f)
        project_id = creds.get('project_id', 'unknown')
    
    export_data = {
        "dateOfDownload": export_timestamp,
        "projectId": project_id,
        "exportMetadata": {
            "timestamp": export_timestamp,
            "collectionsCount": len(collection_names),
            "collectionNames": collection_names
        },
        "collections": firestore_data
    }
    
    # Determine output file path
    if output_target.suffix == '.json':
        output_file = output_target
        output_file.parent.mkdir(parents=True, exist_ok=True)
    else:
        # It's a directory
        output_target.mkdir(parents=True, exist_ok=True)
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = output_target / f"firestore_export_{timestamp_str}.json"
    
    if progress_callback:
        progress_callback(f"Saving export to: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    file_size = output_file.stat().st_size
    
    return {
        'success': True,
        'export_file': str(output_file),
        'export_data': export_data,
        'file_size': file_size,
        'collections_count': len(collection_names),
        'timestamp': export_timestamp
    }
