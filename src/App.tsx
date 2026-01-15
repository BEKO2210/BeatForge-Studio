import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">BeatForge Studio</h1>
        <p className="app-subtitle">Browser-based music visualizer creator</p>
      </header>
      <main className="app-main">
        <div className="canvas-placeholder">
          <p>Visualizer canvas will render here</p>
        </div>
      </main>
    </div>
  )
}

export default App
