/**
 * Floor Plan Recognition API Service
 * 
 * Provides client-side integration with Vercel serverless API
 * for CubiCasa5k floor plan recognition.
 */

const API_BASE_URL = 'https://amazing-home.vercel.app/api';

// Types for recognition results
export interface Point2D {
  x: number;
  y: number;
}

export interface DetectedWall {
  start: Point2D;
  end: Point2D;
  thickness: number;
}

export interface DetectedRoom {
  polygon: Point2D[];
  type: string;
  confidence: number;
}

export interface DetectedIcon {
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: string;
  confidence: number;
}

export interface RecognitionOptions {
  detect_walls?: boolean;
  detect_rooms?: boolean;
  detect_icons?: boolean;
}

export interface RecognitionResult {
  walls: DetectedWall[];
  rooms: DetectedRoom[];
  icons: DetectedIcon[];
  confidence: number;
  processing_time_ms: number;
  model_version: string;
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Convert image URL to base64 string
 */
export async function imageToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Resize image to 512x512 for faster API processing
 */
export async function resizeImageForApi(
  imageUrl: string,
  maxSize: number = 512
): Promise<string> {
  const img = new Image();
  img.src = imageUrl;
  
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
  
  if (!img.width || !img.height) {
    return imageUrl;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = maxSize;
  canvas.height = maxSize;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageUrl;
  
  ctx.drawImage(img, 0, 0, maxSize, maxSize);
  
  return canvas.toDataURL('image/png', 0.8);
}

/**
 * Call recognition API
 */
export async function recognizeFloorPlan(
  imageBase64: string,
  options?: RecognitionOptions
): Promise<RecognitionResult> {
  const response = await fetch(`${API_BASE_URL}/recognize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_base64: imageBase64,
      options: options || {
        detect_walls: true,
        detect_rooms: true,
        detect_icons: true,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Full recognition pipeline
 * 1. Resize image
 * 2. Call API
 * 3. Scale results back to original image size
 */
export async function recognizeFromImageUrl(
  imageUrl: string,
  originalWidth: number,
  originalHeight: number,
  options?: RecognitionOptions
): Promise<RecognitionResult> {
  // Resize for API
  const resizedBase64 = await resizeImageForApi(imageUrl);
  
  // Call API
  const result = await recognizeFloorPlan(resizedBase64, options);
  
  // Scale results back to original size
  const scaleX = originalWidth / 512;
  const scaleY = originalHeight / 512;
  
  // Scale walls
  const scaledWalls = result.walls.map(wall => ({
    start: {
      x: Math.round(wall.start.x * scaleX),
      y: Math.round(wall.start.y * scaleY),
    },
    end: {
      x: Math.round(wall.end.x * scaleX),
      y: Math.round(wall.end.y * scaleY),
    },
    thickness: Math.round(wall.thickness * Math.max(scaleX, scaleY)),
  }));
  
  // Scale rooms
  const scaledRooms = result.rooms.map(room => ({
    polygon: room.polygon.map(p => ({
      x: Math.round(p.x * scaleX),
      y: Math.round(p.y * scaleY),
    })),
    type: room.type,
    confidence: room.confidence,
  }));
  
  // Scale icons
  const scaledIcons = result.icons.map(icon => ({
    bbox: {
      x: Math.round(icon.bbox.x * scaleX),
      y: Math.round(icon.bbox.y * scaleY),
      width: Math.round(icon.bbox.width * scaleX),
      height: Math.round(icon.bbox.height * scaleY),
    },
    type: icon.type,
    confidence: icon.confidence,
  }));
  
  return {
    walls: scaledWalls,
    rooms: scaledRooms,
    icons: scaledIcons,
    confidence: result.confidence,
    processing_time_ms: result.processing_time_ms,
    model_version: result.model_version,
  };
}