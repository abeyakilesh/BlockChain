"""
Invisible Watermark Engine (Steganography)
Embeds creator identity into images for off-platform detection
"""

import hashlib

try:
    from PIL import Image
    import numpy as np
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False


class WatermarkEngine:
    """
    LSB (Least Significant Bit) steganography for invisible watermarking.
    Embeds a creator identifier into the least significant bits of image pixels.
    """
    
    MAGIC_HEADER = b'CC01'  # CreatorChain v01 marker
    
    def embed(self, input_path: str, output_path: str, creator_id: str) -> bool:
        """Embed invisible watermark into image"""
        if not HAS_DEPS:
            # Fallback: just copy the file
            import shutil
            shutil.copy2(input_path, output_path)
            return False
        
        try:
            img = Image.open(input_path).convert('RGB')
            pixels = np.array(img)
            
            # Create watermark payload
            payload = self._create_payload(creator_id)
            
            # Embed in LSBs
            flat = pixels.flatten()
            
            if len(payload) * 8 > len(flat):
                # Image too small for watermark, just copy
                img.save(output_path)
                return False
            
            for i, byte in enumerate(payload):
                for bit_idx in range(8):
                    pixel_idx = i * 8 + bit_idx
                    bit = (byte >> (7 - bit_idx)) & 1
                    flat[pixel_idx] = (flat[pixel_idx] & 0xFE) | bit
            
            watermarked = flat.reshape(pixels.shape)
            Image.fromarray(watermarked.astype(np.uint8)).save(output_path)
            return True
            
        except Exception as e:
            print(f"⚠️ Watermark embed error: {e}")
            import shutil
            shutil.copy2(input_path, output_path)
            return False
    
    def detect(self, image_path: str) -> dict:
        """Detect watermark in image"""
        if not HAS_DEPS:
            return {'detected': False, 'reason': 'Dependencies not available'}
        
        try:
            img = Image.open(image_path).convert('RGB')
            pixels = np.array(img).flatten()
            
            # Check for magic header
            header_bytes = self._extract_bytes(pixels, 0, len(self.MAGIC_HEADER))
            
            if header_bytes != self.MAGIC_HEADER:
                return {'detected': False}
            
            # Extract payload length (4 bytes after header)
            length_bytes = self._extract_bytes(pixels, len(self.MAGIC_HEADER), 4)
            payload_length = int.from_bytes(length_bytes, 'big')
            
            # Extract creator ID hash
            offset = len(self.MAGIC_HEADER) + 4
            creator_hash = self._extract_bytes(pixels, offset, min(payload_length, 32))
            
            return {
                'detected': True,
                'creator_hash': creator_hash.hex(),
            }
            
        except Exception as e:
            return {'detected': False, 'error': str(e)}
    
    def _create_payload(self, creator_id: str) -> bytes:
        """Create watermark payload: HEADER + LENGTH + CREATOR_HASH"""
        creator_hash = hashlib.sha256(creator_id.encode()).digest()
        payload = self.MAGIC_HEADER + len(creator_hash).to_bytes(4, 'big') + creator_hash
        return payload
    
    def _extract_bytes(self, flat_pixels, byte_offset: int, num_bytes: int) -> bytes:
        """Extract bytes from LSBs of pixel array"""
        result = bytearray()
        for i in range(num_bytes):
            byte = 0
            for bit_idx in range(8):
                pixel_idx = (byte_offset + i) * 8 + bit_idx
                if pixel_idx < len(flat_pixels):
                    bit = flat_pixels[pixel_idx] & 1
                    byte = (byte << 1) | bit
            result.append(byte)
        return bytes(result)
