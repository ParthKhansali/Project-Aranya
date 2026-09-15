// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Habitat, Protected Reserves, Corridors & Hydrology Provider

const PROTECTED_RESERVES = [
  {
    id: "RES-RAJ-01",
    name: "Rajaji National Park & Tiger Reserve",
    state: "Uttarakhand",
    type: "National Park & Tiger Reserve",
    areaKm2: 820.4,
    centerLat: 30.08,
    centerLon: 78.18,
    boundaryCoordinates: [
      [78.02, 30.22],
      [78.38, 30.22],
      [78.44, 29.95],
      [78.15, 29.85],
      [77.95, 30.05],
      [78.02, 30.22]
    ],
    zones: {
      coreKm2: 571.0,
      bufferKm2: 249.4
    },
    keySpecies: ["Asian Elephant", "Bengal Tiger", "Indian Leopard", "King Cobra", "Spotted Deer"],
    threatLevel: "High (linear infrastructure fragmentation, urban interface)"
  },
  {
    id: "RES-COR-02",
    name: "Jim Corbett National Park & Tiger Reserve",
    state: "Uttarakhand",
    type: "National Park & Tiger Reserve",
    areaKm2: 1288.3,
    centerLat: 29.53,
    centerLon: 78.77,
    boundaryCoordinates: [
      [78.60, 29.75],
      [79.15, 29.75],
      [79.20, 29.35],
      [78.65, 29.30],
      [78.60, 29.75]
    ],
    zones: {
      coreKm2: 520.8,
      bufferKm2: 767.5
    },
    keySpecies: ["Bengal Tiger", "Asian Elephant", "Gharial", "Sloth Bear", "Otter"],
    threatLevel: "Medium-High (heavy eco-tourism pressure, river corridor hotels)"
  },
  {
    id: "RES-SON-03",
    name: "Sonanadi Wildlife Sanctuary",
    state: "Uttarakhand",
    type: "Wildlife Sanctuary",
    areaKm2: 301.2,
    centerLat: 29.62,
    centerLon: 78.65,
    boundaryCoordinates: [
      [78.55, 29.70],
      [78.78, 29.70],
      [78.75, 29.55],
      [78.50, 29.55],
      [78.55, 29.70]
    ],
    zones: {
      coreKm2: 301.2,
      bufferKm2: 0
    },
    keySpecies: ["Asian Elephant", "Tiger", "Sambar", "Cheetal"],
    threatLevel: "Low-Medium (connects Corbett to Rajaji Eastern flank)"
  }
];

const CRITICAL_CORRIDORS = [
  {
    id: "CORR-07",
    name: "Chilla - Motichur Corridor (#07)",
    landscape: "Rajaji National Park",
    description: "Vital lifeline connecting the Eastern (Chilla) and Western (Motichur) blocks of Rajaji across the Ganges River. Critical for gene flow among isolated tiger and elephant populations.",
    functionalityScore: 58, // Severely pressured
    widthMeters: 950,
    lengthKm: 4.2,
    coordinates: [
      [78.182, 30.078],
      [78.195, 30.072],
      [78.208, 30.065],
      [78.225, 30.058]
    ],
    pinchPoints: [
      { name: "Haridwar-Dehradun Railway Cut", lat: 30.072, lon: 78.198, risk: "Train impact risk" },
      { name: "National Highway 72-A Stretch", lat: 30.068, lon: 78.204, risk: "High-speed traffic barrier" },
      { name: "Army Ammunition Dump Enclave", lat: 30.062, lon: 78.212, risk: "Perimeter fencing constriction" }
    ],
    primaryThreats: ["Railway collisions", "Highway traffic", "Raiwala urban encroachment", "Canal barrier"],
    mitigationMeasures: "Flyover construction completed; dedicated animal underpasses; seismic elephant detectors"
  },
  {
    id: "CORR-04",
    name: "Kansro - Barkote Corridor",
    landscape: "Rajaji Western Landscape",
    description: "Connects Kansro interior forests to Barkote range along the Song River valley.",
    functionalityScore: 74,
    widthMeters: 1600,
    lengthKm: 8.5,
    coordinates: [
      [78.140, 30.125],
      [78.155, 30.140],
      [78.175, 30.155],
      [78.190, 30.170]
    ],
    pinchPoints: [
      { name: "Song River Bridge crossing", lat: 30.148, lon: 78.162, risk: "Illegal sand mining & gravel transport" }
    ],
    primaryThreats: ["Mining transport trucks", "Peripheral agricultural fencing"],
    mitigationMeasures: "Night transit curfew for commercial trucks; forest guard post stationed"
  },
  {
    id: "CORR-11",
    name: "Kosi River Corridor (Corbett - Ramnagar)",
    landscape: "Corbett Southern Buffer",
    description: "Narrow corridor along the Kosi River linking Corbett National Park with Ramnagar Forest Division.",
    functionalityScore: 42, // Heavily fragmented
    widthMeters: 380,
    lengthKm: 6.1,
    coordinates: [
      [79.105, 29.425],
      [79.112, 29.412],
      [79.118, 29.398],
      [79.125, 29.385]
    ],
    pinchPoints: [
      { name: "Dhikuli Resort Strip", lat: 29.414, lon: 79.111, risk: "Resort walls and bright floodlights blocking night crossing" }
    ],
    primaryThreats: ["Resort infrastructure", "Sound pollution", "Feral dog packs"],
    mitigationMeasures: "Eco-sensitive zone buffer enforcement; night light shielding regulations"
  }
];

