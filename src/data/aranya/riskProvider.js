// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Continuous Risk Assessment & Explainability Engine

export const RISK_LEVELS = {
  LOW: { label: "Low Risk", min: 0, max: 30, color: "#10B981" },
  MODERATE: { label: "Moderate Risk", min: 31, max: 60, color: "#F59E0B" },
  HIGH: { label: "High Risk", min: 61, max: 80, color: "#F97316" },
  CRITICAL: { label: "Critical Risk", min: 81, max: 100, color: "#EF4444" }
};

export function getRiskCategory(score) {
  if (score >= 81) return RISK_LEVELS.CRITICAL;
  if (score >= 61) return RISK_LEVELS.HIGH;
  if (score >= 31) return RISK_LEVELS.MODERATE;
  return RISK_LEVELS.LOW;
}

const SAMPLE_RISK_CELLS = [
  {
    id: "RISK-008",
    name: "Raiwala Forest-Village Interface (Sector 4)",
    landscape: "Rajaji-Rishikesh Buffer",
    centerLat: 30.0110,
    centerLon: 78.2395,
    polygonCoordinates: [
      [78.232, 30.018],
      [78.248, 30.018],
      [78.249, 30.004],
      [78.231, 30.004],
      [78.232, 30.018]
    ],
    overallScore: 87, // High/Critical risk zone
    primaryThreat: "Crepuscular leopard movement towards cattle pens",
    dominantSpecies: "Panthera pardus (Indian Leopard)",
    factors: {
      recentSightings: {
        score: 92,
        weight: 0.25,
        contribution: 23.0,
        description: "3 verified camera trap captures within past 6 hours (CAM-017, CAM-018)"
      },
      conflictHistory: {
        score: 85,
        weight: 0.20,
        contribution: 17.0,
        description: "6 livestock depredations recorded within 500m over last 90 days"
      },
      livestockDensity: {
        score: 88,
        weight: 0.15,
        contribution: 13.2,
        description: "14 unregistered open cattle bomas within 250m of forest boundary"
      },
      forestEdgeProximity: {
        score: 95,
        weight: 0.20,
        contribution: 19.0,
        description: "Zero physical buffer; village boundary directly abuts dense scrub ravine"
      },
      habitatFragmentation: {
        score: 72,
        weight: 0.10,
        contribution: 7.2,
        description: "Railway easement and road bisect seasonal foraging corridor"
      },
      behavioralAnomaly: {
        score: 76,
        weight: 0.10,
        contribution: 7.6,
        description: "Daytime prowling and repeated approach toward human dwellings detected"
      }
    },
    recommendedAction: "Dispatch Quick Response Team; issue perimeter grazing advisory; verify solar fencing"
  },
  {
    id: "RISK-004",
    name: "Chilla-Motichur Corridor Crossing (Ganges Flank)",
    landscape: "Rajaji National Park",
    centerLat: 30.0680,
    centerLon: 78.1920,
    polygonCoordinates: [
      [78.182, 30.076],
      [78.204, 30.076],
      [78.202, 30.060],
      [78.180, 30.060],
      [78.182, 30.076]
    ],
    overallScore: 74,
    primaryThreat: "Elephant herd highway crossing & train collision risk",
    dominantSpecies: "Elephas maximus (Asian Elephant)",
    factors: {
      recentSightings: {
        score: 80,
        weight: 0.25,
        contribution: 20.0,
        description: "Herd movement tracked approaching Haridwar-Dehradun railway segment"
      },
      conflictHistory: {
        score: 70,
        weight: 0.20,
        contribution: 14.0,
        description: "Periodic train strikes and barrier breaches historically recorded"
      },
      livestockDensity: {
        score: 40,
        weight: 0.15,
        contribution: 6.0,
        description: "Low livestock presence; primarily highway transit and agricultural periphery"
      },
      forestEdgeProximity: {
        score: 90,
        weight: 0.20,
        contribution: 18.0,
        description: "Linear transport infrastructure cuts directly through national park core"
      },
      habitatFragmentation: {
        score: 96,
        weight: 0.10,
        contribution: 9.6,
        description: "Narrow corridor bottleneck constrained by highway and canal infrastructure"
      },
      behavioralAnomaly: {
        score: 64,
        weight: 0.10,
        contribution: 6.4,
        description: "Increased hesitation and lingering near vehicular traffic"
      }
    },
    recommendedAction: "Engage railway caution speed limit (25 km/h); post elephant warning spotters"
  },
  {
    id: "RISK-012",
    name: "Shyampur Peripheral Agriculture Belt",
    landscape: "Haridwar Forest Division",
    centerLat: 29.9480,
    centerLon: 78.1980,
    polygonCoordinates: [
      [78.188, 29.956],
      [78.208, 29.956],
      [78.206, 29.940],
      [78.186, 29.940],
      [78.188, 29.956]
    ],
    overallScore: 68,
    primaryThreat: "Nocturnal crop raiding and opportunistic predator stalking",
    dominantSpecies: "Panthera pardus / Sus scrofa",
    factors: {
      recentSightings: {
        score: 65,
        weight: 0.25,
        contribution: 16.25,
        description: "Wild boar sounder sighted nightly; leopard track found along canal"
      },
      conflictHistory: {
        score: 75,
        weight: 0.20,
        contribution: 15.0,
        description: "Frequent crop depredation; 2 dog losses in past fortnight"
      },
      livestockDensity: {
        score: 82,
        weight: 0.15,
        contribution: 12.3,
        description: "High concentration of smallholder goat pens near irrigation channel"
      },
      forestEdgeProximity: {
        score: 78,
        weight: 0.20,
        contribution: 15.6,
        description: "Within 100m of reserved forest boundary"
      },
      habitatFragmentation: {
        score: 55,
        weight: 0.10,
        contribution: 5.5,
        description: "Agricultural expansion encroaching on seasonal scrub"
      },
      behavioralAnomaly: {
        score: 35,
        weight: 0.10,
        contribution: 3.5,
        description: "Standard seasonal feeding patterns observed"
      }
    },
    recommendedAction: "Community solar lantern distribution; night watch team patrol"
  },
  {
    id: "RISK-015",
    name: "Ramnagar Southern Riverbed Corridor",
    landscape: "Corbett Buffer Landscape",
    centerLat: 29.4120,
    centerLon: 79.1120,
    polygonCoordinates: [
      [79.102, 29.420],
      [79.124, 29.420],
      [79.122, 29.404],
      [79.100, 29.404],
      [79.102, 29.420]
    ],
    overallScore: 78,
    primaryThreat: "Tiger & elephant movement across river corridor into tourist resort belt",
    dominantSpecies: "Panthera tigris (Bengal Tiger)",
    factors: {
      recentSightings: {
        score: 82,
        weight: 0.25,
        contribution: 20.5,
        description: "Pugmarks and vocalization reported near Kosi river bed"
      },
      conflictHistory: {
        score: 72,
        weight: 0.20,
        contribution: 14.4,
        description: "High tourist footprint intersecting evening carnivore transit route"
      },
      livestockDensity: {
        score: 60,
        weight: 0.15,
        contribution: 9.0,
        description: "Resort periphery waste dumps attract feral dogs, drawing apex predators"
      },
      forestEdgeProximity: {
        score: 92,
        weight: 0.20,
        contribution: 18.4,
        description: "Narrow river ribbon separating national park from commercial resorts"
      },
      habitatFragmentation: {
        score: 88,
        weight: 0.10,
        contribution: 8.8,
        description: "Heavy commercial construction along river banks"
      },
      behavioralAnomaly: {
        score: 69,
        weight: 0.10,
        contribution: 6.9,
        description: "Tigers crossing during early dusk due to daytime vehicle disturbance"
      }
    },
    recommendedAction: "Strict curfew on tourist foot movement past 18:30; riverbed acoustic alerts"
  },
  {
    id: "RISK-002",
    name: "Kansro Deep Forest Interior",
    landscape: "Rajaji Core Reserve",
    centerLat: 30.1250,
    centerLon: 78.1520,
    polygonCoordinates: [
      [78.135, 30.135],
      [78.165, 30.135],
      [78.165, 30.115],
      [78.135, 30.115],
      [78.135, 30.135]
    ],
    overallScore: 24, // Low conflict risk
    primaryThreat: "Minimal human-wildlife interface; undisturbed core habitat",
    dominantSpecies: "Mixed Wildlife (Elephants, Tigers, Deer)",
    factors: {
      recentSightings: {
        score: 70,
        weight: 0.25,
        contribution: 17.5,
        description: "High wildlife density but contained inside protected core"
      },
      conflictHistory: {
        score: 5,
        weight: 0.20,
        contribution: 1.0,
        description: "Zero civilian settlements within 4km"
      },
      livestockDensity: {
        score: 0,
        weight: 0.15,
        contribution: 0.0,
        description: "No domestic livestock allowed or present"
      },
      forestEdgeProximity: {
        score: 10,
        weight: 0.20,
        contribution: 2.0,
        description: "Deep interior > 3km from peripheral edge"
      },
      habitatFragmentation: {
        score: 15,
        weight: 0.10,
        contribution: 1.5,
        description: "Contiguous canopy and unfragmented sal forest"
      },
      behavioralAnomaly: {
        score: 20,
        weight: 0.10,
        contribution: 2.0,
        description: "Natural baseline behaviors recorded"
      }
    },
    recommendedAction: "Routine anti-poaching patrol monitoring"
  }
];

