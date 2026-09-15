// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Human Interface: Settlements, Infrastructure & Grazing Pressure Provider

const SETTLEMENTS = [
  {
    id: "SET-RAI-01",
    name: "Raiwala Town & Buffer Settlements",
    type: "Semi-Urban Fringe",
    population: 12400,
    lat: 30.012,
    lon: 78.238,
    distanceToForestMeters: 45,
    conflictHistoryScore: 88,
    primaryVulnerability: "Open livestock corrals along railway siding and scrub gully",
    activeMitigation: "Solar street lamps, WhatsApp early-warning network (14 ward captains)"
  },
  {
    id: "SET-SHY-02",
    name: "Shyampur Agriculture Settlement",
    type: "Rural Agricultural",
    population: 8200,
    lat: 29.945,
    lon: 78.192,
    distanceToForestMeters: 110,
    conflictHistoryScore: 72,
    primaryVulnerability: "Sugarcane fields providing daytime hideouts for wild boar and leopards",
    activeMitigation: "Community watchtower, trench maintenance"
  },
  {
    id: "SET-MOT-03",
    name: "Motichur Railway Colony & Hamlet",
    type: "Transport Hamlet",
    population: 3100,
    lat: 29.985,
    lon: 78.210,
    distanceToForestMeters: 60,
    conflictHistoryScore: 78,
    primaryVulnerability: "Railway track intersection with seasonal elephant movement path",
    activeMitigation: "Railway sensor link, automated acoustic horn system"
  },
  {
    id: "SET-CHI-04",
    name: "Chilla Forest Fringe Village",
    type: "Rural Forest Village",
    population: 2300,
    lat: 30.052,
    lon: 78.225,
    distanceToForestMeters: 80,
    conflictHistoryScore: 64,
    primaryVulnerability: "Power channel and canal bank evening foot traffic",
    activeMitigation: "Eco-development committee night patrols"
  },
  {
    id: "SET-LAL-05",
    name: "Laldhang Agro-Forest Interface",
    type: "Rural Agricultural",
    population: 6800,
    lat: 29.892,
    lon: 78.288,
    distanceToForestMeters: 150,
    conflictHistoryScore: 56,
    primaryVulnerability: "Extensive crop raiding by wild herbivores during harvest season",
    activeMitigation: "Energized solar fencing along southern perimeter"
  },
  {
    id: "SET-RAM-06",
    name: "Ramnagar Outskirts & Dhikuli",
    type: "Tourist & Commercial Strip",
    population: 14500,
    lat: 29.412,
    lon: 79.112,
    distanceToForestMeters: 90,
    conflictHistoryScore: 82,
    primaryVulnerability: "Dense resort concentration across Kosi river corridor with night lighting",
    activeMitigation: "Tourist curfew advisory, quick response vehicle"
  }
];

const INFRASTRUCTURE_CORRIDORS = [
  {
    id: "INF-RAIL-01",
    name: "Haridwar - Dehradun Railway Track (Through Rajaji)",
    type: "Railway Line",
    lengthKmInReserve: 18.2,
    coordinates: [
      [78.180, 29.970],
      [78.195, 30.010],
      [78.205, 30.050],
      [78.190, 30.090],
      [78.160, 30.130]
    ],
    speedLimitKmH: 30,
    mitigationStatus: "12 electronic sensor towers; 4 dedicated elephant underpasses",
    collisionRisk: "High during foggy winter nights (Nov - Feb)"
  },
  {
    id: "INF-HWY-02",
    name: "National Highway 72-A (Dehradun - Haridwar)",
    type: "4-Lane Highway with Elevated Flyovers",
    lengthKmInReserve: 14.5,
    coordinates: [
      [78.190, 29.960],
      [78.210, 30.020],
      [78.220, 30.070],
      [78.180, 30.140]
    ],
    speedLimitKmH: 50,
    mitigationStatus: "Elevated wildlife flyover segment (Chilla-Motichur bridge); sound barrier walls",
    collisionRisk: "Moderate (underpass usage high for ungulates)"
  }
];

const GRAZING_PRESSURE_ZONES = [
  {
    id: "GRAZE-01",
    name: "Raiwala Southern Grazing Scrub",
    settlementId: "SET-RAI-01",
    lat: 30.008,
    lon: 78.242,
    radiusMeters: 650,
    cattleHeadCount: 420,
    bomasCount: 18,
    riskScore: 89,
    description: "Unsupervised forest grazing by local cattle creates prime attractant for territorial leopards."
  },
  {
    id: "GRAZE-02",
    name: "Shyampur Canal Pasture Strip",
    settlementId: "SET-SHY-02",
    lat: 29.940,
    lon: 78.188,
    radiusMeters: 500,
    cattleHeadCount: 280,
    bomasCount: 12,
    riskScore: 71,
    description: "Goat herds grazed in dense lantana scrub near reserved forest ditch."
  }
];

export class HumanInterfaceProvider {
  async getSettlements() { throw new Error("Not implemented"); }
  async getInfrastructureCorridors() { throw new Error("Not implemented"); }
  async getGrazingPressureZones() { throw new Error("Not implemented"); }
}

export class DemoHumanInterfaceProvider extends HumanInterfaceProvider {
  async getSettlements() {
    return SETTLEMENTS;
  }
  async getSettlementById(id) {
    return SETTLEMENTS.find(s => s.id === id) || null;
  }
  async getInfrastructureCorridors() {
    return INFRASTRUCTURE_CORRIDORS;
  }
  async getGrazingPressureZones() {
    return GRAZING_PRESSURE_ZONES;
  }
}

export const defaultHumanInterfaceProvider = new DemoHumanInterfaceProvider();
