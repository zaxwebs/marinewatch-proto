import { subMinutes } from 'date-fns';

const VESSEL_TYPES = ['Cargo', 'Tanker', 'Fishing', 'Passenger', 'Tug'];
const STATUSES = ['Moored', 'Moving', 'Anchored', 'Drifting'];

export const ZONES = [{ "id": "z1764142358687", "name": "Zone 1", "type": "anchorage", "color": "#f59e0b", "description": "Commercial port area", "coordinates": [[1.3038272759700005, 103.99658203125001], [1.2928437684040126, 103.92929077148439], [1.257833522873487, 103.86062622070314], [1.1534865266428573, 103.92105102539064], [1.1501398061581674, 103.98327827453613], [1.182834521027629, 103.9918613433838], [1.2104659748842528, 104.00825500488283]] }, { "id": "z1764144093764", "name": "Zone 2", "type": "port", "color": "#10b981", "description": "Commercial port area", "coordinates": [[1.3254509160659214, 103.56622695922852], [1.2576619028552396, 103.52949142456056], [1.2303741774326145, 103.59146118164064], [1.3058866783157643, 103.60982894897462]] }];

export const POIS = [{ "id": "p1764219863307", "name": "Southern Islands", "type": "anchorage", "color": "#f59e0b", "description": "General point of interest", "lat": 1.2341498543325267, "lng": 103.82749557495119 }, { "id": "p1764219917887", "name": "Western Islands", "type": "general", "color": "#3b82f6", "description": "General point of interest", "lat": 1.2166443983257476, "lng": 103.77101898193361 }, { "id": "p1764220020891", "name": "Riau Islands", "type": "landmark", "color": "#8b5cf6", "description": "General point of interest", "lat": 1.1723653886524505, "lng": 103.83522033691408 }];

const generateHistory = (startLat, startLng, heading, speed, count = 20) => {
    const history = [];
    let currentLat = startLat;
    let currentLng = startLng;

    for (let i = 0; i < count; i++) {
        history.push({
            lat: currentLat,
            lng: currentLng,
            timestamp: subMinutes(new Date(), i * 10).toISOString(),
            speed: speed + (Math.random() - 0.5) * 2,
            heading: heading + (Math.random() - 0.5) * 10
        });
        // Move backwards
        currentLat -= (speed * 0.0001) * Math.cos(heading * Math.PI / 180);
        currentLng -= (speed * 0.0001) * Math.sin(heading * Math.PI / 180);
    }
    return history.reverse();
};

export const VESSELS = [
    {
        id: 'v1',
        name: 'Ocean Giant',
        type: 'Cargo',
        status: 'Moving',
        lat: 1.28,
        lng: 103.85,
        heading: 90,
        speed: 14.2,
        history: generateHistory(1.28, 103.85, 90, 14.2)

    },
    {
        id: 'v2',
        name: 'Sea Spirit',
        type: 'Tanker',
        status: 'Anchored',
        lat: 1.25,
        lng: 103.82,
        heading: 45,
        speed: 0.5,
        history: generateHistory(1.25, 103.82, 45, 0.5)

    },
    {
        id: 'v3',
        name: 'Pacific Voyager',
        type: 'Passenger',
        status: 'Moving',
        lat: 1.22,
        lng: 103.78,
        heading: 135,
        speed: 18.5,
        history: generateHistory(1.22, 103.78, 135, 18.5)

    },
    {
        id: 'v4',
        name: 'Coastal Ranger',
        type: 'Tug',
        status: 'Moving',
        lat: 1.29,
        lng: 103.88,
        heading: 270,
        speed: 8.0,
        history: generateHistory(1.29, 103.88, 270, 8.0)

    },
    {
        id: 'v5',
        name: 'Deep Blue',
        type: 'Fishing',
        status: 'Drifting',
        lat: 1.16,
        lng: 103.88,
        heading: 0,
        speed: 2.1,
        history: generateHistory(1.16, 103.88, 0, 2.1)

    }
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
