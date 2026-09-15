/**
 * ARANYA — Wildlife Movement Provider
 * Manages animal movement trails, directional heading, and corridor transits.
 * Future integration: Movebank / Authorized GPS collar telemetry feeds.
 */

export const INITIAL_MOVEMENT_TRAILS = [
  {
    id: 'TRAIL-001',
    species: 'Leopard',
    individualId: 'WL-017 (Adult Male)',
    status: 'Moving toward Forest Edge',
    direction: 'South-East',
    speedKmh: 4.2,
    waypoints: [
      { lat: 30.058, lon: 78.201, time: '18:10', elevation: 410, label: 'Core Sal Forest Ridge' },
      { lat: 30.051, lon: 78.208, time: '18:55', elevation: 380, label: 'Secondary Scrub Descent' },
      { lat: 30.044, lon: 78.214, time: '19:42', elevation: 360, label: 'CAM-017 Detection Station' },
      { lat: 30.038, lon: 78.219, time: '20:15', elevation: 350, label: 'Raiwala Forest Border Drain' },
    ],
    riskZoneIntersects: ['RISK-008'],
    nearbyCorridor: 'Chilla-Motichur Corridor #07',
    isSimulation: false,
  },
  {
    id: 'TRAIL-002',
    species: 'Asian Elephant',
    individualId: 'Herd Motichur Alpha (6 members)',
    status: 'Active Migration Transit',
    direction: 'North-West',
    speedKmh: 3.5,
    waypoints: [
      { lat: 30.012, lon: 78.225, time: '16:30', elevation: 330, label: 'Ganges Riverbank Shallows' },
      { lat: 30.019, lon: 78.215, time: '17:20', elevation: 340, label: 'Chilla Canal Crossing Point' },
      { lat: 30.026, lon: 78.207, time: '18:15', elevation: 345, label: 'CAM-018 Railway Interface' },
      { lat: 30.032, lon: 78.198, time: '19:00', elevation: 355, label: 'Motichur West Buffer Sal Patch' },
    ],
    riskZoneIntersects: ['RISK-004'],
    nearbyCorridor: 'Kansro-Barkote Ecological Link',
    isSimulation: false,
  },
  {
    id: 'TRAIL-003',
    species: 'Bengal Tiger',
    individualId: 'Tiger T-104 (Sub-adult Male)',
    status: 'Territorial Patrol',
    direction: 'South-West',
    speedKmh: 5.1,
    waypoints: [
      { lat: 29.565, lon: 78.995, time: '01:10', elevation: 430, label: 'Corbett Core Compartment 12' },
      { lat: 29.554, lon: 78.988, time: '01:50', elevation: 410, label: 'Kosi River Sandbar' },
      { lat: 29.545, lon: 78.978, time: '02:40', elevation: 390, label: 'CAM-044 Buffer Sensor' },
    ],
    riskZoneIntersects: ['RISK-009'],
    nearbyCorridor: 'Ramnagar-Mohan Foothill Corridor',
    isSimulation: false,
  },
];

export class MovementProvider {
  async getTrails() {
    throw new Error('Not implemented');
  }
}

export class DemoMovementProvider extends MovementProvider {
  constructor() {
    super();
    this._trails = JSON.parse(JSON.stringify(INITIAL_MOVEMENT_TRAILS));
    this._subscribers = new Set();
  }

  async getTrails() {
    return [...this._trails];
  }

  async getTrailById(id) {
    return this._trails.find((t) => t.id === id) || null;
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
        console.warn('[MovementProvider] listener error:', err);
      }
    }
  }

  addSimulatedTrail(event) {
    const id = `SIM-TRAIL-${Math.floor(100 + Math.random() * 900)}`;
    const newTrail = {
      id,
      species: event.species || 'Leopard',
      individualId: `${event.species} (Simulated Active Track)`,
      status: 'High-Alert Movement toward Village Outskirts',
      direction: event.direction || 'South-West',
      speedKmh: 4.8,
      waypoints: [
        { lat: 30.048, lon: 78.210, time: '19:15', elevation: 380, label: 'Corridor Edge' },
        { lat: 30.044, lon: 78.214, time: '19:42', elevation: 360, label: 'Sensor Trigger CAM-017' },
        { lat: 30.038, lon: 78.220, time: '20:10', elevation: 350, label: 'Canal Crossing' },
        { lat: 30.032, lon: 78.226, time: '20:45', elevation: 340, label: 'Settlement Perimeter' },
      ],
      riskZoneIntersects: ['RISK-008'],
      nearbyCorridor: 'Chilla-Motichur Corridor #07',
      isSimulation: true,
    };
    this._trails.unshift(newTrail);
    this._notify();
    return newTrail;
  }

  async getActiveTrails() {
    return (await this.getTrails()).map(t => ({
      ...t,
      name: t.name || t.individualId || `${t.species} Corridor Trail`,
      coordinates: t.coordinates || (t.waypoints ? t.waypoints.map(w => [w.lon, w.lat]) : [])
    }));
  }

  reset() {
    this._trails = JSON.parse(JSON.stringify(INITIAL_MOVEMENT_TRAILS));
    this._notify();
  }
}

export const demoMovementProvider = new DemoMovementProvider();
export const defaultMovementProvider = demoMovementProvider;
