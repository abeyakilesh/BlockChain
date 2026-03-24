"""
Vector Store — In-memory similarity search for fingerprints
Prototype-compatible interface for Pinecone/Milvus swap
"""

import hashlib
import threading


class VectorStore:
    """
    In-memory vector store using hash-based similarity.
    In production, swap for Pinecone/Milvus client with same interface.
    """
    
    def __init__(self):
        self._store = {}  # content_id -> {fingerprint, content_type, ...}
        self._lock = threading.Lock()
    
    def add(self, content_id: str, fingerprint: str, content_type: str = 'image', metadata: dict = None):
        """Store a fingerprint"""
        with self._lock:
            self._store[content_id] = {
                'content_id': content_id,
                'fingerprint': fingerprint,
                'content_type': content_type,
                'metadata': metadata or {},
            }
    
    def search(self, query_fingerprint: str, content_type: str = None, top_k: int = 5) -> list:
        """
        Search for similar fingerprints
        Returns sorted list of matches with similarity scores
        """
        results = []
        
        with self._lock:
            for cid, entry in self._store.items():
                # Filter by content type if specified
                if content_type and entry['content_type'] != content_type:
                    continue
                
                similarity = self._compute_similarity(
                    query_fingerprint,
                    entry['fingerprint']
                )
                
                results.append({
                    'content_id': cid,
                    'similarity': round(similarity, 4),
                    'content_type': entry['content_type'],
                })
        
        # Sort by similarity descending
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def delete(self, content_id: str):
        """Remove a fingerprint"""
        with self._lock:
            self._store.pop(content_id, None)
    
    def count(self) -> int:
        """Total stored fingerprints"""
        return len(self._store)
    
    def _compute_similarity(self, fp1: str, fp2: str) -> float:
        """
        Compute similarity between two hex fingerprints.
        Uses character-level comparison (Hamming-like for hex).
        
        For production with actual perceptual hashes, use:
        - Hamming distance for binary hashes
        - Cosine similarity for numeric feature vectors
        """
        if fp1 == fp2:
            return 1.0
        
        if not fp1 or not fp2:
            return 0.0
        
        # Convert hex to binary for bit-level comparison
        try:
            bin1 = bin(int(fp1, 16))[2:].zfill(len(fp1) * 4)
            bin2 = bin(int(fp2, 16))[2:].zfill(len(fp2) * 4)
            
            # Pad to same length
            max_len = max(len(bin1), len(bin2))
            bin1 = bin1.zfill(max_len)
            bin2 = bin2.zfill(max_len)
            
            # Hamming distance
            distance = sum(c1 != c2 for c1, c2 in zip(bin1, bin2))
            similarity = 1.0 - (distance / max_len)
            
            return max(0.0, similarity)
        except (ValueError, ZeroDivisionError):
            # Fallback: character comparison
            min_len = min(len(fp1), len(fp2))
            if min_len == 0:
                return 0.0
            matching = sum(1 for a, b in zip(fp1, fp2) if a == b)
            return matching / min_len
