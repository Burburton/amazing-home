/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback, useState, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect } from 'react-konva'
import useImage from 'use-image'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import EditorToolbar from './EditorToolbar'
import EditorModeSelector from './EditorModeSelector'
import UploadOverlay from './UploadOverlay'
import ErrorMessage from './ErrorMessage'
import { Point2D } from '@domain/floorplan/types'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
const MAX_FILE_SIZE = 10 * 1024 * 1024
const HANDLE_RADIUS = 8

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Loading image...</span>
      </div>
    </div>
  )
}

function Editor2D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  
  const { 
    document, workspace, selectedWallId, selectedFurnitureId, editorMode, pendingFurnitureCategory, pendingCustomFurnitureId, error,
    setSourceImage, setWorkspace, setError, fitToScreen, resetView, clearImage,
    addWall, updateWall, selectWall, setEditorMode, selectFurniture, updateFurniture, addFurnitureAtPosition, addCustomFurnitureAtPosition
  } = useFloorPlanStore()
  
  const sourceImage = document.sourceImage
  const walls = document.walls
  const furniture = document.furniture
  
  const [image, imageStatus] = useImage(sourceImage?.objectUrl || '')
  const stageRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG and PNG files are supported')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB')
      return
    }
    setIsImageLoading(true)
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      setSourceImage({
        id: `img-${Date.now()}`,
        name: file.name,
        objectUrl,
        width: img.width,
        height: img.height,
        uploadedAt: new Date().toISOString(),
      })
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setContainerSize({ width: rect.width, height: rect.height })
          fitToScreen(rect.width, rect.height)
        }
        setIsImageLoading(false)
      }, 100)
    }
    img.onerror = () => {
      setIsImageLoading(false)
      setError('Failed to load image')
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  }, [setSourceImage, setError, fitToScreen])

  // Track use-image loading status
  useEffect(() => {
    if (sourceImage && imageStatus === 'loading') {
      setIsImageLoading(true)
    } else if (imageStatus === 'loaded' || imageStatus === 'failed') {
      setIsImageLoading(false)
    }
  }, [imageStatus, sourceImage])

  const getCanvasPoint = useCallback((): Point2D | null => {
    const stage = stageRef.current
    if (!stage) return null
    const pointer = stage.getPointerPosition()
    if (!pointer) return null
    return {
      x: (pointer.x - workspace.positionX) / workspace.scale,
      y: (pointer.y - workspace.positionY) / workspace.scale,
    }
  }, [workspace])

  const handleCanvasClick = useCallback(() => {
    const point = getCanvasPoint()
    if (!point) return
    
    if (editorMode === 'drawWall' && sourceImage) {
      if (!drawingStart) {
        setDrawingStart(point)
      } else {
        addWall(drawingStart, point)
        setDrawingStart(null)
      }
    } else if (editorMode === 'placeFurniture' && pendingFurnitureCategory) {
      addFurnitureAtPosition(point)
    } else if (editorMode === 'placeFurniture' && pendingCustomFurnitureId) {
      addCustomFurnitureAtPosition(point)
    }
  }, [editorMode, sourceImage, drawingStart, addWall, getCanvasPoint, pendingFurnitureCategory, addFurnitureAtPosition, pendingCustomFurnitureId, addCustomFurnitureAtPosition])

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = workspace.scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const scaleBy = 1.1
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    const clampedScale = Math.max(0.1, Math.min(10, newScale))
    const mousePointTo = {
      x: (pointer.x - workspace.positionX) / oldScale,
      y: (pointer.y - workspace.positionY) / oldScale,
    }
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }
    setWorkspace({ scale: clampedScale, positionX: newPos.x, positionY: newPos.y })
  }, [workspace, setWorkspace])

  const handleDragEnd = useCallback((e: any) => {
    setWorkspace({ scale: workspace.scale, positionX: e.target.x(), positionY: e.target.y() })
  }, [workspace.scale, setWorkspace])

  const handleWallClick = useCallback((wallId: string) => {
    if (editorMode === 'select') {
      selectWall(wallId)
    }
  }, [editorMode, selectWall])

  const handleHandleDragEnd = useCallback((wallId: string, handleType: 'start' | 'end') => {
    const point = getCanvasPoint()
    if (!point) return
    updateWall(wallId, { [handleType]: point })
  }, [updateWall, getCanvasPoint])

  const selectedWall = walls.find(w => w.id === selectedWallId)

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <EditorModeSelector mode={editorMode} onChange={setEditorMode} />
        <EditorToolbar
          hasImage={!!sourceImage}
          onFit={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect()
              fitToScreen(rect.width - 40, rect.height - 80)
            }
          }}
          onReset={resetView}
          onClear={clearImage}
          onUpload={handleFileSelect}
        />
      </div>
      
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      
      {editorMode === 'drawWall' && drawingStart && (
        <div className="px-4 py-1 bg-yellow-50 border-b border-yellow-200 text-xs text-yellow-700">
          Click again to set wall end point
        </div>
      )}
      
      {editorMode === 'placeFurniture' && pendingFurnitureCategory && (
        <div className="px-4 py-1 bg-green-50 border-b border-green-200 text-xs text-green-700">
          Click on canvas to place furniture
        </div>
      )}
      
      <div className="flex-1 relative overflow-hidden">
        {isImageLoading && <LoadingOverlay />}
        
        {!sourceImage ? (
          <UploadOverlay onFileSelect={handleFileSelect} />
        ) : (
          <Stage
            ref={stageRef}
            width={containerSize.width - 40}
            height={containerSize.height - 80}
            scaleX={workspace.scale}
            scaleY={workspace.scale}
            x={workspace.positionX}
            y={workspace.positionY}
            draggable={editorMode === 'select' && !selectedWallId && !selectedFurnitureId}
            onWheel={handleWheel}
            onDragEnd={handleDragEnd}
            onClick={handleCanvasClick}
          >
            <Layer>
              {image && (
                <KonvaImage image={image} width={sourceImage.width} height={sourceImage.height} />
              )}
              
              {walls.map(wall => (
                <Line
                  key={wall.id}
                  points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
                  stroke={selectedWallId === wall.id ? '#0ea5e9' : '#374151'}
                  strokeWidth={wall.thickness}
                  lineCap="round"
                  onClick={() => handleWallClick(wall.id)}
                />
              ))}
              
              {furniture.map(item => (
                  <Rect
                    key={item.id}
                    x={item.position.x - item.width / 2}
                    y={item.position.y - item.height / 2}
                    width={item.width}
                    height={item.height}
                    fill={selectedFurnitureId === item.id ? '#0ea5e9' : '#10b981'}
                    stroke={selectedFurnitureId === item.id ? '#0369a1' : '#059669'}
                    strokeWidth={2}
                    cornerRadius={4}
                    onClick={() => selectFurniture(item.id)}
                    draggable={selectedFurnitureId === item.id}
                    onDragEnd={(e: any) => {
                      const newPos = {
                        x: e.target.x() + item.width / 2,
                        y: e.target.y() + item.height / 2,
                      }
                      updateFurniture(item.id, { position: newPos })
                    }}
                  />
                ))}
              
              {drawingStart && (
                <Circle x={drawingStart.x} y={drawingStart.y} radius={HANDLE_RADIUS} fill="#0ea5e9" />
              )}
              
              {selectedWall && (
                <>
                  <Circle
                    x={selectedWall.start.x}
                    y={selectedWall.start.y}
                    radius={HANDLE_RADIUS}
                    fill="#fff"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    draggable
                    onDragEnd={() => handleHandleDragEnd(selectedWall.id, 'start')}
                  />
                  <Circle
                    x={selectedWall.end.x}
                    y={selectedWall.end.y}
                    radius={HANDLE_RADIUS}
                    fill="#fff"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    draggable
                    onDragEnd={() => handleHandleDragEnd(selectedWall.id, 'end')}
                  />
                </>
              )}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}

export default Editor2D