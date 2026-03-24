"""
CreatorChain AI Fingerprinting Service
Flask microservice for content fingerprinting and similarity detection
"""

from flask import Flask, request, jsonify
import os
import tempfile

from fingerprint import ImageFingerprinter, AudioFingerprinter, VideoFingerprinter
from vector_store import VectorStore
from watermark import WatermarkEngine

app = Flask(__name__)

# Initialize components
vector_store = VectorStore()
watermark_engine = WatermarkEngine()

# Fingerprinter registry
fingerprinters = {
    'image': ImageFingerprinter(),
    'audio': AudioFingerprinter(),
    'video': VideoFingerprinter(),
}

UPLOAD_DIR = os.environ.get('UPLOAD_DIR', '/tmp/uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

SIMILARITY_THRESHOLD = float(os.environ.get('SIMILARITY_THRESHOLD', '0.85'))


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'creatorchain-ai',
        'fingerprinters': list(fingerprinters.keys()),
        'stored_fingerprints': vector_store.count(),
    })


@app.route('/fingerprint', methods=['POST'])
def extract_fingerprint():
    """Extract fingerprint from uploaded file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    content_type = request.form.get('content_type', 'image')
    
    if content_type not in fingerprinters:
        return jsonify({'error': f'Unsupported content type: {content_type}'}), 400
    
    # Save temp file
    ext = os.path.splitext(file.filename)[1] if file.filename else '.tmp'
    temp_path = os.path.join(UPLOAD_DIR, f'fp_{os.urandom(8).hex()}{ext}')
    file.save(temp_path)
    
    try:
        fingerprinter = fingerprinters[content_type]
        fingerprint = fingerprinter.extract(temp_path)
        
        return jsonify({
            'fingerprint': fingerprint,
            'content_type': content_type,
            'algorithm': fingerprinter.algorithm_name,
        })
    except Exception as e:
        return jsonify({'error': f'Fingerprinting failed: {str(e)}'}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route('/compare', methods=['POST'])
def compare_fingerprint():
    """Compare a fingerprint against stored fingerprints"""
    data = request.get_json()
    
    if not data or 'fingerprint' not in data:
        return jsonify({'error': 'Fingerprint required'}), 400
    
    fingerprint = data['fingerprint']
    content_type = data.get('content_type', 'image')
    
    # Search vector store
    results = vector_store.search(fingerprint, content_type, top_k=5)
    
    is_duplicate = False
    best_match = None
    
    if results and results[0]['similarity'] >= SIMILARITY_THRESHOLD:
        is_duplicate = True
        best_match = results[0]
    
    return jsonify({
        'is_duplicate': is_duplicate,
        'threshold': SIMILARITY_THRESHOLD,
        'match_id': best_match['content_id'] if best_match else None,
        'similarity': best_match['similarity'] if best_match else 0,
        'results': results[:3],
    })


@app.route('/store', methods=['POST'])
def store_fingerprint():
    """Store a fingerprint in the vector database"""
    data = request.get_json()
    
    required = ['content_id', 'fingerprint', 'content_type']
    if not data or not all(k in data for k in required):
        return jsonify({'error': f'Required fields: {required}'}), 400
    
    vector_store.add(
        content_id=data['content_id'],
        fingerprint=data['fingerprint'],
        content_type=data['content_type'],
    )
    
    return jsonify({
        'stored': True,
        'content_id': data['content_id'],
        'total_stored': vector_store.count(),
    })


@app.route('/watermark', methods=['POST'])
def apply_watermark():
    """Apply invisible watermark to an image"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    creator_id = request.form.get('creator_id', 'unknown')
    
    ext = os.path.splitext(file.filename)[1] if file.filename else '.png'
    temp_path = os.path.join(UPLOAD_DIR, f'wm_{os.urandom(8).hex()}{ext}')
    output_path = os.path.join(UPLOAD_DIR, f'wm_out_{os.urandom(8).hex()}{ext}')
    file.save(temp_path)
    
    try:
        watermark_engine.embed(temp_path, output_path, creator_id)
        
        return jsonify({
            'watermarked': True,
            'output_path': output_path,
        })
    except Exception as e:
        return jsonify({'error': f'Watermarking failed: {str(e)}'}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    print(f"\n🧠 CreatorChain AI Service running on port {port}")
    print(f"   Fingerprinters: {list(fingerprinters.keys())}")
    print(f"   Similarity threshold: {SIMILARITY_THRESHOLD}\n")
    app.run(host='0.0.0.0', port=port, debug=debug)
