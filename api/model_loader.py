"""
CubiCasa5k Model Loader for Vercel Serverless

Downloads model weights from Vercel Blob Storage and caches locally.
Weights are ~40MB, stored externally to avoid Vercel function size limits.
"""

import os
import hashlib
import httpx
from pathlib import Path

# Vercel Blob Storage URL (configured in vercel.json)
WEIGHTS_URL = os.environ.get('WEIGHTS_URL', '')
WEIGHTS_CACHE_DIR = Path('/tmp/cubicasa5k_weights')
WEIGHTS_FILENAME = 'cubicasa5k_model.pt'
WEIGHTS_HASH = 'a1b2c3d4e5f6'  # TODO: Update with actual hash after upload

_model_instance = None
_model_loaded = False

def get_cache_path() -> Path:
    WEIGHTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return WEIGHTS_CACHE_DIR / WEIGHTS_FILENAME

def download_weights() -> Path:
    """
    Download model weights from Vercel Blob Storage.
    Returns local cache path.
    """
    cache_path = get_cache_path()
    
    if cache_path.exists():
        # Verify hash if file exists
        existing_hash = hashlib.md5(cache_path.read_bytes()).hexdigest()[:12]
        if existing_hash == WEIGHTS_HASH:
            return cache_path
        else:
            cache_path.unlink()
    
    if not WEIGHTS_URL:
        raise ValueError('WEIGHTS_URL not configured. Set in Vercel environment.')
    
    # Download weights
    response = httpx.get(WEIGHTS_URL, follow_redirects=True, timeout=60)
    
    if response.status_code != 200:
        raise ValueError(f'Failed to download weights: {response.status_code}')
    
    cache_path.write_bytes(response.content)
    
    # Verify hash
    downloaded_hash = hashlib.md5(response.content).hexdigest()[:12]
    if downloaded_hash != WEIGHTS_HASH:
        cache_path.unlink()
        raise ValueError(f'Weight hash mismatch: expected {WEIGHTS_HASH}, got {downloaded_hash}')
    
    return cache_path

def load_model():
    """
    Load CubiCasa5k model.
    Uses global cache to avoid reloading on warm starts.
    """
    global _model_instance, _model_loaded
    
    if _model_loaded and _model_instance:
        return _model_instance
    
    # Download weights
    weights_path = download_weights()
    
    # Import torch only when needed (avoid cold start overhead)
    import torch
    
    # Load model
    _model_instance = torch.load(weights_path, map_location='cpu')
    _model_instance.eval()
    _model_loaded = True
    
    return _model_instance

def is_model_loaded() -> bool:
    return _model_loaded

def get_model_info() -> dict:
    return {
        'loaded': _model_loaded,
        'weights_url': WEIGHTS_URL[:50] + '...' if WEIGHTS_URL else 'not configured',
        'cache_path': str(get_cache_path()),
        'weights_size_mb': round(get_cache_path().stat().st_size / 1024 / 1024, 2) if get_cache_path().exists() else 0
    }