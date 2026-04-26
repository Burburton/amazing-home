"""
Floor Plan Inference Engine

Runs CubiCasa5k model inference on floor plan images.
Outputs: walls, rooms, icons with confidence scores.
"""

import base64
import io
import json
import time
import numpy as np
from PIL import Image

# 44 class definitions from CubiCasa5k
ROOM_CLASSES = [
    'living_room', 'master_room', 'kitchen', 'bathroom', 'dining_room',
    'child_room', 'study_room', 'second_room', 'guest_room', 'balcony',
    'storage', 'wall'
]

ICON_CLASSES = [
    'door', 'window', 'bed', 'table', 'sofa', 'chair', 'tv',
    'refrigerator', 'sink', 'toilet', 'bathtub'
]

JUNCTION_CLASSES = [
    'junction_simple', 'junction_l', 'junction_t', 'junction_x',
    'junction_y', 'junction_end', 'junction_corner'
] + [f'junction_{i}' for i in range(14)]

ALL_CLASSES = ROOM_CLASSES + ICON_CLASSES + JUNCTION_CLASSES

def preprocess_image(image: Image.Image, target_size: int = 512) -> tuple:
    """
    Preprocess image for model inference.
    
    Args:
        image: PIL Image (RGB)
        target_size: Resize to this dimension (512 for performance)
    
    Returns:
        (tensor, original_size, scale_factors)
    """
    original_size = (image.width, image.height)
    
    # Resize
    image = image.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    # Convert to numpy array
    arr = np.array(image, dtype=np.float32) / 255.0
    
    # Normalize (standard ImageNet normalization)
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    arr = (arr - mean) / std
    
    # Convert to tensor shape (1, 3, H, W)
    tensor = np.transpose(arr, (2, 0, 1))
    tensor = np.expand_dims(tensor, 0)
    
    scale_x = original_size[0] / target_size
    scale_y = original_size[1] / target_size
    
    return tensor, original_size, (scale_x, scale_y)

def run_inference(tensor: np.ndarray, model) -> dict:
    """
    Run CubiCasa5k inference.
    
    Args:
        tensor: Preprocessed image tensor (1, 3, 512, 512)
        model: Loaded PyTorch model
    
    Returns:
        Raw model outputs (walls, rooms, icons masks)
    """
    import torch
    
    with torch.no_grad():
        input_tensor = torch.from_numpy(tensor)
        outputs = model(input_tensor)
    
    return {
        'wall_mask': outputs.get('wall', None),
        'room_mask': outputs.get('room', None),
        'icon_mask': outputs.get('icon', None),
        'junction_mask': outputs.get('junction', None)
    }

def postprocess_walls(wall_mask: np.ndarray, scale: tuple) -> list:
    """
    Extract wall line segments from wall mask.
    
    Args:
        wall_mask: Binary mask from model
        scale: (scale_x, scale_y) to convert back to original size
    
    Returns:
        List of wall segments with start/end points
    """
    if wall_mask is None:
        return []
    
    from scipy import ndimage
    from skimage.morphology import skeletonize
    
    scale_x, scale_y = scale
    
    # Skeletonize wall mask
    skeleton = skeletonize(wall_mask > 0.5)
    
    # Detect line segments from skeleton
    lines = detect_lines_from_skeleton(skeleton)
    
    walls = []
    for line in lines:
        walls.append({
            'start': {'x': round(line['start'][0] * scale_x), 'y': round(line['start'][1] * scale_y)},
            'end': {'x': round(line['end'][0] * scale_x), 'y': round(line['end'][1] * scale_y)},
            'thickness': round(line['thickness'] * max(scale_x, scale_y)),
            'confidence': line.get('confidence', 0.8)
        })
    
    return walls

def postprocess_rooms(room_mask: np.ndarray, scale: tuple) -> list:
    """
    Extract room polygons and types from room mask.
    
    Args:
        room_mask: Multi-class mask (H, W) with room type IDs
        scale: (scale_x, scale_y) to convert back to original size
    
    Returns:
        List of room polygons with type and confidence
    """
    if room_mask is None:
        return []
    
    scale_x, scale_y = scale
    rooms = []
    
    # For each room class, extract connected components
    for i, room_type in enumerate(ROOM_CLASSES):
        if i >= len(room_mask):
            continue
        
        class_mask = room_mask == i
        
        # Find connected components
        from scipy import ndimage
        labeled, num_features = ndimage.label(class_mask)
        
        for j in range(1, num_features + 1):
            component_mask = labeled == j
            
            # Extract polygon boundary
            polygon = extract_polygon_from_mask(component_mask, scale)
            
            if polygon:
                rooms.append({
                    'polygon': polygon,
                    'type': room_type,
                    'confidence': 0.85,
                    'area_pixels': int(np.sum(component_mask) * scale_x * scale_y)
                })
    
    return rooms

