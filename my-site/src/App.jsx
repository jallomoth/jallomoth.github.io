import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';

import Cursor from './components/Cursor';
import ParallaxBackground from './components/ParallaxBackground';
import VolumeControl from './components/audio/VolumeControl';

import Home from './pages/Home';
import FoolsErrand from './pages/FoolsErrand';
import Jalloseum from './pages/Jalloseum';
import ArtGallery from './pages/ArtGallery';
import Commissions from './pages/Commissions';
import Community from './pages/Community';
import Backstage from './pages/Backstage';
import NotFound from './pages/NotFound';


// -----------------------------
// MAIN LAYOUT (FULL EXPERIENCE)
// -----------------------------
function MainLayout() {
  return (
    <>
      <ParallaxBackground />
      <Cursor />
      <VolumeControl />

      <Outlet />
    </>
  );
}


// -----------------------------
// MINIMAL LAYOUT (NO UI)
// -----------------------------
function MinimalLayout() {
  return (
    <>
      <Cursor />;
      <Outlet />;
    </>
  );
}


// -----------------------------
// APP ROUTES
// -----------------------------
function App() {
  return (
    <Routes>

      {/* FULL EXPERIENCE PAGES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/fools-errand/*" element={<FoolsErrand />} />
        <Route path="/jalloseum" element={<Jalloseum />} />
        <Route path="/art-gallery" element={<ArtGallery />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/community" element={<Community />} />
        <Route path="/backstage" element={<Backstage />} />
      </Route>

      {/* MINIMAL PAGES (NO VOLUME CONTROL) */}
      <Route element={<MinimalLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>

    </Routes>
  );
}

export default App;