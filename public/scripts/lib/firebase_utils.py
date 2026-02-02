"""
Firebase Utilities
==================
Shared utilities for Firebase operations.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
from typing import Tuple


def init_firebase(credentials_path: str) -> firestore.Client:
    """
    Initialize Firebase Admin SDK with proper cleanup of existing apps.
    
    This function safely handles the case where Firebase is already initialized
    by deleting the existing app first.
    
    Args:
        credentials_path: Path to Firebase Admin SDK credentials JSON
        
    Returns:
        Firestore client instance
        
    Raises:
        FileNotFoundError: If credentials file doesn't exist
    """
    cred_path = Path(credentials_path)
    
    if not cred_path.exists():
        raise FileNotFoundError(f"Credentials file not found: {credentials_path}")
    
    # Clean up any existing Firebase app
    try:
        firebase_admin.delete_app(firebase_admin.get_app())
    except ValueError:
        pass  # No existing app to delete
    
    # Initialize new app
    cred = credentials.Certificate(str(credentials_path))
    firebase_admin.initialize_app(cred)
    
    return firestore.client()
