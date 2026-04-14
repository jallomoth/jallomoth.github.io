import './App.css';
import ParallaxBackground from "./components/ParallaxBackground";
import Cursor from "./components/Cursor";

function App() {
  return (
    <>
      <ParallaxBackground />
      <Cursor />

      <div className="content">
        <header>
          <h1>Hello</h1>
        </header>
        <main>
          <p>This is the start</p>
        </main>
      </div>
    </>
  )
}

export default App
