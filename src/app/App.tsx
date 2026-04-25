import Header from '@components/layout/Header'
import Sidebar from '@components/layout/Sidebar'
import MainWorkspace from '@components/layout/MainWorkspace'
import InspectorPanel from '@components/layout/InspectorPanel'

/**
 * App Shell for Amazing Home
 * 
 * Layout structure:
 * - Header: Top navigation bar
 * - Sidebar: Left panel for project/tools
 * - MainWorkspace: Center area for 2D/3D editing
 * - InspectorPanel: Right panel for properties
 */
function App() {
  return (
    <div className="workspace-grid">
      {/* Header spans full width */}
      <Header />
      
      {/* Sidebar - tools and project navigation */}
      <Sidebar />
      
      {/* Main workspace - 2D editor and 3D preview */}
      <MainWorkspace />
      
      {/* Inspector panel - properties and settings */}
      <InspectorPanel />
    </div>
  )
}

export default App