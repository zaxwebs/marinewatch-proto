import { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';

export default function CoordinateTool({ active, onClose, onCursorChange, locked, onLockToggle }) {
    const map = useMap();

    useEffect(() => {
        if (!active) {
            onCursorChange?.(null);
            map.getContainer().style.cursor = '';
        } else {
            map.getContainer().style.cursor = locked ? 'default' : 'crosshair';
        }
    }, [active, map, onCursorChange, locked]);

    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (locked) {
                    onLockToggle?.();
                } else {
                    onClose?.();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, onClose, locked, onLockToggle]);

    useMapEvents({
        mousemove(e) {
            if (active && !locked) {
                onCursorChange?.(e.latlng);
            }
        },
        mouseout() {
            if (active && !locked) {
                onCursorChange?.(null);
            }
        },
        click() {
            if (active) {
                onLockToggle?.();
            }
        }
    });

    return null;
}
