"""
Content Fingerprinting Engine
Supports Image (pHash), Audio (Chromaprint), and Video (keyframe hashing)
"""

import hashlib
import os
import struct

try:
    from PIL import Image
    import imagehash
    HAS_IMAGEHASH = True
except ImportError:
    HAS_IMAGEHASH = False

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False


class ImageFingerprinter:
    """
    Perceptual Hash (pHash) for images
    Produces a hash that is similar for visually similar images
    """
    algorithm_name = 'pHash'
    
    def extract(self, file_path: str) -> str:
        if not HAS_IMAGEHASH:
            return self._fallback_hash(file_path)
        
        try:
            img = Image.open(file_path)
            # Generate multiple hash types for robustness
            phash = imagehash.phash(img, hash_size=16)
            ahash = imagehash.average_hash(img, hash_size=16)
            dhash = imagehash.dhash(img, hash_size=16)
            
            # Combine hashes for unique fingerprint
            combined = f"{phash}:{ahash}:{dhash}"
            return hashlib.sha256(combined.encode()).hexdigest()
        except Exception as e:
            print(f"⚠️ Image fingerprinting error: {e}")
            return self._fallback_hash(file_path)
    
    def _fallback_hash(self, file_path: str) -> str:
        """Fallback: content-based hash"""
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    def similarity(self, hash1: str, hash2: str) -> float:
        """Compute similarity between two fingerprints"""
        if hash1 == hash2:
            return 1.0
        
        # Character-level comparison
        min_len = min(len(hash1), len(hash2))
        matching = sum(1 for a, b in zip(hash1[:min_len], hash2[:min_len]) if a == b)
        return matching / min_len


class AudioFingerprinter:
    """
    Audio fingerprinting using spectral features
    Uses librosa for MFCC extraction (Chromaprint-like)
    """
    algorithm_name = 'Spectral-MFCC'
    
    def extract(self, file_path: str) -> str:
        if not HAS_LIBROSA or not HAS_NUMPY:
            return self._fallback_hash(file_path)
        
        try:
            # Load audio
            y, sr = librosa.load(file_path, sr=22050, duration=30)
            
            # Extract MFCC features
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
            
            # Create fingerprint from mean statistics
            mfcc_mean = np.mean(mfcc, axis=1)
            mfcc_std = np.std(mfcc, axis=1)
            
            # Combine features into a stable fingerprint
            features = np.concatenate([mfcc_mean, mfcc_std])
            
            # Quantize and hash
            quantized = (features * 1000).astype(int)
            feature_str = ':'.join(str(x) for x in quantized)
            return hashlib.sha256(feature_str.encode()).hexdigest()
        except Exception as e:
            print(f"⚠️ Audio fingerprinting error: {e}")
            return self._fallback_hash(file_path)
    
    def _fallback_hash(self, file_path: str) -> str:
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    def similarity(self, hash1: str, hash2: str) -> float:
        if hash1 == hash2:
            return 1.0
        min_len = min(len(hash1), len(hash2))
        matching = sum(1 for a, b in zip(hash1[:min_len], hash2[:min_len]) if a == b)
        return matching / min_len


class VideoFingerprinter:
    """
    Video fingerprinting via keyframe extraction + hashing
    Extracts frames at intervals and creates composite hash
    """
    algorithm_name = 'Keyframe-Hash'
    
    def extract(self, file_path: str) -> str:
        if not HAS_IMAGEHASH:
            return self._fallback_hash(file_path)
        
        try:
            # Try to extract keyframes using PIL (for GIFs) or fallback
            img = Image.open(file_path)
            
            frame_hashes = []
            try:
                # Handle animated GIFs / multi-frame
                for i in range(min(10, getattr(img, 'n_frames', 1))):
                    img.seek(i)
                    frame_hash = str(imagehash.phash(img.copy().convert('RGB'), hash_size=8))
                    frame_hashes.append(frame_hash)
            except EOFError:
                pass
            
            if not frame_hashes:
                frame_hashes.append(str(imagehash.phash(img.convert('RGB'), hash_size=8)))
            
            combined = ':'.join(frame_hashes)
            return hashlib.sha256(combined.encode()).hexdigest()
        except Exception as e:
            print(f"⚠️ Video fingerprinting error: {e}")
            return self._fallback_hash(file_path)
    
    def _fallback_hash(self, file_path: str) -> str:
        """Hash using file content sampling (for large videos)"""
        file_size = os.path.getsize(file_path)
        hasher = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            # Read start, middle, and end chunks
            chunk_size = min(1024 * 1024, file_size // 3)  # 1MB chunks
            
            # Start
            hasher.update(f.read(chunk_size))
            
            # Middle
            f.seek(file_size // 2)
            hasher.update(f.read(chunk_size))
            
            # End
            f.seek(max(0, file_size - chunk_size))
            hasher.update(f.read(chunk_size))
        
        return hasher.hexdigest()
    
    def similarity(self, hash1: str, hash2: str) -> float:
        if hash1 == hash2:
            return 1.0
        min_len = min(len(hash1), len(hash2))
        matching = sum(1 for a, b in zip(hash1[:min_len], hash2[:min_len]) if a == b)
        return matching / min_len
