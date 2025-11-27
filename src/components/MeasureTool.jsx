import { useState, useEffect } from 'react';
import { useMapEvents, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import { useSettings } from '../context/SettingsContext';
import { convertDistance } from '../lib/geoUtils';
import L from 'leaflet';

export default function MeasureTool({ active, points, onPointsChange, onClose }) {
    const { settings } = useSettings();
    const [cursorPos, setCursorPos] = useState(null);
    const map = useMap();

    useEffect(() => {
        if (!active) {
            setCursorPos(null);
            map.getContainer().style.cursor = '';
        } else {
            map.getContainer().style.cursor = 'crosshair';
        }
    }, [active, map]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
            if (e.key === 'Backspace') {
                onPointsChange(prev => prev.slice(0, -1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, onPointsChange, onClose]);

    useMapEvents({
        click(e) {
            if (active) {
                onPointsChange(prev => [...prev, e.latlng]);
            }
        },
        mousemove(e) {
            if (active) {
                setCursorPos(e.latlng);
            }
        },
        contextmenu(e) {
            if (active) {
                // Prevent default context menu
                L.DomEvent.preventDefault(e.originalEvent);
                onClose?.();
            }
        }
    });

    const formatDistance = (meters) => {
        const km = meters / 1000;
        const converted = convertDistance(km, settings.distanceUnit);
        return `${converted.toFixed(2)} ${settings.distanceUnit}`;
    };

    const getCursorDistance = () => {
        if (points.length === 0 || !cursorPos) return 0;
        return points[points.length - 1].distanceTo(cursorPos);
    };

    if (!active) return null;

    const cursorDistance = getCursorDistance();

    return (
        <>
            {points.length > 0 && (
                <Polyline
                    positions={points}
                    pathOptions={{ color: '#3b82f6', weight: 3 }}
                />
            )}
            {points.length > 0 && cursorPos && (
                <Polyline
                    positions={[points[points.length - 1], cursorPos]}
                    pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10' }}
                />
            )}
            {points.map((p, i) => (
                <Marker
                    key={i}
                    position={p}
                    icon={L.divIcon({
                        className: 'bg-white rounded-full border-2 border-blue-500 shadow-sm',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    })}
                />
            ))}
            {cursorPos && (
                <Tooltip
                    position={cursorPos}
                    permanent
                    direction="right"
                    offset={[10, 0]}
                >
                    {points.length === 0 ? 'Click to start' : `+${formatDistance(cursorDistance)}`}
                </Tooltip>
            )}
            {points.map((p, i) => {
                if (i === points.length - 1) return null;
                const p1 = points[i];
                const p2 = points[i + 1];
                const dist = p1.distanceTo(p2);
                const midLat = (p1.lat + p2.lat) / 2;
                const midLng = (p1.lng + p2.lng) / 2;

                return (
                    <Marker
                        key={`label-segment-${i}`}
                        position={[midLat, midLng]}
                        icon={L.divIcon({
                            className: 'measure-segment-label',
                            html: `<div style="display: inline-block; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.2); color: white; font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${formatDistance(dist)}</div>`,
                            iconSize: [0, 0],
                            iconAnchor: [0, 0]
                        })}
                    />
                )
            })}
        </>
    );
}
