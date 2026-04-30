import './App.css';
import { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

import Cursor from './components/Cursor';
import ParallaxBackground from './components/ParallaxBackground';
import VolumeControl from './components/audio/VolumeControl';

import Home from './pages/Home';
import FoolsErrand from './pages/FoolsErrand';
import Jalloseum from './pages/Jalloseum';
import JalloseumSubpage from './pages/JalloseumSubpage';
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
      <Cursor />
      <Outlet />
    </>
  );
}


// -----------------------------
// APP ROUTES
// -----------------------------
function App() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
      page_location: window.location.origin + location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return (
    <Routes>

      {/* FULL EXPERIENCE PAGES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/fools-errand/*" element={<FoolsErrand />} />
        <Route path="/jalloseum" element={<Jalloseum />} />
        <Route path="/jalloseum/commissions"    element={<JalloseumSubpage subfolder="Commissions"   title="Commissions" />} />
        <Route path="/jalloseum/fools-errand"   element={<JalloseumSubpage subfolder="Fools Errand"  title="Fool's Errand" />} />
        <Route path="/jalloseum/fan-art"        element={<JalloseumSubpage subfolder="Fan Art"        title="Fan Art" />} />
        <Route path="/jalloseum/thumbnails"     element={<JalloseumSubpage subfolder="Thumbnails"     title="Thumbnails" />} />
        <Route path="/jalloseum/jallologue"     element={<JalloseumSubpage subfolder="Jallologue"     title="Jallologue" />} />
        <Route path="/jalloseum/fake-albums"    element={<JalloseumSubpage subfolder="Fake Albums"    title="Fake Albums" />} />
        <Route path="/jalloseum/self-portraits" element={<JalloseumSubpage subfolder="Self Portraits" title="Self Portraits" />} />
        <Route path="/jalloseum/misc"           element={<JalloseumSubpage subfolder="Misc. & Memes"  title="Misc. & Memes" />} />
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