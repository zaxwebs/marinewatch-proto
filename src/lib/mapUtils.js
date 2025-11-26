import L from 'leaflet';

export const createPoiMarker = (color) =>
    L.divIcon({
        className: 'custom-poi-marker',
        html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        popupAnchor: [0, -5],
    });