export class RiskProvider {
  async getRiskCells() {
    throw new Error("Not implemented");
  }
  async getCellById(id) {
    throw new Error("Not implemented");
  }
  async getRiskExplanation(cellId) {
    throw new Error("Not implemented");
  }
}

export class DemoRiskProvider extends RiskProvider {
  constructor() {
    super();
    this.cells = JSON.parse(JSON.stringify(SAMPLE_RISK_CELLS));
    this.listeners = new Set();
  }

  async getRiskCells() {
    return this.cells;
  }

  async getCellById(id) {
    return this.cells.find(c => c.id === id) || null;
  }

  async getRiskExplanation(cellId) {
    const cell = await this.getCellById(cellId);
    if (!cell) return null;
    return {
      cellId: cell.id,
      name: cell.name,
      landscape: cell.landscape,
      overallScore: cell.overallScore,
      category: getRiskCategory(cell.overallScore),
      primaryThreat: cell.primaryThreat,
      dominantSpecies: cell.dominantSpecies,
      factors: cell.factors,
      recommendedAction: cell.recommendedAction
    };
  }

  updateCellRisk(cellId, newScore, factorUpdates = {}) {
    const cell = this.cells.find(c => c.id === cellId);
    if (!cell) return null;
    cell.overallScore = newScore;
    for (const [key, val] of Object.entries(factorUpdates)) {
      if (cell.factors[key]) {
        Object.assign(cell.factors[key], val);
        if (typeof val.score === "number") {
          cell.factors[key].contribution = +(val.score * cell.factors[key].weight).toFixed(1);
        }
      }
    }
    this.notifyListeners();
    return cell;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyListeners() {
    for (const fn of this.listeners) {
      try { fn(this.cells); } catch (e) { console.error(e); }
    }
  }
}

export const defaultRiskProvider = new DemoRiskProvider();
