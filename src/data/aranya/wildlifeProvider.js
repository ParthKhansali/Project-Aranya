/**
 * ARANYA — Wildlife Intelligence Provider
 * Clean abstraction for wildlife observations and camera trap sensor stations.
 * Future integration: SpeciesNet / Wildlife Insights / Authorized camera feeds.
 */

export const INITIAL_CAMERA_TRAPS = [
  {
    id: 'CAM-017',
    name: 'Chilla-Motichur Corridor North',
    lat: 30.042,
    lon: 78.212,
    elevation: 360,
    status: 'ONLINE',
    battery: 88,
    imagesToday: 24,
    lastDetection: {
      species: 'Leopard',
      time: '19:42',
      confidence: 0.94,
      image: '/assets/wildlife/leopard_cam17.jpg',
    },
    habitat: 'Riverine Sal Scrub',
    installedDate: '2025-11-10',
  },
  {
    id: 'CAM-018',
    name: 'Raiwala Railway Interface',
    lat: 30.024,
    lon: 78.204,
    elevation: 345,
    status: 'ONLINE',
    battery: 76,
    imagesToday: 31,
    lastDetection: {
      species: 'Asian Elephant',
      time: '18:15',
      confidence: 0.96,
      image: '/assets/wildlife/elephant_cam18.jpg',
    },
    habitat: 'Railway Crossing Buffer',
    installedDate: '2025-09-14',
  },
  {
    id: 'CAM-022',
    name: 'Shyampur Settlement Fringe',
    lat: 29.938,
    lon: 78.192,
    elevation: 310,
    status: 'ONLINE',
    battery: 92,
    imagesToday: 18,
    lastDetection: {
      species: 'Leopard',
      time: '21:05',
      confidence: 0.89,
      image: '/assets/wildlife/leopard_cam22.jpg',
    },
    habitat: 'Agricultural Edge Scrub',
    installedDate: '2026-01-20',
  },
  {
    id: 'CAM-025',
    name: 'Motichur Core Track 3',
    lat: 30.068,
    lon: 78.175,
    elevation: 420,
    status: 'ONLINE',
    battery: 81,
    imagesToday: 14,
    lastDetection: {
      species: 'Bengal Tiger',
      time: '04:30',
      confidence: 0.92,
      image: '/assets/wildlife/tiger_cam25.jpg',
    },
    habitat: 'Dense Mixed Deciduous',
    installedDate: '2025-08-05',
  },
  {
    id: 'CAM-031',
    name: 'Song River Waterhole Pass',
    lat: 30.095,
    lon: 78.188,
    elevation: 480,
    status: 'ONLINE',
    battery: 69,
    imagesToday: 42,
    lastDetection: {
      species: 'Spotted Deer',
      time: '16:50',
      confidence: 0.98,
      image: '/assets/wildlife/deer_cam31.jpg',
    },
    habitat: 'Riparian Forest Bank',
    installedDate: '2025-10-18',
  },
  {
    id: 'CAM-039',
    name: 'Laldhang Buffer Station',
    lat: 29.862,
    lon: 78.315,
    elevation: 330,
    status: 'ONLINE',
    battery: 84,
    imagesToday: 12,
    lastDetection: {
      species: 'Wild Boar',
      time: '22:15',
      confidence: 0.91,
      image: '/assets/wildlife/boar_cam39.jpg',
    },
    habitat: 'Foothill Sal Boundary',
    installedDate: '2026-02-02',
  },
  {
    id: 'CAM-044',
    name: 'Ramnagar Foothills Sensor 1',
    lat: 29.542,
    lon: 78.975,
    elevation: 390,
    status: 'ONLINE',
    battery: 79,
    imagesToday: 28,
    lastDetection: {
      species: 'Bengal Tiger',
      time: '02:40',
      confidence: 0.95,
      image: '/assets/wildlife/tiger_cam44.jpg',
    },
    habitat: 'Corbett Buffer Ridge',
    installedDate: '2025-07-12',
  },
];

