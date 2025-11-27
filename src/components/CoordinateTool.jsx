import { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';

export default function CoordinateTool({ active, onClose, onCursorChange }) {
    const map = useMap();

    useEffect(() => {
        if (!active) {
            onCursorChange?.(null);
            map.getContainer().style.cursor = '';
        } else {
            map.getContainer().style.cursor = 'crosshair';
        }
    }, [active, map, onCursorChange]);

    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, onClose]);

    useMapEvents({
        mousemove(e) {
            if (active) {
                onCursorChange?.(e.latlng);
            }
        },
        mouseout() {
            if (active) {
                onCursorChange?.(null);
            }
        }
    });

    return null;
}
