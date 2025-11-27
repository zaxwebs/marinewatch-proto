export function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getClosestPoi(vessel, pois) {
    if (!pois.length) return null;
    let closest = null;
    let minDist = Infinity;
    for (const poi of pois) {
        const dist = getDistanceKm(vessel.lat, vessel.lng, poi.lat, poi.lng);
        if (dist < minDist) {
            minDist = dist;
            closest = { ...poi, distance: dist };
        }
    }
    return closest;
}

/**
 * Convert distance from kilometers to specified unit
 * @param {number} km - Distance in kilometers
 * @param {string} toUnit - Target unit: 'km', 'nm' (nautical miles), or 'mi' (statute miles)
 * @returns {number} Converted distance
 */
export function convertDistance(km, toUnit) {
    switch (toUnit) {
        case 'nm':
            return km * 0.539957; // km to nautical miles
        case 'mi':
            return km * 0.621371; // km to statute miles
        case 'km':
        default:
            return km;
    }
}

/**
 * Format distance with appropriate unit label
 * @param {number} km - Distance in kilometers
 * @param {string} unit - Display unit: 'km', 'nm', or 'mi'
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted distance string (e.g., "5.4 nm")
 */
export function formatDistance(km, unit = 'nm', decimals = 1) {
    const converted = convertDistance(km, unit);
    return `${converted.toFixed(decimals)} ${unit}`;
}
