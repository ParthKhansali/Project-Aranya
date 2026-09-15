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
    icon: '🐆',
    scientificName: 'Panthera pardus fusca',
    lat: 30.044,
    lon: 78.214,
    timestamp: '19:42 (17 min ago)',
    confidence: 0.94,
    source: 'CAM-017',
    cameraName: 'Chilla-Motichur Corridor North',
    detectionMethod: 'Infrared Motion Trigger',
    locationName: 'Chilla-Motichur Corridor North',
    behaviorNotes:
      'Adult male moving downhill in scrub gully toward village pens',
    status: 'Recent Sighting',
    activityLevel: 'HIGH',
    recentMovement: 'South-East towards human-wildlife interface',
    nearbySettlement: 'Raiwala Fringe (1.4 km)',
    conflictRiskIndex: 87,
    sampleImage: '/assets/wildlife/leopard_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.201, 30.058, 410],
      [78.208, 30.051, 385],
      [78.214, 30.044, 360],
    ],
    predictedTrajectory: [
      [78.214, 30.044, 360],
      [78.22, 30.038, 350],
      [78.226, 30.031, 345],
      [78.232, 30.024, 340],
    ],
    conflictHotspot: {
      lon: 78.232,
      lat: 30.024,
      radius: 480,
      name: 'Raiwala Ward 4 Livestock Corrals',
      riskScore: 87,
      timeToImpact: '35 - 45 mins',
    },
    aiThoughtProcess: {
      model:
        'ARANYA Spatial Predictor v2.4 (Least-Cost Path + Friction Surface)',
      predictionSummary:
        'Ingress trajectory targeting unfortified domestic cattle pens in Raiwala Ward 4',
      confidenceScore: '91% Confidence',
      estimatedTimeOfArrival: '35 - 45 mins (approx 20:25 IST)',
      reasoningSteps: [
        {
          factor: 'Topographic Funneling',
          detail:
            'Animal is descending a seasonal scrub ravine with gentle slope (8-12°), avoiding steep 38° ridges.',
        },
        {
          factor: 'Canopy Concealment',
          detail:
            'Riverine scrub cover (78% canopy density) provides unbroken nocturnal cover down to 180m from fence.',
        },
        {
          factor: 'Foraging Attractant',
          detail:
            '14 unfortified domestic cattle bomas situated directly at ravine mouth; cattle kill logged 9 days ago.',
        },
        {
          factor: 'Illumination Avoidance',
          detail:
            'Path bends west, strictly avoiding the illuminated NH-7 bypass road corridor.',
        },
      ],
      recommendedActions: [
        'Deploy Quick Response Team (QRT) Unit Alpha to Sector 4 intercept culvert',
        'Activate solar perimeter sirens along gully exit boundary',
        'Broadcast automated SMS / WhatsApp advisory to Raiwala Ward 4 residents',
      ],
    },
  },
  {
    id: 'WL-018',
    species: 'Asian Elephant',
    icon: '🐘',
    scientificName: 'Elephas maximus',
    lat: 30.026,
    lon: 78.207,
    timestamp: '18:15 (1h 44m ago)',
    confidence: 0.96,
    source: 'CAM-018',
    cameraName: 'Raiwala Railway Interface',
    detectionMethod: 'Optical AI Station',
    locationName: 'Raiwala Railway Interface',
    behaviorNotes:
      'Breeding herd of 6 individuals foraging along railway siding',
    status: 'Active Herd (6 individuals)',
    activityLevel: 'HIGH',
    recentMovement: 'North-West foraging along railway easement',
    nearbySettlement: 'Raiwala Outer (0.8 km)',
    conflictRiskIndex: 84,
    sampleImage: '/assets/wildlife/elephant_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.225, 30.012, 330],
      [78.215, 30.019, 340],
      [78.207, 30.026, 345],
    ],
    predictedTrajectory: [
      [78.207, 30.026, 345],
      [78.202, 30.03, 350],
      [78.196, 30.036, 355],
    ],
    conflictHotspot: {
      lon: 78.202,
      lat: 30.03,
      radius: 550,
      name: 'Railway Track Embankment KM-42 Crossing',
      riskScore: 84,
      timeToImpact: '25 - 35 mins',
    },
    aiThoughtProcess: {
      model:
        'ARANYA Pachyderm Corridor Model (Markov Chain + Track Bathymetry)',
      predictionSummary:
        'Herds moving across Haridwar-Dehradun railway embankment to reach Motichur foraging grounds',
      confidenceScore: '94% Confidence',
      estimatedTimeOfArrival: '25 - 35 mins (approx 18:45 IST)',
      reasoningSteps: [
        {
          factor: 'Historic Migratory Route',
          detail:
            'Herd is traversing historic autumn migration corridor used annually for Ganges river access.',
        },
        {
          factor: 'Ripening Crop Attraction',
          detail:
            'Adjacent sugarcane fields detected via Sentinel-2 NDVI index (0.74); high foraging draw.',
        },
        {
          factor: 'Corridor Bottleneck',
          detail:
            'Only a 120m wide gap exists between highway flyover pier and canal, forcing track crossing.',
        },
        {
          factor: 'Collision Hazard',
          detail:
            'Upcoming passenger train (Dehradun Shatabdi) poses severe collision risk without speed warning.',
        },
      ],
      recommendedActions: [
        'Request immediate 20 km/h railway caution order from Northern Railway DRM Control Room',
        'Station Track Watchers at KM-42 culvert with high-intensity beam searchlights',
        'Activate acoustic bee sound deterrent along rail ballast edge',
      ],
    },
  },
  {
    id: 'WL-019',
    species: 'Bengal Tiger',
    icon: '🐅',
    scientificName: 'Panthera tigris tigris',
    lat: 30.065,
    lon: 78.172,
    timestamp: '04:30 (Today)',
    confidence: 0.92,
    source: 'CAM-025',
    cameraName: 'Motichur Core Track 3',
    detectionMethod: 'Infrared Motion Trigger',
    locationName: 'Motichur Core Track 3',
    behaviorNotes:
      'Adult male patrolling territorial scent marks along dry stream bed',
    status: 'Patrolling Core',
    activityLevel: 'MODERATE',
    recentMovement: 'East toward Chilla water drainage',
    nearbySettlement: 'Motichur Forest Post (3.8 km)',
    conflictRiskIndex: 42,
    sampleImage: '/assets/wildlife/tiger_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.16, 30.075, 450],
      [78.166, 30.07, 430],
      [78.172, 30.065, 410],
    ],
    predictedTrajectory: [
      [78.172, 30.065, 410],
      [78.178, 30.061, 395],
      [78.185, 30.057, 380],
    ],
    conflictHotspot: {
      lon: 78.185,
      lat: 30.057,
      radius: 400,
      name: 'Song River Confluence Deep Core',
      riskScore: 42,
      timeToImpact: '2 - 3 hours',
    },
    aiThoughtProcess: {
      model: 'ARANYA Apex Predator Tracking Engine',
      predictionSummary:
        'Core habitat movement with minimal human settlement interface risk',
      confidenceScore: '89% Confidence',
      estimatedTimeOfArrival: '2 - 3 hours',
      reasoningSteps: [
        {
          factor: 'Core Forest Security',
          detail:
            'Animal is deep within protected reserve boundary (>3.5 km from nearest human dwelling).',
        },
        {
          factor: 'Waterhole Dependency',
          detail:
            'Heading toward perennial river pool for dawn hydration following nightly patrol.',
        },
        {
          factor: 'Prey Density',
          detail:
            'High sambar and chital deer presence in compartment 18 ensures animal remains inside core.',
        },
      ],
      recommendedActions: [
        'Routine camera trap monitoring; no field team escalation required',
        'Record pugmark trajectory in national tiger census database',
      ],
    },
  },
  {
    id: 'WL-020',
    species: 'Leopard',
    icon: '🐆',
    scientificName: 'Panthera pardus fusca',
    lat: 29.94,
    lon: 78.195,
    timestamp: '21:05 (Yesterday)',
    confidence: 0.89,
    source: 'CAM-022',
    cameraName: 'Shyampur Settlement Fringe',
    detectionMethod: 'Infrared Motion Trigger',
    locationName: 'Shyampur Settlement Fringe',
    behaviorNotes: 'Sub-adult moving stealthily near village perimeter ditch',
    status: 'Fringe Encounter Risk',
    activityLevel: 'HIGH',
    recentMovement: 'South toward Shyampur village livestock pens',
    nearbySettlement: 'Shyampur Village (0.5 km)',
    conflictRiskIndex: 82,
    sampleImage: '/assets/wildlife/leopard_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.188, 29.952, 335],
      [78.191, 29.946, 320],
      [78.195, 29.94, 310],
    ],
    predictedTrajectory: [
      [78.195, 29.94, 310],
      [78.198, 29.935, 305],
      [78.202, 29.93, 300],
    ],
    conflictHotspot: {
      lon: 78.202,
      lat: 29.93,
      radius: 420,
      name: 'Shyampur South Agricultural Hamlet',
      riskScore: 82,
      timeToImpact: '20 - 30 mins',
    },
    aiThoughtProcess: {
      model: 'ARANYA Spatial Predictor v2.4 (Least-Cost Path)',
      predictionSummary:
        'Sub-adult leopard tracking perimeter livestock corrals in Shyampur',
      confidenceScore: '88% Confidence',
      estimatedTimeOfArrival: '20 - 30 mins',
      reasoningSteps: [
        {
          factor: 'Sugarcane Concealment',
          detail:
            'Dense 3m high sugarcane monoculture connects directly with forest boundary ditch.',
        },
        {
          factor: 'Stray Dog Presence',
          detail:
            'High concentration of feral dogs around village dump serves as major predatory lure.',
        },
      ],
      recommendedActions: [
        'Deploy Shyampur Anti-Depredation Squad to watchtower 2',
        'Sound vehicle horn deterrent and notify village sarpanch',
      ],
    },
  },
  {
    id: 'WL-021',
    species: 'Spotted Deer',
    icon: '🦌',
    scientificName: 'Axis axis',
    lat: 30.092,
    lon: 78.185,
    timestamp: '16:50 (Today)',
    confidence: 0.98,
    source: 'CAM-031',
    cameraName: 'Song River Waterhole Pass',
    detectionMethod: 'Thermal Camera',
    locationName: 'Song River Waterhole Pass',
    behaviorNotes: 'Large congregation grazing quietly along sandy river beach',
    status: 'Herd Foraging (22 individuals)',
    activityLevel: 'NOMINAL',
    recentMovement: 'Stationary at riverbank',
    nearbySettlement: 'Doiwala Buffer (4.2 km)',
    conflictRiskIndex: 25,
    sampleImage: '/assets/wildlife/deer_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.18, 30.095, 490],
      [78.185, 30.092, 480],
    ],
    predictedTrajectory: [
      [78.185, 30.092, 480],
      [78.188, 30.089, 470],
    ],
    conflictHotspot: null,
    aiThoughtProcess: {
      model: 'ARANYA Herbivore Dispersion Tracker',
      predictionSummary:
        'Stationary diurnal herd grazing with minimal conflict potential',
      confidenceScore: '96% Confidence',
      estimatedTimeOfArrival: 'N/A (Stationary in Core)',
      reasoningSteps: [
        {
          factor: 'Plentiful Forage',
          detail:
            'River silt vegetation provides abundant nutrition without need to leave reserve.',
        },
      ],
      recommendedActions: ['Log herd count for herbivore biomass assessment'],
    },
  },
  {
    id: 'WL-022',
    species: 'Wild Boar',
    icon: '🐗',
    scientificName: 'Sus scrofa cristatus',
    lat: 29.865,
    lon: 78.318,
    timestamp: '22:15 (Yesterday)',
    confidence: 0.91,
    source: 'CAM-039',
    cameraName: 'Laldhang Buffer Station',
    detectionMethod: 'Infrared Motion Trigger',
    locationName: 'Laldhang Buffer Station',
    behaviorNotes:
      'Sounder of 8 individuals foraging along potato and wheat fields',
    status: 'Crop Edge Activity',
    activityLevel: 'ELEVATED',
    recentMovement: 'East into sugarcane agricultural plots',
    nearbySettlement: 'Laldhang Outskirts (0.9 km)',
    conflictRiskIndex: 68,
    sampleImage: '/assets/wildlife/boar_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.31, 29.86, 340],
      [78.318, 29.865, 330],
    ],
    predictedTrajectory: [
      [78.318, 29.865, 330],
      [78.325, 29.87, 320],
    ],
    conflictHotspot: {
      lon: 78.325,
      lat: 29.87,
      radius: 380,
      name: 'Laldhang Rabi Crop Fields',
      riskScore: 68,
      timeToImpact: '15 - 20 mins',
    },
    aiThoughtProcess: {
      model: 'ARANYA Agricultural Depredation Model',
      predictionSummary:
        'Sounder targeting maturing wheat crop across forest boundary trench',
      confidenceScore: '92% Confidence',
      estimatedTimeOfArrival: '15 - 20 mins',
      reasoningSteps: [
        {
          factor: 'Crop Palatability',
          detail:
            'Maturing wheat fields adjacent to boundary trench lack solar fence maintenance.',
        },
      ],
      recommendedActions: [
        'Notify Laldhang Farmer Cooperative watch team',
        'Recommend solar fencing maintenance along sector 11 trench',
      ],
    },
  },
  {
    id: 'WL-023',
    species: 'Bengal Tiger',
    icon: '🐅',
    scientificName: 'Panthera tigris tigris',
    lat: 29.545,
    lon: 78.978,
    timestamp: '02:40 (Today)',
    confidence: 0.95,
    source: 'CAM-044',
    cameraName: 'Ramnagar Foothills Sensor 1',
    detectionMethod: 'Infrared Motion Trigger',
    locationName: 'Ramnagar Foothills Sensor 1',
    behaviorNotes:
      'Adult male tiger crossing riverbed toward resort boundary buffer',
    status: 'Corbett Buffer Transit',
    activityLevel: 'MODERATE',
    recentMovement: 'West along Kosi river corridor',
    nearbySettlement: 'Dhikuli Village (1.8 km)',
    conflictRiskIndex: 74,
    sampleImage: '/assets/wildlife/tiger_sample.jpg',
    isSimulation: false,
    historicalTrail: [
      [78.995, 29.565, 430],
      [78.988, 29.554, 410],
      [78.978, 29.545, 390],
    ],
    predictedTrajectory: [
      [78.978, 29.545, 390],
      [78.97, 29.538, 380],
      [78.962, 29.53, 370],
    ],
    conflictHotspot: {
      lon: 78.962,
      lat: 29.53,
      radius: 500,
      name: 'Dhikuli Resort Riverside Buffer',
      riskScore: 74,
      timeToImpact: '45 - 60 mins',
    },
    aiThoughtProcess: {
      model: 'ARANYA Apex Predator Tracking Engine',
      predictionSummary:
        'Riparian transit navigating between resort properties along Kosi riverbank',
      confidenceScore: '90% Confidence',
      estimatedTimeOfArrival: '45 - 60 mins',
      reasoningSteps: [
        {
          factor: 'Riverbed Movement Corridor',
          detail:
            'Tiger uses gravel riverbed to bypass tourist hotels; high risk if resort guests wander outside.',
        },
      ],
      recommendedActions: [
        'Enforce mandatory night guest curfew for Dhikuli riverside resorts',
        'Deploy Corbett Buffer Patrol vehicle to riverbank road',
      ],
    },
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
      recentMovement:
        event.movement || 'Moving South-West towards Raiwala settlements',
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
