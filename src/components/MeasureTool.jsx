import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMapEvents, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import { useSettings } from '../context/SettingsContext';
import { convertDistance } from '../lib/geoUtils';
import L from 'leaflet';

export default function MeasureTool({ active, points, onPointsChange, onClose, locked, onLockToggle }) {
    const { settings } = useSettings();
    const [cursorPos, setCursorPos] = useState(null);
    const map = useMap();

    // Manage cursor style based on active state
    useEffect(() => {
        if (!active) {
            setCursorPos(null);
            map.getContainer().style.cursor = '';
        } else {
            map.getContainer().style.cursor = 'crosshair';
        }
    }, [active, map]);

    // Clear cursor position when locked to hide the preview line
    useEffect(() => {
        if (locked) {
            setCursorPos(null);
        }
    }, [locked]);

    // Keyboard shortcuts handler
    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            } else if (e.key === 'Backspace' && !locked && points.length > 0) {
                e.preventDefault();
                onPointsChange(prev => prev.slice(0, -1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, onPointsChange, onClose, locked, points.length]);

    // Handle click events
    const handleClick = useCallback((e) => {
        if (!active) return;

        if (locked) {
            // Start new measurement: clear points, unlock, and add clicked point
            onPointsChange([e.latlng]);
            onLockToggle?.();
        } else {
            // Add point to current measurement
            onPointsChange(prev => [...prev, e.latlng]);
        }
    }, [active, locked, onPointsChange, onLockToggle]);

    // Handle mouse move events
    const handleMouseMove = useCallback((e) => {
        if (active && !locked) {
            setCursorPos(e.latlng);
        }
    }, [active, locked]);

    // Handle right-click (context menu) events
    const handleContextMenu = useCallback((e) => {
        if (!active) return;

        // Prevent default context menu
        L.DomEvent.preventDefault(e.originalEvent);

        // Toggle lock state
        onLockToggle?.();
    }, [active, onLockToggle]);

    useMapEvents({
        click: handleClick,
        mousemove: handleMouseMove,
        contextmenu: handleContextMenu
    });

    // Format distance with user's preferred unit
    const formatDistance = useCallback((meters) => {
        const km = meters / 1000;
        const converted = convertDistance(km, settings.distanceUnit);
        return `${converted.toFixed(2)} ${settings.distanceUnit}`;
    }, [settings.distanceUnit]);

    // Calculate distance from last point to cursor
    const cursorDistance = useMemo(() => {
        if (points.length === 0 || !cursorPos) return 0;
        return points[points.length - 1].distanceTo(cursorPos);
    }, [points, cursorPos]);

    // Determine line color based on locked state
    const lineColor = locked ? '#10b981' : '#3b82f6'; // green when locked, blue when unlocked

    if (!active) return null;

    return (
        <>
            {/* Main polyline connecting all points */}
            {points.length > 0 && (
                <Polyline
                    positions={points}
                    pathOptions={{ color: lineColor, weight: 3 }}
                />
            )}

            {/* Dashed preview line from last point to cursor (only when unlocked) */}
            {points.length > 0 && cursorPos && !locked && (
                <Polyline
                    positions={[points[points.length - 1], cursorPos]}
                    pathOptions={{ color: lineColor, weight: 3, dashArray: '5, 10', opacity: 0.7 }}
                />
            )}

            {/* Markers at each measurement point */}
            {points.map((p, i) => (
                <Marker
                    key={`point-${i}`}
                    position={p}
                    icon={L.divIcon({
                        className: '',
                        html: `<div style="width: 12px; height: 12px; background: white; border: 2px solid ${lineColor}; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    })}
                />
            ))}

            {/* Cursor tooltip showing distance or instructions */}
            {cursorPos && !locked && (
                <Tooltip
                    position={cursorPos}
                    permanent
                    direction="right"
                    offset={[10, 0]}
                    className="measure-tooltip"
                >
                    {points.length === 0
                        ? 'Click to start measuring'
                        : `+${formatDistance(cursorDistance)}`
                    }
                </Tooltip>
            )}

            {/* Distance labels on each segment */}
            {points.map((p, i) => {
                if (i === points.length - 1) return null;

                const p1 = points[i];
                const p2 = points[i + 1];
                const segmentDistance = p1.distanceTo(p2);
                const midLat = (p1.lat + p2.lat) / 2;
                const midLng = (p1.lng + p2.lng) / 2;

                return (
                    <Marker
                        key={`segment-label-${i}`}
                        position={[midLat, midLng]}
                        icon={L.divIcon({
                            className: 'measure-segment-label',
                            html: `<div style="display: inline-block; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(4px); border: 1px solid ${locked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; color: white; font-size: 10px; font-weight: 500; padding: 3px 7px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">${formatDistance(segmentDistance)}</div>`,
                            iconSize: [0, 0],
                            iconAnchor: [0, 0]
                        })}
                    />
                );
            })}
        </>
    );
}
