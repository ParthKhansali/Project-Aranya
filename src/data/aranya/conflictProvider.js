// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Conflict Incident Data Provider & Mock Engine

const SAMPLE_INCIDENTS = [
  {
    id: "INC-2026-089",
    type: "livestock_depredation",
    species: "Panthera pardus (Indian Leopard)",
    speciesKey: "leopard",
    lat: 30.0125,
    lon: 78.2380,
    timestamp: "2026-09-14T21:40:00Z",
    severity: "high",
    locationName: "Raiwala Buffer Peripheral (Ward 4)",
    description: "Cattle pen breach near forest edge. One cow injured, leopard retreated upon community alarm.",
    outcome: "Forest Department notified, patrol dispatched",
    settlementProximityKm: 0.18,
    landscape: "Rajaji-Rishikesh Corridor"
  },
  {
    id: "INC-2026-087",
    type: "crop_damage",
    species: "Elephas maximus (Asian Elephant)",
    speciesKey: "elephant",
    lat: 29.9820,
    lon: 78.2150,
    timestamp: "2026-09-13T02:15:00Z",
    severity: "medium",
    locationName: "Motichur Boundary Farmland",
    description: "Small herd of 3 elephants crossed railway easement into sugarcane plots. Driven back to forest without confrontation.",
    outcome: "Chilli-rope barriers inspected, solar fence restored",
    settlementProximityKm: 0.45,
    landscape: "Rajaji National Park - Motichur"
  },
  {
    id: "INC-2026-084",
    type: "human_encounter",
    species: "Panthera pardus (Indian Leopard)",
    speciesKey: "leopard",
    lat: 30.0410,
    lon: 78.2610,
    timestamp: "2026-09-11T19:30:00Z",
    severity: "critical",
    locationName: "Tapovan-Rishikesh Ridge Footpath",
    description: "Solitary leopard sighted within 15 meters of evening commuter trail. Leopard charged briefly before veering into ravine.",
    outcome: "Advisory issued; evening foot patrols reinforced",
    settlementProximityKm: 0.08,
    landscape: "Rishikesh-Shivpuri Foothills"
  },
  {
    id: "INC-2026-081",
    type: "livestock_depredation",
    species: "Panthera pardus (Indian Leopard)",
    speciesKey: "leopard",
    lat: 29.9450,
    lon: 78.1920,
    timestamp: "2026-09-08T22:10:00Z",
    severity: "high",
    locationName: "Shyampur Fringe Village",
    description: "Goat shed attacked in village outskirts bordering dense scrub belt.",
    outcome: "Compensation claim registered; camera trap relocated to ingress gully",
    settlementProximityKm: 0.22,
    landscape: "Haridwar-Shyampur Buffer"
  },
  {
    id: "INC-2026-078",
    type: "corridor_blockage",
    species: "Elephas maximus (Asian Elephant)",
    speciesKey: "elephant",
    lat: 30.0710,
    lon: 78.1880,
    timestamp: "2026-09-05T06:45:00Z",
    severity: "medium",
    locationName: "Chilla-Motichur Corridor Crossing (Ganges Floodplain)",
    description: "Lone bull elephant stalled near highway underpass due to heavy morning freight traffic congestion.",
    outcome: "Quick Response Team regulated traffic, elephant safely crossed within 40 mins",
    settlementProximityKm: 0.35,
    landscape: "Chilla-Motichur Corridor #07"
  },
  {
    id: "INC-2026-075",
    type: "crop_damage",
    species: "Sus scrofa (Indian Wild Boar)",
    speciesKey: "wild_boar",
    lat: 29.8920,
    lon: 78.2910,
    timestamp: "2026-09-02T23:00:00Z",
    severity: "low",
    locationName: "Laldhang Agro-Forest Interface",
    description: "Troop of wild boars dug up maize root systems across 2 acres.",
    outcome: "Community trench maintenance scheduled",
    settlementProximityKm: 0.12,
    landscape: "Laldhang Forest Division"
  },
  {
    id: "INC-2026-071",
    type: "human_encounter",
    species: "Melursus ursinus (Sloth Bear)",
    speciesKey: "sloth_bear",
    lat: 29.5420,
    lon: 78.7810,
    timestamp: "2026-08-28T05:30:00Z",
    severity: "high",
    locationName: "Corbett Southern Buffer (Ramnagar)",
    description: "Wood gatherer startled female bear with cubs in scrub forest. Minor defensive injury reported.",
    outcome: "First aid administered; eco-development committee issued forest entry warning",
    settlementProximityKm: 0.50,
    landscape: "Corbett Buffer Landscape"
  }
];

export class ConflictProvider {
  async getIncidents() {
    throw new Error("Not implemented");
  }
  async getIncidentById(id) {
    throw new Error("Not implemented");
  }
}

export class DemoConflictProvider extends ConflictProvider {
  constructor() {
    super();
    this.incidents = [...SAMPLE_INCIDENTS];
    this.listeners = new Set();
  }

  async getIncidents(filter = {}) {
    let result = [...this.incidents];
    if (filter.speciesKey) {
      result = result.filter(i => i.speciesKey === filter.speciesKey);
    }
    if (filter.type) {
      result = result.filter(i => i.type === filter.type);
    }
    if (filter.severity) {
      result = result.filter(i => i.severity === filter.severity);
    }
    return result;
  }

  async getIncidentById(id) {
    return this.incidents.find(i => i.id === id) || null;
  }

  addIncident(incident) {
    const record = {
      id: incident.id || `INC-${Date.now()}`,
      timestamp: incident.timestamp || new Date().toISOString(),
      ...incident
    };
    this.incidents.unshift(record);
    this.notifyListeners();
    return record;
  }

  getStatsByLandscape() {
    const stats = {};
    for (const inc of this.incidents) {
      const ls = inc.landscape || "Other";
      if (!stats[ls]) stats[ls] = { total: 0, highSeverity: 0, bySpecies: {} };
      stats[ls].total++;
      if (inc.severity === "high" || inc.severity === "critical") {
        stats[ls].highSeverity++;
      }
      stats[ls].bySpecies[inc.speciesKey] = (stats[ls].bySpecies[inc.speciesKey] || 0) + 1;
    }
    return stats;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyListeners() {
    for (const fn of this.listeners) {
      try { fn(this.incidents); } catch (e) { console.error(e); }
    }
  }
}

export const defaultConflictProvider = new DemoConflictProvider();
