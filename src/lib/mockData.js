import { subMinutes } from 'date-fns';

const VESSEL_TYPES = ['Cargo', 'Tanker', 'Fishing', 'Passenger', 'Tug'];
const STATUSES = ['Moored', 'Moving', 'Anchored', 'Drifting'];

export const ZONES = [{ "id": "z1764142358687", "name": "Zone 1", "type": "anchorage", "color": "#f59e0b", "description": "Commercial port area", "coordinates": [[1.3038272759700005, 103.99658203125001], [1.2928437684040126, 103.92929077148439], [1.257833522873487, 103.86062622070314], [1.1534865266428573, 103.92105102539064], [1.1501398061581674, 103.98327827453613], [1.182834521027629, 103.9918613433838], [1.2104659748842528, 104.00825500488283]] }, { "id": "z1764144093764", "name": "Zone 2", "type": "port", "color": "#10b981", "description": "Commercial port area", "coordinates": [[1.3254509160659214, 103.56622695922852], [1.2576619028552396, 103.52949142456056], [1.2303741774326145, 103.59146118164064], [1.3058866783157643, 103.60982894897462]] }];

export const POIS = [{ "id": "p1764219863307", "name": "Southern Islands", "type": "anchorage", "color": "#f59e0b", "description": "General point of interest", "lat": 1.2341498543325267, "lng": 103.82749557495119 }, { "id": "p1764219917887", "name": "Western Islands", "type": "general", "color": "#3b82f6", "description": "General point of interest", "lat": 1.2166443983257476, "lng": 103.77101898193361 }, { "id": "p1764220020891", "name": "Riau Islands", "type": "landmark", "color": "#8b5cf6", "description": "General point of interest", "lat": 1.1723653886524505, "lng": 103.83522033691408 }];

const VESSEL_PATHS = [

    [
        [103.8289365, 1.1598085],
        [103.8234433, 1.1622113],
        [103.8234433, 1.1711358],
        [103.8200101, 1.1786874],
        [103.8128003, 1.1804036],
        [103.8059339, 1.1790306],
        [103.7987241, 1.1759414],
        [103.7942609, 1.1738818],
        [103.7884244, 1.1711358],
        [103.7825879, 1.1663303],
        [103.7750348, 1.1666736],
        [103.7664518, 1.1683898],
        [103.760272, 1.1670168],
        [103.7544355, 1.1632411],
        [103.7516889, 1.1580923],
        [103.748599, 1.1532867],
        [103.7437925, 1.1512272],
        [103.7376127, 1.1505407],
        [103.7321195, 1.1488244],
        [103.726283, 1.1488244]
    ],
    [
        [103.8032462, 1.2437469],
        [103.8046195, 1.241859],
        [103.8046195, 1.2404861],
        [103.8058212, 1.2380834],
        [103.8071944, 1.2365388],
        [103.8073661, 1.2339644],
        [103.8054778, 1.2320766],
        [103.8044479, 1.2295023],
        [103.8044479, 1.2274428],
        [103.8044479, 1.2240104],
        [103.8056495, 1.2217793],
        [103.8059928, 1.2183468],
        [103.8056495, 1.2147428],
        [103.8047912, 1.2116535],
        [103.8063361, 1.2083927],
        [103.8097694, 1.2063332],
        [103.8137176, 1.204617],
        [103.8188674, 1.2030724],
        [103.8223006, 1.201871]
    ],
    [
        [103.9019834, 1.2547633],
        [103.905245, 1.2549349],
        [103.9074766, 1.2542484],
        [103.9093649, 1.2533903],
        [103.9124548, 1.2528755],
        [103.9155447, 1.253562],
        [103.9200079, 1.2559647],
        [103.9237844, 1.2597403],
        [103.926016, 1.2630011],
        [103.9279043, 1.267978],
        [103.928076, 1.2722685],
        [103.9284193, 1.2769022],
        [103.9287626, 1.2811927],
        [103.9291059, 1.2844534],
        [103.9291059, 1.2875426],
        [103.9297926, 1.2913182],
        [103.9320242, 1.293206],
        [103.9349424, 1.2945789],
        [103.9404356, 1.295437],
        [103.9491903, 1.2956086]
    ],
    [
        [103.6742998, 1.1652118],
        [103.6741282, 1.168816],
        [103.6725832, 1.1707039],
        [103.6717249, 1.1739647],
        [103.669665, 1.1765391],
        [103.6667467, 1.1775689],
        [103.6638285, 1.1782554],
        [103.6600519, 1.1785986],
        [103.6564471, 1.1798],
        [103.6535288, 1.1813446],
        [103.6524988, 1.1842622],
        [103.6494089, 1.1859785],
        [103.6464907, 1.1870082],
        [103.6421992, 1.1873515],
        [103.6368777, 1.1870082],
        [103.6334444, 1.1868366],
        [103.6310412, 1.1883812],
        [103.6282946, 1.1897542],
        [103.6246897, 1.1909556],
        [103.6212565, 1.1916421],
        [103.6162783, 1.1911272],
        [103.6123301, 1.1906124],
        [103.6070086, 1.1926718],
        [103.6035754, 1.1947313]
    ],
    [
        [103.9094457, 1.222623],
        [103.9127073, 1.2222798],
        [103.9154538, 1.2219365],
        [103.9180288, 1.2210784],
        [103.9216337, 1.2191906],
        [103.9247236, 1.2188473],
        [103.9281568, 1.2186757],
        [103.9324483, 1.2183325],
        [103.9357099, 1.2171311],
        [103.9386281, 1.2154149],
        [103.943263, 1.2123257],
        [103.9482412, 1.2111243],
        [103.9521894, 1.2119824],
        [103.9557943, 1.2133554],
        [103.9602575, 1.2150716],
        [103.9648923, 1.2147284],
        [103.9688405, 1.2119824],
        [103.9710721, 1.2088932],
        [103.9721021, 1.205804],
        [103.9729604, 1.2009985]
    ]
];

