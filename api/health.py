"""
Health check endpoint for API status verification.
"""

import json
import os

USE_PLACEHOLDER = os.environ.get('USE_PLACEHOLDER', 'true').lower() == 'true'

def handler(request):
    model_status = 'placeholder' if USE_PLACEHOLDER else 'cubicasa5k'
    
    if not USE_PLACEHOLDER:
        try:
            from api.model_loader import get_model_info
            model_info = get_model_info()
            model_status = 'loaded' if model_info['loaded'] else 'not_loaded'
        except:
            model_status = 'error'
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': 'ok',
            'model_status': model_status,
            'mode': 'placeholder' if USE_PLACEHOLDER else 'production',
            'endpoints': ['/api/recognize', '/api/health']
        })
    }


if __name__ == '__main__':
    from flask import Flask, jsonify
    
    app = Flask(__name__)
    
    @app.route('/api/health', methods=['GET'])
    def health():
        result = handler(None)
        return jsonify(json.loads(result['body']))
    
    app.run(debug=True, port=8000)