def postprocess_icons(icon_mask: np.ndarray, scale: tuple) -> list:
    """
    Extract furniture icons from icon mask.
    
    Args:
        icon_mask: Multi-class mask (H, W) with icon type IDs
        scale: (scale_x, scale_y) to convert back to original size
    
    Returns:
        List of icon bounding boxes with type and confidence
    """
    if icon_mask is None:
        return []
    
    scale_x, scale_y = scale
    icons = []
    
    # For each icon class, extract bounding boxes
    for i, icon_type in enumerate(ICON_CLASSES):
        if i >= len(icon_mask):
            continue
        
        class_mask = icon_mask == i
        
        # Find connected components
        from scipy import ndimage
        labeled, num_features = ndimage.label(class_mask)
        
        for j in range(1, num_features + 1):
            component_mask = labeled == j
            
            # Find bounding box
            rows = np.any(component_mask, axis=1)
            cols = np.any(component_mask, axis=0)
            
            if not np.any(rows) or not np.any(cols):
                continue
            
            rmin, rmax = np.where(rows)[0][[0, -1]]
            cmin, cmax = np.where(cols)[0][[0, -1]]
            
            icons.append({
                'bbox': {
                    'x': round(cmin * scale_x),
                    'y': round(rmin * scale_y),
                    'width': round((cmax - cmin + 1) * scale_x),
                    'height': round((rmax - rmin + 1) * scale_y)
                },
                'type': icon_type,
                'confidence': 0.9
            })
    
    return icons

def detect_lines_from_skeleton(skeleton: np.ndarray) -> list:
    """
    Detect line segments from skeletonized mask.
    
    Uses endpoint detection and path tracing.
    """
    from skimage.graph import route_through_array
    
    lines = []
    
    # Find endpoints (pixels with exactly 1 neighbor)
    endpoints = find_endpoints(skeleton)
    
    # Connect endpoints to form lines
    for i, start in enumerate(endpoints):
        for j, end in enumerate(endpoints[i+1:], i+1):
            # Check if path exists between endpoints
            try:
                path, cost = route_through_array(
                    1 - skeleton.astype(float),
                    start, end,
                    fully_connected=True
                )
                
                if len(path) > 10:  # Minimum line length
                    lines.append({
                        'start': path[0],
                        'end': path[-1],
                        'thickness': 10,  # Default wall thickness
                        'confidence': 1.0 - (cost / len(path))
                    })
            except:
                continue
    
    return lines

def find_endpoints(skeleton: np.ndarray) -> list:
    """
    Find endpoint pixels in skeleton (pixels with exactly 1 neighbor).
    """
    endpoints = []
    
    for i in range(1, skeleton.shape[0] - 1):
        for j in range(1, skeleton.shape[1] - 1):
            if skeleton[i, j]:
                # Count neighbors
                neighbors = np.sum(skeleton[i-1:i+2, j-1:j+2]) - 1
                if neighbors == 1:
                    endpoints.append((i, j))
    
    return endpoints

def extract_polygon_from_mask(mask: np.ndarray, scale: tuple) -> list:
    """
    Extract polygon boundary from binary mask.
    
    Uses contour tracing to get polygon vertices.
    """
    scale_x, scale_y = scale
    
    # Find contour points
    from scipy import ndimage
    
    # Edge detection on mask
    edge = ndimage.binary_dilation(mask) & ~mask
    
    # Get edge coordinates
    points = np.argwhere(edge)
    
    if len(points) < 10:
        return []
    
    # Simplify polygon (keep key vertices)
    # Use convex hull for simplicity
    from scipy.spatial import ConvexHull
    
    try:
        hull = ConvexHull(points)
        hull_points = points[hull.vertices]
        
        polygon = [
            {'x': round(p[1] * scale_x), 'y': round(p[0] * scale_y)}
            for p in hull_points
        ]
        
        return polygon
    except:
        return []

def full_inference_pipeline(image: Image.Image, model) -> dict:
    """
    Complete inference pipeline: preprocess → inference → postprocess.
    
    Args:
        image: PIL Image (RGB)
        model: Loaded CubiCasa5k model
    
    Returns:
        dict with walls, rooms, icons, confidence, processing_time_ms
    """
    start_time = time.time()
    
    # Preprocess
    tensor, original_size, scale = preprocess_image(image)
    
    # Inference
    outputs = run_inference(tensor, model)
    
    # Postprocess
    walls = postprocess_walls(
        outputs.get('wall_mask'),
        scale
    )
    
    rooms = postprocess_rooms(
        outputs.get('room_mask'),
        scale
    )
    
    icons = postprocess_icons(
        outputs.get('icon_mask'),
        scale
    )
    
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    # Overall confidence (average of detection confidences)
    confidences = (
        [w.get('confidence', 0.8) for w in walls] +
        [r.get('confidence', 0.85) for r in rooms] +
        [i.get('confidence', 0.9) for i in icons]
    )
    overall_confidence = sum(confidences) / len(confidences) if confidences else 0.5
    
    return {
        'walls': walls,
        'rooms': rooms,
        'icons': icons,
        'confidence': round(overall_confidence, 2),
        'processing_time_ms': elapsed_ms,
        'model_version': 'cubicasa5k-v1'
    }