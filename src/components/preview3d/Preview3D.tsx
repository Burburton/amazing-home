import { Canvas } from '@react-three/fiber'
import { Box, Plane, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFloorPlanStore } from '@store/useFloorPlanStore'
import { wallToMeshData, computeBoundingBox } from '@domain/floorplan/geometry'
import { getCatalogEntry } from '@domain/floorplan/furniture-catalog'

function Scene() {
  const { document, selectedFurnitureId } = useFloorPlanStore()
  const walls = document.walls
  const furniture = document.furniture
  const ceilingHeight = document.settings.ceilingHeight * 100
  const boundingBox = computeBoundingBox(walls)

  const wallMeshes = walls.map(wall => wallToMeshData(wall, ceilingHeight))

  const furnitureColorMap: Record<string, string> = {
    sofa: '#8b5cf6',
    bed: '#ec4899',
    dining_table: '#f59e0b',
    chair: '#10b981',
    desk: '#3b82f6',
    cabinet: '#6366f1',
    coffee_table: '#14b8a6',
  }

  if (walls.length === 0 && furniture.length === 0) {
    return (
      <>
        <PerspectiveCamera makeDefault position={[300, 400, 300]} fov={50} />
        <OrbitControls target={[0, 0, 0]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[200, 400, 200]} intensity={1} />
        <Box args={[100, 100, 100]} position={[0, 50, 0]}>
          <meshStandardMaterial color="#6b7280" />
        </Box>
      </>
    )
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[boundingBox.centerX + 300, 400, boundingBox.centerY + 300]} fov={50} />
      <OrbitControls target={[boundingBox.centerX, 0, boundingBox.centerY]} />
      
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[200, 400, 200]}
        intensity={1.2}
      />
      
      <Plane
        args={[boundingBox.width + 200, boundingBox.height + 200]}
        position={[boundingBox.centerX, 0, boundingBox.centerY]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#e5e5e5" />
      </Plane>
      
      {wallMeshes.map((mesh, index) => (
        <Box
          key={walls[index]?.id || index}
          args={mesh.args}
          position={mesh.position}
          rotation={mesh.rotation}
        >
          <meshStandardMaterial 
            color={walls[index]?.isLoadBearing ? '#9ca3af' : '#6b7280'}
          />
        </Box>
      ))}
      
      {furniture.map(item => {
        const catalogEntry = getCatalogEntry(item.category)
        const color = furnitureColorMap[item.category] || '#10b981'
        const height = (catalogEntry?.defaultElevation ?? 50) / 100
        const yPosition = height / 2
        
        return (
          <Box
            key={item.id}
            args={[item.width, height, item.height]}
            position={[item.position.x, yPosition, item.position.y]}
            rotation={[0, -(item.rotation * Math.PI / 180), 0]}
          >
            <meshStandardMaterial 
              color={selectedFurnitureId === item.id ? '#0ea5e9' : color}
              opacity={selectedFurnitureId === item.id ? 0.9 : 1}
            />
          </Box>
        )
      })}
    </>
  )
}

function Preview3D() {
  const { document } = useFloorPlanStore()
  const walls = document.walls
  const furniture = document.furniture

  return (
    <div className="h-full bg-gray-900">
      <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
        3D Preview - {walls.length} walls, {furniture.length} furniture
      </div>
      
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  )
}

export default Preview3D