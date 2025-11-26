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
