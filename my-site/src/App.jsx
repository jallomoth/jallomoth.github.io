import './App.css';
import { Routes, Route } from 'react-router-dom';
import Cursor from './components/Cursor';
import ParallaxBackground from './components/ParallaxBackground';
import VolumeControl from './components/VolumeControl';
import Home from './pages/Home';
import FoolsErrand from './pages/FoolsErrand';
import Jalloseum from './pages/Jalloseum';
import ArtGallery from './pages/ArtGallery';
import Commissions from './pages/Commissions';
import Community from './pages/Community';
import Backstage from './pages/Backstage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <ParallaxBackground />
      <Cursor />
      <VolumeControl />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fools-errand" element={<FoolsErrand />} />
        <Route path="/jalloseum" element={<Jalloseum />} />
        <Route path="/art-gallery" element={<ArtGallery />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/community" element={<Community />} />
        <Route path="/backstage" element={<Backstage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
