import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Zones from './pages/Zones';
import Vessels from './pages/Vessels';
import VesselDetail from './pages/VesselDetail';
import PointsOfInterest from './pages/PointsOfInterest';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zones" element={<Zones />} />
          <Route path="/vessels" element={<Vessels />} />
          <Route path="/vessels/:id" element={<VesselDetail />} />
          <Route path="/poi" element={<PointsOfInterest />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App
