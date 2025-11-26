import L from 'leaflet';

export const createPoiMarker = (color, isEditing = false) =>
    L.divIcon({
        className: 'custom-poi-marker',
        html: `<div style="background-color: ${color}; width: ${isEditing ? 14 : 10}px; height: ${isEditing ? 14 : 10}px; border-radius: 50%; border: ${isEditing ? '2px' : '1.5px'} solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4); cursor: ${isEditing ? 'move' : 'pointer'};${isEditing ? ' outline: 2px solid ' + color + '40;' : ''}"></div>`,
        iconSize: [isEditing ? 14 : 10, isEditing ? 14 : 10],
        iconAnchor: [isEditing ? 7 : 5, isEditing ? 7 : 5],
        popupAnchor: [0, isEditing ? -7 : -5],
    });
