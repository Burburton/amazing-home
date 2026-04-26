"""
Floor Plan Recognition API (Vercel Serverless)

Endpoint: POST /api/recognize

Request: { image_base64, options }
Response: { walls, rooms, icons, confidence, processing_time_ms }
"""

import base64
import io
import json
import os
from PIL import Image

USE_PLACEHOLDER = os.environ.get('USE_PLACEHOLDER', 'true').lower() == 'true'

def handler(request):
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'POST only'})
        }
    
    try:
        body = json.loads(request.body)
        image_base64 = body.get('image_base64', '')
        options = body.get('options', {})
        
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        if USE_PLACEHOLDER:
            result = process_floorplan_placeholder(image, options)
        else:
            from api.model_loader import load_model
            from api.inference import full_inference_pipeline
            
            model = load_model()
            result = full_inference_pipeline(image, model)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e), 'traceback': str(e.__traceback__)})
        }


def process_floorplan_placeholder(image: Image.Image, options: dict) -> dict:
    """Placeholder implementation for testing without model."""
    
    detect_walls = options.get('detect_walls', True)
    detect_rooms = options.get('detect_rooms', True)
    detect_icons = options.get('detect_icons', True)
    
    width, height = image.width, image.height
    scale_x, scale_y = width / 512, height / 512
    
    walls, rooms, icons = [], [], []
    
    if detect_walls:
        walls = [
            {'start': {'x': round(50 * scale_x), 'y': round(50 * scale_y)},
             'end': {'x': round(450 * scale_x), 'y': round(50 * scale_y)}, 'thickness': 10},
            {'start': {'x': round(50 * scale_x), 'y': round(50 * scale_y)},
             'end': {'x': round(50 * scale_x), 'y': round(450 * scale_y)}, 'thickness': 10},
            {'start': {'x': round(450 * scale_x), 'y': round(50 * scale_y)},
             'end': {'x': round(450 * scale_x), 'y': round(450 * scale_y)}, 'thickness': 10},
            {'start': {'x': round(50 * scale_x), 'y': round(450 * scale_y)},
             'end': {'x': round(450 * scale_x), 'y': round(450 * scale_y)}, 'thickness': 10}
        ]
    
    if detect_rooms:
        rooms = [{
            'polygon': [
                {'x': round(50 * scale_x), 'y': round(50 * scale_y)},
                {'x': round(450 * scale_x), 'y': round(50 * scale_y)},
                {'x': round(450 * scale_x), 'y': round(450 * scale_y)},
                {'x': round(50 * scale_x), 'y': round(450 * scale_y)}
            ],
            'type': 'living_room', 'confidence': 0.7
        }]
    
    if detect_icons:
        icons = [{
            'bbox': {'x': round(150 * scale_x), 'y': round(50 * scale_y),
                     'width': round(30 * scale_x), 'height': round(10 * scale_y)},
            'type': 'door', 'confidence': 0.8
        }]
    
    return {
        'walls': walls, 'rooms': rooms, 'icons': icons,
        'confidence': 0.75, 'processing_time_ms': 50,
        'model_version': 'placeholder-v1'
    }


if __name__ == '__main__':
    from flask import Flask, request, jsonify
    import sys
    sys.path.insert(0, '.')
    
    app = Flask(__name__)
    
    @app.route('/api/recognize', methods=['POST'])
    def recognize():
        result = handler(request)
        return jsonify(json.loads(result['body'])), result['statusCode']
    
    @app.route('/api/health', methods=['GET'])
    def health():
        from api.health import handler as health_handler
        result = health_handler(request)
        return jsonify(json.loads(result['body'])), result['statusCode']
    
    print(f"Running in {'placeholder' if USE_PLACEHOLDER else 'production'} mode")
    app.run(debug=True, port=8000)