export const INITIAL_OBSERVATIONS = [
  {
    id: 'WL-017',
    species: 'Leopard',
    scientificName: 'Panthera pardus fusca',
    lat: 30.044,
    lon: 78.214,
    timestamp: '19:42 (17 min ago)',
    confidence: 0.94,
    source: 'CAM-017',
    cameraName: 'Chilla-Motichur Corridor North',
    status: 'Recent',
    activityLevel: 'HIGH',
    recentMovement: 'South-East towards human-wildlife interface',
    nearbySettlement: 'Raiwala Fringe (1.4 km)',
    conflictRiskIndex: 87,
    sampleImage: '/assets/wildlife/leopard_sample.jpg',
    isSimulation: false,
  },
  {
    id: 'WL-018',
    species: 'Asian Elephant',
    scientificName: 'Elephas maximus',
    lat: 30.026,
    lon: 78.207,
    timestamp: '18:15 (1h 44m ago)',
    confidence: 0.96,
    source: 'CAM-018',
    cameraName: 'Raiwala Railway Interface',
    status: 'Active Herd (6 individuals)',
    activityLevel: 'HIGH',
    recentMovement: 'North-West foraging along railway easement',
    nearbySettlement: 'Raiwala Outer (0.8 km)',
    conflictRiskIndex: 78,
    sampleImage: '/assets/wildlife/elephant_sample.jpg',
    isSimulation: false,
  },
  {
    id: 'WL-019',
    species: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    lat: 30.065,
    lon: 78.172,
    timestamp: '04:30 (Today)',
    confidence: 0.92,
    source: 'CAM-025',
    cameraName: 'Motichur Core Track 3',
    status: 'Patrolling Core',
    activityLevel: 'MODERATE',
    recentMovement: 'East toward Chilla water drainage',
    nearbySettlement: 'Motichur Forest Post (3.8 km)',
    conflictRiskIndex: 42,
    sampleImage: '/assets/wildlife/tiger_sample.jpg',
    isSimulation: false,
  },
  {
    id: 'WL-020',
    species: 'Leopard',
    scientificName: 'Panthera pardus fusca',
    lat: 29.940,
    lon: 78.195,
    timestamp: '21:05 (Yesterday)',
    confidence: 0.89,
    source: 'CAM-022',
    cameraName: 'Shyampur Settlement Fringe',
    status: 'Fringe Encounter Risk',
    activityLevel: 'HIGH',
    recentMovement: 'South toward Shyampur village livestock pens',
    nearbySettlement: 'Shyampur Village (0.5 km)',
    conflictRiskIndex: 82,
    sampleImage: '/assets/wildlife/leopard_sample.jpg',
    isSimulation: false,
  },
  {
    id: 'WL-021',
    species: 'Spotted Deer',
    scientificName: 'Axis axis',
    lat: 30.092,
    lon: 78.185,
    timestamp: '16:50 (Today)',
    confidence: 0.98,
    source: 'CAM-031',
    cameraName: 'Song River Waterhole Pass',
    status: 'Herd Foraging (22 individuals)',
    activityLevel: 'NOMINAL',
    recentMovement: 'Stationary at riverbank',
    nearbySettlement: 'Doiwala Buffer (4.2 km)',
    conflictRiskIndex: 25,
    sampleImage: '/assets/wildlife/deer_sample.jpg',
    isSimulation: false,
  },
  {
    id: 'WL-022',
    species: 'Wild Boar',
    scientificName: 'Sus scrofa cristatus',
    lat: 29.865,
    lon: 78.318,
    timestamp: '22:15 (Yesterday)',
    confidence: 0.91,
    source: 'CAM-039',
    cameraName: 'Laldhang Buffer Station',
    status: 'Crop Edge Activity',
    activityLevel: 'ELEVATED',
    recentMovement: 'East into sugarcane agricultural plots',
    nearbySettlement: 'Laldhang Outskirts (0.9 km)',
    conflictRiskIndex: 64,
    sampleImage: '/assets/wildlife/boar_sample.jpg',
    isSimulation: false,
  },
  {
    id: 'WL-023',
    species: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    lat: 29.545,
    lon: 78.978,
    timestamp: '02:40 (Today)',
    confidence: 0.95,
    source: 'CAM-044',
    cameraName: 'Ramnagar Foothills Sensor 1',
    status: 'Corbett Buffer Transit',
    activityLevel: 'MODERATE',
    recentMovement: 'West along Kosi river corridor',
    nearbySettlement: 'Dhikuli Village (1.8 km)',
    conflictRiskIndex: 58,
    sampleImage: '/assets/wildlife/tiger_sample.jpg',
    isSimulation: false,
  },
];

