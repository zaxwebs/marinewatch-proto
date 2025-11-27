import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Zones from './pages/Zones';
import Vessels from './pages/Vessels';
import VesselDetail from './pages/VesselDetail';
import PointsOfInterest from './pages/PointsOfInterest';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="flex flex-col h-screen">
            <Navigation />
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/zones" element={<Zones />} />
                <Route path="/vessels" element={<Vessels />} />
                <Route path="/vessels/:id" element={<VesselDetail />} />
                <Route path="/poi" element={<PointsOfInterest />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AppProvider>
    </SettingsProvider>
  );
}

export default App
