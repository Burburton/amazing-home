import Header from '@components/layout/Header'
import Sidebar from '@components/layout/Sidebar'
import MainWorkspace from '@components/layout/MainWorkspace'
import InspectorPanel from '@components/layout/InspectorPanel'
import WelcomePanel from '@components/shared/WelcomePanel'

function App() {
  return (
    <div className="workspace-grid">
      <WelcomePanel />
      <Header />
      <Sidebar />
      <MainWorkspace />
      <InspectorPanel />
    </div>
  )
}

export default App