const WATER_BODIES = [
  {
    id: "WAT-GAN-01",
    name: "Ganges River (Ganga)",
    type: "Perennial River",
    significance: "Principal aquatic corridor and seasonal barrier dividing Rajaji East and West",
    coordinates: [
      [78.290, 30.120],
      [78.260, 30.080],
      [78.210, 30.050],
      [78.180, 29.980],
      [78.150, 29.920]
    ]
  },
  {
    id: "WAT-SON-02",
    name: "Song River",
    type: "River",
    significance: "Primary watering line for elephant herds in Doon Valley and northern Rajaji",
    coordinates: [
      [78.120, 30.250],
      [78.140, 30.180],
      [78.170, 30.120],
      [78.210, 30.050]
    ]
  },
  {
    id: "WAT-KOS-03",
    name: "Kosi River",
    type: "River",
    significance: "Corbett eastern boundary lifeline and critical wildlife drinking corridor",
    coordinates: [
      [79.080, 29.550],
      [79.100, 29.480],
      [79.115, 29.410],
      [79.130, 29.350]
    ]
  }
];

const HABITAT_PRESSURE_AREAS = [
  {
    id: "PRESS-01",
    name: "Raiwala Suburban Linear Expansion",
    type: "Infrastructure & Urban Encroachment",
    yearBaseline: 2022,
    yearCurrent: 2026,
    canopyLossPercent: 14.2,
    expansionVector: "Towards Chilla-Motichur railway corridor",
    lat: 30.015,
    lon: 78.242,
    radiusMeters: 1400,
    impactSummary: "Increased domestic livestock bomas and street lighting disorient nocturnal carnivores"
  },
  {
    id: "PRESS-02",
    name: "Dhikuli Resort Strip Intensification",
    type: "Commercial Tourism Infrastructure",
    yearBaseline: 2022,
    yearCurrent: 2026,
    canopyLossPercent: 18.7,
    expansionVector: "Directly into Kosi riverbed riparian fringe",
    lat: 29.415,
    lon: 79.110,
    radiusMeters: 900,
    impactSummary: "Complete blockage of secondary tiger movement path; increases human-carnivore encounters"
  }
];

export class HabitatProvider {
  async getReserves() { throw new Error("Not implemented"); }
  async getCorridors() { throw new Error("Not implemented"); }
  async getWaterBodies() { throw new Error("Not implemented"); }
  async getHabitatPressureAreas() { throw new Error("Not implemented"); }
}

export class DemoHabitatProvider extends HabitatProvider {
  async getReserves() {
    return PROTECTED_RESERVES;
  }
  async getCorridors() {
    return CRITICAL_CORRIDORS;
  }
  async getCorridorById(id) {
    return CRITICAL_CORRIDORS.find(c => c.id === id) || null;
  }
  async getWaterBodies() {
    return WATER_BODIES;
  }
  async getHabitatPressureAreas() {
    return HABITAT_PRESSURE_AREAS;
  }
}

export const defaultHabitatProvider = new DemoHabitatProvider();
