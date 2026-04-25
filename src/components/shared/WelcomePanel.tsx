import { useState, useEffect } from 'react'

const WELCOME_KEY = 'amazing-home-welcome-seen'

function WelcomePanel() {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY)
    if (!seen) {
      setShow(true)
    }
  }, [])
  
  const handleDismiss = () => {
    localStorage.setItem(WELCOME_KEY, 'true')
    setShow(false)
  }
  
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to Amazing Home 👋
        </h2>
        
        <p className="text-gray-600 mb-4">
          A browser-based home layout visualization tool. Here's how to get started:
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-lg">1️⃣</span>
            <div>
              <span className="font-medium text-gray-900">Load a floor plan</span>
              <p className="text-sm text-gray-500">Upload your own or click "Demo" to see an example</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-lg">2️⃣</span>
            <div>
              <span className="font-medium text-gray-900">Trace walls</span>
              <p className="text-sm text-gray-500">Switch to "Draw Wall" mode, click start and end points</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-lg">3️⃣</span>
            <div>
              <span className="font-medium text-gray-900">View 3D Preview</span>
              <p className="text-sm text-gray-500">Click "3D Preview" to see your floor plan in 3D</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-lg">4️⃣</span>
            <div>
              <span className="font-medium text-gray-900">Add furniture</span>
              <p className="text-sm text-gray-500">Click furniture types in the sidebar, then click canvas to place</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-lg">5️⃣</span>
            <div>
              <span className="font-medium text-gray-900">Export your design</span>
              <p className="text-sm text-gray-500">Click "Export" to download your project as JSON</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded p-3 mb-4">
          <p className="text-xs text-gray-500">
            ⚠️ This is a design visualization tool. Not for construction or engineering validation.
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors font-medium"
        >
          Got it! Let's start
        </button>
      </div>
    </div>
  )
}

export default WelcomePanel