import './App.css';
import { Routes, Route } from 'react-router-dom';
import Cursor from './components/Cursor';
import ParallaxBackground from './components/ParallaxBackground';
import Home from './pages/Home';
import FoolsErrand from './pages/FoolsErrand';
import ArtGallery from './pages/ArtGallery';
import Jalloseum from './pages/Jalloseum';
import About from './pages/About';
import Commissions from './pages/Commissions';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <ParallaxBackground />
      <Cursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fools-errand" element={<FoolsErrand />} />
        <Route path="/art-gallery" element={<ArtGallery />} />
        <Route path="/jalloseum" element={<Jalloseum />} />
        <Route path="/about" element={<About />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