// Helper functions for calculations
const toRad = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3440.065; // Radius of earth in nautical miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
};

const generateSmartHistory = (path, baseSpeed) => {
    if (!path || path.length === 0) return [];

    const history = [];
    const now = new Date();

    // Process backwards from the last point (current position)
    // path format is [lng, lat]

    // Start with the last point
    let currentTimestamp = now;

    for (let i = path.length - 1; i >= 0; i--) {
        const [lng, lat] = path[i];

        let heading = 0;
        let speed = baseSpeed;

        // Calculate incoming bearing (from previous point to this point)
        let bearingIn = null;
        if (i > 0) {
            const [prevLng, prevLat] = path[i - 1];
            bearingIn = calculateBearing(prevLat, prevLng, lat, lng);
        }

        // Calculate outgoing bearing (from this point to next point)
        let bearingOut = null;
        if (i < path.length - 1) {
            const [nextLng, nextLat] = path[i + 1];
            bearingOut = calculateBearing(lat, lng, nextLat, nextLng);

            // Calculate time difference for timestamp
            const dist = calculateDistance(lat, lng, nextLat, nextLng); // Nautical miles
            const timeDiffHours = dist / baseSpeed;
            const timeDiffMs = timeDiffHours * 60 * 60 * 1000;

            // Update currentTimestamp (moving backwards in time)
            currentTimestamp = new Date(currentTimestamp.getTime() - timeDiffMs);
        } else {
            // Last point (current position), timestamp is now
            currentTimestamp = now;
        }

        // Determine heading
        if (bearingIn !== null && bearingOut !== null) {
            // Intermediate point: average the bearings for smooth transition
            // Vector averaging to handle 350-10 degree crossover
            const radIn = toRad(bearingIn);
            const radOut = toRad(bearingOut);
            const x = Math.cos(radIn) + Math.cos(radOut);
            const y = Math.sin(radIn) + Math.sin(radOut);
            heading = (toDeg(Math.atan2(y, x)) + 360) % 360;
        } else if (bearingOut !== null) {
            // First point
            heading = bearingOut;
        } else if (bearingIn !== null) {
            // Last point
            heading = bearingIn;
        }

        // Add some micro-variation to speed for realism in the record
        speed = baseSpeed + (Math.random() - 0.5) * (baseSpeed * 0.1);

        history.unshift({
            lat,
            lng,
            timestamp: currentTimestamp.toISOString(),
            speed: Number(speed.toFixed(1)),
            heading: Number(heading.toFixed(1))
        });
    }

    return history;
};

const createVessel = (id, name, type, status, pathIndex, baseSpeed) => {
    const path = VESSEL_PATHS[pathIndex];
    const history = generateSmartHistory(path, baseSpeed);
    const current = history[history.length - 1];

    return {
        id,
        name,
        type,
        status,
        lat: current.lat,
        lng: current.lng,
        heading: current.heading,
        speed: current.speed,
        history
    };
};

export const VESSELS = [
    createVessel('v1', 'Ocean Giant', 'Cargo', 'Moving', 0, 14.2),
    createVessel('v2', 'Sea Spirit', 'Tanker', 'Moving', 1, 10.5),
    createVessel('v3', 'Pacific Voyager', 'Passenger', 'Moving', 2, 18.5),
    createVessel('v4', 'Coastal Ranger', 'Tug', 'Moving', 3, 8.0),
    createVessel('v5', 'Deep Blue', 'Fishing', 'Moving', 4, 5.1)
];

export const NOTIFICATIONS = [
    {
        id: 'n1',
        type: 'warning',
        title: 'Zone Violation',
        message: 'Vessel "Deep Blue" entered Restricted Military Zone.',
        time: '2 mins ago',
        read: false
    },
    {
        id: 'n2',
        type: 'info',
        title: 'Arrival',
        message: 'Vessel "Sea Spirit" has arrived at anchorage.',
        time: '15 mins ago',
        read: false
    },
    {
        id: 'n3',
        type: 'alert',
        title: 'Speed Alert',
        message: 'Vessel "Ocean Giant" exceeded speed limit in port zone.',
        time: '1 hour ago',
        read: true
    }
];