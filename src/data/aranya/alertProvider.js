// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Priority Alerts & Action Management Provider

const INITIAL_ALERTS = [
  {
    id: "ALT-2026-042",
    title: "Leopard Ingress Towards Raiwala Cattle Pens",
    species: "Panthera pardus (Indian Leopard)",
    speciesKey: "leopard",
    severity: "critical", // critical, high, moderate, info
    status: "NEW", // NEW -> ASSIGNED -> IN_VERIFICATION -> VERIFIED -> CLOSED
    lat: 30.0125,
    lon: 78.2380,
    timestamp: "2026-09-15T08:14:00Z",
    riskScore: 87,
    cellId: "RISK-008",
    summary: "Consecutive camera trap triggers (CAM-017, CAM-018) along Raiwala ravine indicate steady approach toward cattle bomas. Estimated 180m from village edge.",
    recommendedAction: "Dispatch Team Alpha (QRU); alert Ward 4 captains; activate acoustic deterrents.",
    evidenceTrapIds: ["CAM-017", "CAM-018"],
    assignedTeam: null,
    verificationOutcome: null
  },
  {
    id: "ALT-2026-040",
    title: "Elephant Family Approaching Railway Cut",
    species: "Elephas maximus (Asian Elephant)",
    speciesKey: "elephant",
    severity: "high",
    status: "ASSIGNED",
    lat: 30.0710,
    lon: 78.1920,
    timestamp: "2026-09-15T07:30:00Z",
    riskScore: 74,
    cellId: "RISK-004",
    summary: "A herd of 5 elephants including 1 calf tracked near Haridwar-Dehradun railway KM 42+600. Potential collision risk.",
    recommendedAction: "Notify Northern Railway Control for speed deceleration to 20 km/h; station track spotters.",
    evidenceTrapIds: ["CAM-022"],
    assignedTeam: "TEAM-BRAVO",
    verificationOutcome: null
  },
  {
    id: "ALT-2026-038",
    title: "Corbett Buffer Tiger Sighting Near Resort Boundary",
    species: "Panthera tigris (Bengal Tiger)",
    speciesKey: "tiger",
    severity: "high",
    status: "IN_VERIFICATION",
    lat: 29.4120,
    lon: 79.1120,
    timestamp: "2026-09-15T06:50:00Z",
    riskScore: 78,
    cellId: "RISK-015",
    summary: "Adult male tiger observed crossing Kosi riverbed towards Dhikuli tourist perimeter.",
    recommendedAction: "Enforce resort evening pedestrian curfew; verify riverbank floodlight shielding.",
    evidenceTrapIds: ["CAM-025"],
    assignedTeam: "TEAM-PATROL-04",
    verificationOutcome: null
  },
  {
    id: "ALT-2026-035",
    title: "Wild Boar Sounder Incursion in Shyampur",
    species: "Sus scrofa (Indian Wild Boar)",
    speciesKey: "wild_boar",
    severity: "moderate",
    status: "VERIFIED",
    lat: 29.9450,
    lon: 78.1920,
    timestamp: "2026-09-14T23:10:00Z",
    riskScore: 68,
    cellId: "RISK-012",
    summary: "Sounder of 8 wild boars entered sugarcane farmland bordering Haridwar division.",
    recommendedAction: "Cooperate with local farmers for trench barrier restoration.",
    evidenceTrapIds: ["CAM-009"],
    assignedTeam: null,
    verificationOutcome: {
      teamId: "TEAM-ALPHA",
      outcomeType: "deterrent_applied",
      notes: "Farmers alerted, boars moved back into scrub forest with noisemakers."
    }
  }
];

export class AlertProvider {
  async getAlerts() { throw new Error("Not implemented"); }
  async getAlertById(id) { throw new Error("Not implemented"); }
  async updateAlertStatus(id, status, assignedTeam) { throw new Error("Not implemented"); }
  async addAlert(alert) { throw new Error("Not implemented"); }
}

export class DemoAlertProvider extends AlertProvider {
  constructor() {
    super();
    this.alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
    this.listeners = new Set();
  }

  async getAlerts(filter = {}) {
    let result = [...this.alerts];
    if (filter.status) {
      result = result.filter(a => a.status === filter.status);
    }
    if (filter.severity) {
      result = result.filter(a => a.severity === filter.severity);
    }
    return result;
  }

  async getAlertById(id) {
    return this.alerts.find(a => a.id === id) || null;
  }

  async updateAlertStatus(id, status, assignedTeam = undefined) {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;
    alert.status = status;
    if (assignedTeam !== undefined) {
      alert.assignedTeam = assignedTeam;
    }
    this.notifyListeners();
    return alert;
  }

  addAlert(alertData) {
    const alert = {
      id: alertData.id || `ALT-${Date.now()}`,
      timestamp: alertData.timestamp || new Date().toISOString(),
      status: alertData.status || "NEW",
      ...alertData
    };
    this.alerts.unshift(alert);
    this.notifyListeners();
    return alert;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyListeners() {
    for (const fn of this.listeners) {
      try { fn(this.alerts); } catch (e) { console.error(e); }
    }
  }
}

export const defaultAlertProvider = new DemoAlertProvider();
