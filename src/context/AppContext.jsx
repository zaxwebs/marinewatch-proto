import { createContext, useContext, useState, useEffect } from 'react';
import { ZONES as INITIAL_ZONES, VESSELS as INITIAL_VESSELS } from '../lib/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Initialize zones from localStorage or use default
    const [zones, setZones] = useState(() => {
        const savedZones = localStorage.getItem('marinetrack-zones');
        return savedZones ? JSON.parse(savedZones) : INITIAL_ZONES;
    });

    // Initialize vessels from localStorage or use default
    const [vessels, setVessels] = useState(() => {
        const savedVessels = localStorage.getItem('marinetrack-vessels');
        return savedVessels ? JSON.parse(savedVessels) : INITIAL_VESSELS;
    });

    // Save zones to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('marinetrack-zones', JSON.stringify(zones));
    }, [zones]);

    // Save vessels to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('marinetrack-vessels', JSON.stringify(vessels));
    }, [vessels]);

    const addZone = (zone) => {
        setZones([...zones, zone]);
    };

    const updateZone = (zoneId, updates) => {
        setZones(zones.map(z => z.id === zoneId ? { ...z, ...updates } : z));
    };

    const deleteZone = (zoneId) => {
        setZones(zones.filter(z => z.id !== zoneId));
    };

    const resetZones = () => {
        setZones(INITIAL_ZONES);
        localStorage.removeItem('marinetrack-zones');
    };

    const updateVessel = (vesselId, updates) => {
        setVessels(vessels.map(v => v.id === vesselId ? { ...v, ...updates } : v));
    };

    const resetVessels = () => {
        setVessels(INITIAL_VESSELS);
        localStorage.removeItem('marinetrack-vessels');
    };

    // Initialize POIs from localStorage or use empty array
    const [pois, setPois] = useState(() => {
        const savedPois = localStorage.getItem('marinetrack-pois');
        return savedPois ? JSON.parse(savedPois) : [];
    });

    // Save POIs to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('marinetrack-pois', JSON.stringify(pois));
    }, [pois]);

    const addPoi = (poi) => {
        setPois([...pois, poi]);
    };

    const updatePoi = (poiId, updates) => {
        setPois(pois.map(p => p.id === poiId ? { ...p, ...updates } : p));
    };

    const deletePoi = (poiId) => {
        setPois(pois.filter(p => p.id !== poiId));
    };

    const resetPois = () => {
        setPois([]);
        localStorage.removeItem('marinetrack-pois');
    };

    return (
        <AppContext.Provider value={{
            zones,
            setZones,
            addZone,
            updateZone,
            deleteZone,
            resetZones,
            vessels,
            setVessels,
            updateVessel,
            resetVessels,
            pois,
            setPois,
            addPoi,
            updatePoi,
            deletePoi,
            resetPois
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
