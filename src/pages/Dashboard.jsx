import { useState, useMemo } from 'react';
import { Ruler, Crosshair } from 'lucide-react';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';
import Notifications from '../components/Notifications';
import ReplayBar from '../components/ReplayBar';
import LayerControl from '../components/LayerControl';
import MeasureControl from '../components/MeasureControl';
import CoordinateControl from '../components/CoordinateControl';
import { NOTIFICATIONS } from '../lib/mockData';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
    const { zones, vessels, pois } = useApp();
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [replayVessel, setReplayVessel] = useState(null);
    const [replayPosition, setReplayPosition] = useState(null);
    const [layerVisibility, setLayerVisibility] = useState({});
    const [activeTool, setActiveTool] = useState(null); // 'measure', 'coordinate', 'layers', null
    const [measurePoints, setMeasurePoints] = useState([]);
    const [isMeasureLocked, setIsMeasureLocked] = useState(false);
    const [cursorCoords, setCursorCoords] = useState(null);
    const [isCoordinateLocked, setIsCoordinateLocked] = useState(false);

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

    const totalMeasureDistance = useMemo(() => {
        if (measurePoints.length < 2) return 0;
        let dist = 0;
        for (let i = 0; i < measurePoints.length - 1; i++) {
            dist += measurePoints[i].distanceTo(measurePoints[i + 1]);
        }
        return dist;
    }, [measurePoints]);

    const handleMeasureClose = () => {
        setActiveTool(null);
        setMeasurePoints([]);
        setIsMeasureLocked(false);
    };

    const handleMeasureUndo = () => {
        setMeasurePoints(prev => prev.slice(0, -1));
    };

    const handleMeasureClear = () => {
        setMeasurePoints([]);
    };

    const handleCoordinateClose = () => {
        setActiveTool(null);
        setCursorCoords(null);
        setIsCoordinateLocked(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
            <Sidebar
                vessels={vessels}
                pois={pois}
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
                    measureMode={activeTool === 'measure'}
                    measurePoints={measurePoints}
                    onMeasurePointsChange={setMeasurePoints}
                    onMeasureClose={handleMeasureClose}
                    measureLocked={isMeasureLocked}
                    onMeasureLockToggle={() => setIsMeasureLocked(!isMeasureLocked)}
                    coordinateMode={activeTool === 'coordinate'}
                    onCoordinateClose={handleCoordinateClose}
                    onCursorCoordsChange={setCursorCoords}
                    coordinateLocked={isCoordinateLocked}
                    onCoordinateLockToggle={() => setIsCoordinateLocked(!isCoordinateLocked)}
                />
                <Notifications notifications={NOTIFICATIONS} />

                <div className="absolute top-20 right-4 z-[1000] flex flex-col gap-2 items-end">
                    <LayerControl
                        layers={layers}
                        onLayerToggle={handleLayerToggle}
                        isOpen={activeTool === 'layers'}
                        onToggle={() => setActiveTool(activeTool === 'layers' ? null : 'layers')}
                    />

                    <button
                        onClick={() => {
                            if (activeTool === 'measure') {
                                handleMeasureClose();
                            } else {
                                setActiveTool('measure');
                            }
                        }}
                        className={`p-2.5 rounded transition-all duration-200 shadow-lg border ${activeTool === 'measure' ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-foreground hover:bg-accent'}`}
                        title="Measure Distance"
                    >
                        <Ruler className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            if (activeTool === 'coordinate') {
                                handleCoordinateClose();
                            } else {
                                setActiveTool('coordinate');
                            }
                        }}
                        className={`p-2.5 rounded transition-all duration-200 shadow-lg border ${activeTool === 'coordinate' ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-foreground hover:bg-accent'}`}
                        title="Show Coordinates"
                    >
                        <Crosshair className="w-4 h-4" />
                    </button>
                </div>

                {activeTool === 'measure' && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                        <MeasureControl
                            distance={totalMeasureDistance}
                            onUndo={handleMeasureUndo}
                            onClear={handleMeasureClear}
                            onClose={handleMeasureClose}
                        />
                    </div>
                )}
                {activeTool === 'coordinate' && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                        <CoordinateControl
                            lat={cursorCoords?.lat ?? null}
                            lng={cursorCoords?.lng ?? null}
                            onClose={handleCoordinateClose}
                            isLocked={isCoordinateLocked}
                        />
                    </div>
                )}
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
