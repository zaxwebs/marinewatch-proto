import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createPoiMarker } from '../lib/mapUtils';

import MeasureTool from './MeasureTool';
import CoordinateTool from './CoordinateTool';

// Fix for default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ selectedVessel }) {
    const map = useMap();
    useEffect(() => {
        if (selectedVessel) {
            map.setView([selectedVessel.lat, selectedVessel.lng], 14);
        }
    }, [selectedVessel, map]);
    return null;
}

const createShipIcon = (heading, type, isSelected) => {
    const color = isSelected ? 'hsl(217, 91%, 60%)' : 'hsl(215, 10%, 60%)';
    const iconMarkup = renderToStaticMarkup(
        <div className={`relative transition-all duration-300 ${isSelected ? 'scale-125' : ''}`} style={{ transform: `rotate(${heading}deg)` }}>
            <Navigation
                size={20}
                fill={color}
                color={isSelected ? '#fff' : 'hsl(220, 13%, 11%)'}
                strokeWidth={1.5}
            />
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'bg-transparent',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

export default function Map({ vessels, zones, pois = [], selectedVessel, onSelectVessel, replayMode, showTracks = true, showPois = true, measureMode = false, measurePoints = [], onMeasurePointsChange, onMeasureClose, coordinateMode = false, onCoordinateClose, onCursorCoordsChange, coordinateLocked, onCoordinateLockToggle }) {
    return (
        <MapContainer
            center={[1.28, 103.85]}
            zoom={12}
            className="h-full w-full z-0"
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapController selectedVessel={selectedVessel} />
            <MeasureTool active={measureMode} points={measurePoints} onPointsChange={onMeasurePointsChange} onClose={onMeasureClose} />
            <CoordinateTool active={coordinateMode} onClose={onCoordinateClose} onCursorChange={onCursorCoordsChange} locked={coordinateLocked} onLockToggle={onCoordinateLockToggle} />

            {zones.map(zone => (
                <Polygon
                    key={zone.id}
                    positions={zone.coordinates}
                    pathOptions={{
                        color: zone.color,
                        fillColor: zone.color,
                        fillOpacity: 0.08,
                        weight: 1.5,
                        dashArray: zone.type === 'restricted' ? '8, 4' : null
                    }}
                />
            ))}

            {showTracks && selectedVessel && (
                <Polyline
                    positions={selectedVessel.history.map(h => [h.lat, h.lng])}
                    pathOptions={{ color: 'hsl(217, 91%, 60%)', weight: 2, dashArray: '4, 4', opacity: 0.7 }}
                />
            )}

            {showPois && pois.map((poi) => (
                <Marker
                    key={poi.id}
                    position={[poi.lat, poi.lng]}
                    icon={createPoiMarker(poi.color)}
                >
                    <Popup>
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-medium text-sm mb-1">{poi.name}</h3>
                            <p className="text-xs text-muted-foreground">{poi.description || "No description"}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {vessels.map(vessel => (
                <Marker
                    key={vessel.id}
                    position={[vessel.lat, vessel.lng]}
                    icon={createShipIcon(vessel.heading, vessel.type, selectedVessel?.id === vessel.id)}
                    eventHandlers={{
                        click: () => onSelectVessel(vessel),
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="p-3">
                            <h3 className="font-semibold text-sm mb-1">{vessel.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{vessel.type}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">Speed</span>
                                    <span className="font-mono font-medium">{vessel.speed.toFixed(1)} kn</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">Status</span>
                                    <span className="font-medium">{vessel.status}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