export class WildlifeProvider {
  async getObservations() {
    throw new Error('Not implemented');
  }
  async getCameraTraps() {
    throw new Error('Not implemented');
  }
  async getObservationById(id) {
    throw new Error('Not implemented');
  }
}

export class DemoWildlifeProvider extends WildlifeProvider {
  constructor() {
    super();
    this._cameras = JSON.parse(JSON.stringify(INITIAL_CAMERA_TRAPS));
    this._observations = JSON.parse(JSON.stringify(INITIAL_OBSERVATIONS));
    this._subscribers = new Set();
  }

  async getObservations() {
    return [...this._observations];
  }

  async getCameraTraps() {
    return [...this._cameras];
  }

  async getObservationById(id) {
    return this._observations.find((o) => o.id === id) || null;
  }

  async getCameraById(id) {
    return this._cameras.find((c) => c.id === id) || null;
  }

  subscribe(listener) {
    this._subscribers.add(listener);
    return () => this._subscribers.delete(listener);
  }

  _notify() {
    for (const listener of this._subscribers) {
      try {
        listener();
      } catch (err) {
        console.warn('[WildlifeProvider] listener error:', err);
      }
    }
  }

  /**
   * Inject a new simulated observation (used by Event Simulator).
   */
  addSimulatedObservation(event) {
    const id = `SIM-WL-${Math.floor(100 + Math.random() * 900)}`;
    const newObs = {
      id,
      species: event.species || 'Leopard',
      scientificName: event.scientificName || 'Panthera pardus fusca',
      lat: event.lat || 30.046,
      lon: event.lon || 78.218,
      timestamp: event.time || 'Just now (Simulated)',
      confidence: event.confidence || 0.95,
      source: event.cameraId || 'CAM-017',
      cameraName: event.cameraName || 'Chilla-Motichur Corridor North',
      status: 'SIMULATED EVENT',
      activityLevel: 'CRITICAL',
      recentMovement: event.movement || 'Moving South-West towards Raiwala settlements',
      nearbySettlement: event.settlement || 'Raiwala (1.1 km)',
      conflictRiskIndex: event.riskIndex || 87,
      sampleImage: event.sampleImage || '/assets/wildlife/leopard_sample.jpg',
      isSimulation: true,
    };

    this._observations.unshift(newObs);

    // Also update the camera trap if matched
    const cam = this._cameras.find((c) => c.id === newObs.source);
    if (cam) {
      cam.imagesToday += 1;
      cam.lastDetection = {
        species: newObs.species,
        time: 'Just now',
        confidence: newObs.confidence,
        image: newObs.sampleImage,
      };
    }

    this._notify();
    return newObs;
  }

  reset() {
    this._cameras = JSON.parse(JSON.stringify(INITIAL_CAMERA_TRAPS));
    this._observations = JSON.parse(JSON.stringify(INITIAL_OBSERVATIONS));
    this._notify();
  }
}

export const demoWildlifeProvider = new DemoWildlifeProvider();
export const defaultWildlifeProvider = demoWildlifeProvider;
