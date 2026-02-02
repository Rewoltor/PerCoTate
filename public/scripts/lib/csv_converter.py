#!/usr/bin/env python3
"""
Firestore to CSV Converter
===========================
Converts Firestore JSON exports to flat CSV files for analysis.

This module handles the Firestore export structure (with metadata, collections,
documents, and subcollections) and creates properly flattened CSV files.
"""

import json
import csv
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import sys


def flatten_participant_with_trials(participant_id: str, participant_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Flatten a participant document with trials subcollection into multiple rows.
    Each row represents one trial with participant data repeated.
    
    Args:
        participant_id: The participant document ID
        participant_data: The participant document data
        
    Returns:
        List of flattened rows (one per trial)
    """
    rows = []
    
    # Extract participant-level fields
    base_data = {
        'participant_id': participant_id,
        'user_id': participant_data.get('userID'),
        'treatment_group': participant_data.get('treatmentGroup'),
        'current_phase': participant_data.get('currentPhase'),
        'created_at': participant_data.get('createdAt'),
    }
    
    # Add demographics if present
    demographics = participant_data.get('demographics', {})
    if demographics:
        base_data.update({
            'age': demographics.get('age'),
            'gender': demographics.get('gender'),
            'school': demographics.get('school'),
            'residence': demographics.get('residence'),
            'experience_level': demographics.get('experienceLevel'),
            'healthcare_qualification': demographics.get('healthcareQualification'),
        })
    
    # Add Big5 personality data if present
    big5 = participant_data.get('big5', {})
    if big5:
        # Calculated traits
        traits = big5.get('calculatedTraits', {})
        base_data.update({
            'big5_conscientiousness': traits.get('Conscientiousness'),
            'big5_open_mindedness': traits.get('OpenMindedness'),
            'big5_extraversion': traits.get('Extraversion'),
            'big5_agreeableness': traits.get('Agreeableness'),
            'big5_neuroticism': traits.get('Neuroticism'),
        })
        
        # Calculated facets
        facets = big5.get('calculatedFacets', {})
        base_data.update({
            'facet_trust': facets.get('Trust'),
            'facet_sociability': facets.get('Sociability'),
            'facet_creative_imagination': facets.get('CreativeImagination'),
            'facet_emotional_volatility': facets.get('EmotionalVolatility'),
            'facet_aesthetic_sensitivity': facets.get('AestheticSensitivity'),
            'facet_anxiety': facets.get('Anxiety'),
            'facet_respectfulness': facets.get('Respectfulness'),
            'facet_responsibility': facets.get('Responsibility'),
            'facet_productiveness': facets.get('Productiveness'),
            'facet_assertiveness': facets.get('Assertiveness'),
            'facet_intellectual_curiosity': facets.get('IntellectualCuriosity'),
            'facet_depression': facets.get('Depression'),
            'facet_organization': facets.get('Organization'),
            'facet_compassion': facets.get('Compassion'),
            'facet_energy_level': facets.get('EnergyLevel'),
        })
        
        base_data['big5_timestamp'] = big5.get('timestamp')
    
    # Add IQ test data if present
    iq = participant_data.get('iq', {})
    if iq:
        base_data.update({
            'iq_score': iq.get('score'),
            'iq_time_remaining': iq.get('timeRemaining'),
            'iq_completed_at': iq.get('completedAt'),
        })
    
    # Add phase completion data
    base_data.update({
        'phase1_completed_at': participant_data.get('phase1CompletedAt'),
        'phase1_video_watched': participant_data.get('phase1VideoWatched'),
        'phase2_completed_at': participant_data.get('phase2CompletedAt'),
    })
    
    # Process trials subcollection
    subcollections = participant_data.get('_subcollections', {})
    trials = subcollections.get('trials', {})
    
    if trials:
        # Create one row per trial
        for trial_id, trial_data in trials.items():
            row = base_data.copy()
            row.update({
                'trial_id': trial_id,
                'trial_duration': trial_data.get('duration'),
                'trial_start_time': trial_data.get('startTime'),
                'trial_end_time': trial_data.get('endTime'),
                'trial_image': trial_data.get('image'),
                'trial_image_name': trial_data.get('imageName'),
                'trial_original_image_name': trial_data.get('originalImageName'),
                'initial_decision': trial_data.get('initialDecision'),
                'final_decision': trial_data.get('finalDecision'),
                'initial_confidence': trial_data.get('initialConfidence'),
                'final_confidence': trial_data.get('finalConfidence'),
                'confidence': trial_data.get('confidence'),
                'ai_shown': trial_data.get('aiShown'),
                'ai_prediction': trial_data.get('prediction'),
                'ai_confidence': trial_data.get('ai_confidence'),
                'reverted_decision': trial_data.get('revertedDecision'),
                'ground_truth_binary': trial_data.get('ground_truth_binary'),
                'ground_truth_raw': trial_data.get('ground_truth_raw'),
                'symptom1': trial_data.get('symptom1'),
                'symptom2': trial_data.get('symptom2'),
            })
            rows.append(row)
    else:
        # No trials - just add participant as single row
        rows.append(base_data)
    
    return rows


def flatten_collection(collection_name: str, collection_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Flatten a Firestore collection into a list of rows.
    
    Args:
        collection_name: Name of the collection
        collection_data: Dictionary of documents in the collection
        
    Returns:
        List of flattened rows
    """
    rows = []
    
    if collection_name == 'participants':
        # Special handling for participants with trials subcollection
        for doc_id, doc_data in collection_data.items():
            participant_rows = flatten_participant_with_trials(doc_id, doc_data)
            rows.extend(participant_rows)
    else:
        # Generic flattening for other collections
        for doc_id, doc_data in collection_data.items():
            row = {'document_id': doc_id}
            
            # Add all top-level fields (excluding metadata and subcollections)
            for key, value in doc_data.items():
                if not key.startswith('_'):
                    # Convert complex types to strings
                    if isinstance(value, (dict, list)):
                        row[key] = json.dumps(value)
                    else:
                        row[key] = value
            
            rows.append(row)
    
    return rows


def convert_firestore_to_csv(
    json_path: str,
    output_dir: str,
    verbose: bool = True
) -> Dict[str, Any]:
    """
    Convert a Firestore JSON export to CSV files.
    
    Args:
        json_path: Path to the Firestore JSON export file
        output_dir: Directory to save CSV files
        verbose: Whether to print progress messages
        
    Returns:
        Dictionary with conversion statistics and file paths
    """
    json_path = Path(json_path)
    output_dir = Path(output_dir)
    
    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")
    
    # Load JSON data
    if verbose:
        print(f"Loading JSON export from: {json_path}")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract metadata
    date_of_download = data.get('dateOfDownload', 'unknown')
    project_id = data.get('projectId', 'unknown')
    collections = data.get('collections', {})
    
    if verbose:
        print(f"Export Date: {date_of_download}")
        print(f"Project ID: {project_id}")
        print(f"Collections: {len(collections)}")
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert each collection to CSV
    results = {
        'date_of_download': date_of_download,
        'project_id': project_id,
        'files': [],
        'total_rows': 0,
        'collections': {}
    }
    
    for collection_name, collection_data in collections.items():
        if verbose:
            print(f"\nProcessing collection: {collection_name}")
        
        # Flatten collection
        rows = flatten_collection(collection_name, collection_data)
        
        if not rows:
            if verbose:
                print(f"  ⚠ No data to export for {collection_name}")
            continue
        
        # Write to CSV
        csv_filename = f"{collection_name}.csv"
        csv_path = output_dir / csv_filename
        
        # Get all unique keys across all rows to create comprehensive headers
        all_keys = set()
        for row in rows:
            all_keys.update(row.keys())
        
        # Sort keys for consistent column order
        fieldnames = sorted(all_keys)
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        file_size = csv_path.stat().st_size
        
        if verbose:
            print(f"  ✓ {csv_filename}: {len(rows)} rows, {file_size:,} bytes")
        
        results['files'].append(str(csv_path))
        results['total_rows'] += len(rows)
        results['collections'][collection_name] = {
            'rows': len(rows),
            'file': str(csv_path),
            'size_bytes': file_size
        }
    
    # Create metadata file
    metadata_path = output_dir / 'export_metadata.csv'
    metadata_rows = [{
        'export_date': date_of_download,
        'project_id': project_id,
        'collections_count': len(collections),
        'total_csv_files': len(results['files']),
        'total_rows': results['total_rows'],
        'conversion_date': datetime.now().isoformat()
    }]
    
    with open(metadata_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=metadata_rows[0].keys())
        writer.writeheader()
        writer.writerows(metadata_rows)
    
    results['files'].append(str(metadata_path))
    
    if verbose:
        print(f"\n✓ Conversion complete!")
        print(f"  Total CSV files: {len(results['files'])}")
        print(f"  Total rows: {results['total_rows']}")
        print(f"  Output directory: {output_dir}")
    
    return results


def main():
    """Command-line interface for the CSV converter."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Convert Firestore JSON export to CSV files'
    )
    parser.add_argument(
        'input',
        help='Path to Firestore JSON export file'
    )
    parser.add_argument(
        '-o', '--output',
        default='outputs/csv',
        help='Output directory for CSV files (default: outputs/csv)'
    )
    parser.add_argument(
        '-q', '--quiet',
        action='store_true',
        help='Suppress progress messages'
    )
    
    args = parser.parse_args()
    
    try:
        # Create timestamped output directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = Path(args.output) / f"export_{timestamp}"
        
        results = convert_firestore_to_csv(
            args.input,
            str(output_dir),
            verbose=not args.quiet
        )
        
        return 0
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
