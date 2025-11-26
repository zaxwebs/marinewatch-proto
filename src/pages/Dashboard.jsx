import { useState } from 'react';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';
import Notifications from '../components/Notifications';
import ReplayBar from '../components/ReplayBar';
import LayerControl from '../components/LayerControl';
import { NOTIFICATIONS } from '../lib/mockData';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
    const { zones, vessels, pois } = useApp();
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [replayVessel, setReplayVessel] = useState(null);
    const [replayPosition, setReplayPosition] = useState(null);
    const [layerVisibility, setLayerVisibility] = useState({});

    const handleReplayStart = (vessel) => {
        setReplayVessel(vessel);
        setSelectedVessel(vessel);
    };

    const handleReplayClose = () => {
        setReplayVessel(null);
        setReplayPosition(null);
    };

    const displayVessels = vessels.map(v => {
        if (replayVessel && v.id === replayVessel.id && replayPosition) {
            return {
                ...v,
                lat: replayPosition.lat,
                lng: replayPosition.lng,
                heading: replayPosition.heading,
                speed: replayPosition.speed
            };
        }
        return v;
    });

    // Create layer objects for the layer control
    const layers = [
        ...zones.map(zone => ({
            id: `zone-${zone.id}`,
            name: zone.name,
            type: 'zone',
            color: zone.color,
            visible: layerVisibility[`zone-${zone.id}`] !== false
        })),
        {
            id: 'vessel-tracks',
            name: 'Vessel Tracks',
            type: 'track',
            visible: layerVisibility['vessel-tracks'] !== false
        },
        {
            id: 'pois',
            name: 'Points of Interest',
            type: 'poi',
            visible: layerVisibility['pois'] !== false
        }
    ];

    const handleLayerToggle = (layerId) => {
        setLayerVisibility(prev => ({
            ...prev,
            [layerId]: prev[layerId] === false ? true : false
        }));
    };

    // Filter visible zones
    const visibleZones = zones.filter(zone =>
        layerVisibility[`zone-${zone.id}`] !== false
    );

    const showTracks = layerVisibility['vessel-tracks'] !== false;
    const showPois = layerVisibility['pois'] !== false;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
            <Sidebar
                vessels={vessels}
                selectedVessel={selectedVessel}
                onSelectVessel={setSelectedVessel}
                onReplayStart={handleReplayStart}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="relative flex-1 h-full w-full">
                <Map
                    vessels={displayVessels}
                    zones={visibleZones}
                    pois={pois}
                    selectedVessel={selectedVessel}
                    onSelectVessel={setSelectedVessel}
                    replayMode={!!replayVessel}
                    showTracks={showTracks}
                    showPois={showPois}
                />
                <Notifications notifications={NOTIFICATIONS} />
                <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
                {replayVessel && (
                    <ReplayBar
                        vessel={replayVessel}
                        onClose={handleReplayClose}
                        onUpdatePosition={setReplayPosition}
                    />
                )}
            </div>
        </div>
    );
}
