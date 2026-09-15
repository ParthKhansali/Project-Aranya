// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Field Team Dispatch & Ground Verification Workflow Engine

const INITIAL_TEAMS = [
  {
    id: "TEAM-ALPHA",
    name: "Team Alpha — Quick Response Unit (QRU)",
    division: "Rajaji South / Raiwala Sector",
    baseStation: "Raiwala Forest Range Post",
    status: "available", // available, dispatched, on_scene, returning
    currentLat: 30.014,
    currentLon: 78.236,
    personnel: [
      { name: "Ranger Vikram Negi", role: "Team Lead / Wildlife Biologist" },
      { name: "Forester Sunita Rawat", role: "Field Officer" },
      { name: "Devendra Thapa", role: "Senior Master Tracker" }
    ],
    vehicle: "Forest Patrol 4x4 (UK-07-GA-1044)",
    equipment: [
      "Thermal Monocular FLIR Scout",
      "Tranquilizer Dart Gun & Antidote Kit",
      "Night Vision Goggles Gen-3",
      "VHF Handset (Ch 4 - Rajaji Emergency)",
      "High-Decibel Siren & Acoustic Deterrent"
    ],
    activeAssignment: null
  },
  {
    id: "TEAM-BRAVO",
    name: "Team Bravo — Corridor Patrol Unit",
    division: "Chilla - Motichur Corridor #07",
    baseStation: "Chilla Range Gate Complex",
    status: "available",
    currentLat: 30.058,
    currentLon: 78.220,
    personnel: [
      { name: "Ranger Manoj Bhatt", role: "Corridor Incharge" },
      { name: "Forester Amit Chauhan", role: "Field Scout" }
    ],
    vehicle: "Quick Response 4x4 (UK-07-GA-2190)",
    equipment: [
      "Drone Surveillance Unit (Mavic Enterprise)",
      "Handheld GPS & Rangefinder",
      "Emergency Strobe Flare Kit",
      "VHF Handset"
    ],
    activeAssignment: null
  },
  {
    id: "TEAM-PATROL-04",
    name: "Patrol Unit 04 — Corbett Southern Buffer",
    division: "Ramnagar / Kosi River Strip",
    baseStation: "Dhikuli Monitoring Outpost",
    status: "on_patrol",
    currentLat: 29.414,
    currentLon: 79.110,
    personnel: [
      { name: "Ranger R. S. Panwar", role: "Buffer Officer" },
      { name: "Tracker K. L. Joshi", role: "Pugmark Specialist" }
    ],
    vehicle: "Electric Patrol Buggy & Motorcycle",
    equipment: [
      "Camera Trap Diagnostic Reader",
      "Solar Electric Fence Multi-tester",
      "Megaphone & Spotlights"
    ],
    activeAssignment: null
  }
];

export class FieldTeamProvider {
  async getTeams() { throw new Error("Not implemented"); }
  async getTeamById(id) { throw new Error("Not implemented"); }
  async dispatchTeam(teamId, alertId, targetLocation) { throw new Error("Not implemented"); }
  async updateTeamStatus(teamId, status, currentLat, currentLon) { throw new Error("Not implemented"); }
  async submitVerificationReport(alertId, reportData) { throw new Error("Not implemented"); }
}

export class DemoFieldTeamProvider extends FieldTeamProvider {
  constructor() {
    super();
    this.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS));
    this.reports = [];
    this.listeners = new Set();
  }

  async getTeams() {
    return this.teams;
  }

  async getTeamById(id) {
    return this.teams.find(t => t.id === id) || null;
  }

  async dispatchTeam(teamId, alertId, targetLocation) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) throw new Error(`Team ${teamId} not found`);

    team.status = "dispatched";
    team.activeAssignment = {
      alertId,
      dispatchedAt: new Date().toISOString(),
      targetLat: targetLocation?.lat || team.currentLat,
      targetLon: targetLocation?.lon || team.currentLon,
      stage: "DISPATCHED" // DISPATCHED -> ON_SCENE -> VERIFYING -> RESOLVED
    };

    this.notifyListeners();
    return team;
  }

  async updateTeamStatus(teamId, status, currentLat, currentLon) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return null;
    team.status = status;
    if (currentLat !== undefined) team.currentLat = currentLat;
    if (currentLon !== undefined) team.currentLon = currentLon;
    this.notifyListeners();
    return team;
  }

  async submitVerificationReport(alertId, reportData) {
    const report = {
      id: `REP-${Date.now()}`,
      alertId,
      submittedAt: new Date().toISOString(),
      teamId: reportData.teamId || "TEAM-ALPHA",
      officer: reportData.officer || "Ranger Vikram Negi",
      outcomeType: reportData.outcomeType || "confirmed_sighting",
      findings: reportData.findings || "Visual confirmation of adult leopard tracks 45m from cattle enclosure.",
      actionTaken: reportData.actionTaken || "Acoustic sirens activated; herd moved into secure enclosure; solar lanterns distributed.",
      threatStatus: reportData.threatStatus || "RESOLVED_DEFUSED"
    };

    this.reports.unshift(report);

    // Free up the assigned team
    const assignedTeam = this.teams.find(t => t.activeAssignment?.alertId === alertId);
    if (assignedTeam) {
      assignedTeam.status = "available";
      assignedTeam.activeAssignment = null;
    }

    this.notifyListeners();
    return report;
  }

  async getReports() {
    return this.reports;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyListeners() {
    for (const fn of this.listeners) {
      try { fn(this.teams); } catch (e) { console.error(e); }
    }
  }
}

export const defaultFieldTeamProvider = new DemoFieldTeamProvider();
