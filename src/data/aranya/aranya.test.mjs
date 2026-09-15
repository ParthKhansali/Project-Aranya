// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Master Domain & Integration Unit Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';

import speciesData from './species.json' with { type: 'json' };
import scenariosData from './scenarios.json' with { type: 'json' };
import { defaultWildlifeProvider } from './wildlifeProvider.js';
import { defaultMovementProvider } from './movementProvider.js';
import { defaultRiskProvider, getRiskCategory } from './riskProvider.js';
import { defaultConflictProvider } from './conflictProvider.js';
import { defaultHabitatProvider } from './habitatProvider.js';
import { defaultHumanInterfaceProvider } from './humanInterfaceProvider.js';
import { defaultFieldTeamProvider } from './fieldTeamProvider.js';
import { defaultAlertProvider } from './alertProvider.js';
import { CAMERA_PRESETS } from '../../camera.js';

// 1. Navigation & Views: Default India view, Uttarakhand navigation, optional Global view
test('ARANYA View Navigation: Default India View, Uttarakhand Pilot, Optional Global View', () => {
  // Default India View
  assert.ok(CAMERA_PRESETS.india, 'India preset must be configured');
  assert.ok(CAMERA_PRESETS.india.destination, 'India preset must have 3D destination coordinates');
  assert.equal(CAMERA_PRESETS.india.orientation.pitch < 0, true, 'India view should point down at subcontinent');

  // Uttarakhand Primary Pilot Geography
  assert.ok(CAMERA_PRESETS.uttarakhand, 'Uttarakhand pilot preset must be configured');
  assert.ok(CAMERA_PRESETS.rajaji, 'Rajaji landscape preset must exist');
  assert.ok(CAMERA_PRESETS.corbett, 'Corbett landscape preset must exist');
  assert.ok(CAMERA_PRESETS.raiwala, 'Raiwala conflict interface preset must exist');

  // Optional Global Context View
  assert.ok(CAMERA_PRESETS.global, 'Global context preset must remain optionally accessible');
  assert.ok(CAMERA_PRESETS.global.destination, 'Global context must have planetary destination coordinates');
});

// 2. Species Taxonomy & Conflict Profiles
test('Species Taxonomy & Conflict Profiles', () => {
  const speciesList = speciesData.species || speciesData;
  assert.ok(Array.isArray(speciesList), 'species data should be an array');
  assert.equal(speciesList.length, 6, 'should contain 6 key Indian wildlife species');
  const leopard = speciesList.find((s) => s.id === 'leopard');
  assert.ok(leopard, 'leopard species must exist');
  assert.equal(leopard.commonName, 'Indian Leopard');
  assert.ok(leopard.primaryConflictType, 'should have conflict profile info');
});

// 3. Wildlife Observation Layer & Camera Traps
test('Wildlife Observation Layer & Camera Traps', async () => {
  const traps = await defaultWildlifeProvider.getCameraTraps();
  assert.ok(traps.length >= 6, 'should have full set of active pilot camera traps');
  const cam17 = traps.find((t) => t.id === 'CAM-017');
  assert.ok(cam17, 'CAM-017 must exist');
  assert.ok(cam17.battery > 0, 'Camera trap must expose battery telemetry');
  assert.equal(cam17.status, 'ONLINE', 'CAM-017 should be online');

  const obs = await defaultWildlifeProvider.getObservations();
  assert.ok(obs.length >= 1, 'should have live/recorded observations');
  assert.ok(obs[0].species, 'Observation must include species classification');
  assert.ok(obs[0].confidence > 0.5, 'Observation should have high AI confidence score');

  // Simulated real-time trap observation
  const simulated = defaultWildlifeProvider.addSimulatedObservation({
    species: 'Panthera pardus (Indian Leopard)',
    trapId: 'CAM-018',
    confidence: 0.94,
    lat: 30.0125,
    lon: 78.238,
  });
  assert.ok(simulated.id.startsWith('SIM-WL-'));
  const updatedObs = await defaultWildlifeProvider.getObservations();
  assert.equal(updatedObs[0].id, simulated.id);
});

// 4. Wildlife Movement Layer & Corridors
test('Wildlife Movement Layer & Corridors', async () => {
  const trails = await defaultMovementProvider.getActiveTrails();
  assert.ok(trails.length >= 1, 'should have active movement trails');
  assert.ok(Array.isArray(trails[0].coordinates), 'trail must have coordinate array');
  assert.ok(trails[0].speedKmh > 0, 'movement trail should report velocity in km/h');

  // Critical Corridors & Pinch Points
  const corridors = await defaultHabitatProvider.getCorridors();
  const c7 = corridors.find((c) => c.id === 'CORR-07');
  assert.ok(c7, 'Chilla-Motichur Corridor #07 must exist');
  assert.ok(c7.pinchPoints.length >= 2, 'should have pinch points along railway/highway');
  assert.ok(c7.functionalityScore <= 65, 'Chilla-Motichur should reflect heavy pressure score');
});

// 5. Conflict Incidents Layer & Statistics
test('Conflict Incidents Layer & Statistics', async () => {
  const incidents = await defaultConflictProvider.getIncidents();
  assert.ok(incidents.length >= 5, 'should have historical incidents');

  const leopardIncidents = await defaultConflictProvider.getIncidents({ speciesKey: 'leopard' });
  assert.ok(leopardIncidents.length >= 1, 'should have leopard conflict records');
  assert.ok(leopardIncidents.every((i) => i.speciesKey === 'leopard'));

  const stats = defaultConflictProvider.getStatsByLandscape();
  const landscapes = Object.keys(stats);
  assert.ok(landscapes.length >= 1, 'should aggregate stats across landscapes');
  const firstLs = stats[landscapes[0]];
  assert.ok(firstLs.total > 0, 'landscape stats must report total incidents');
});

// 6. Conflict Risk Layer & Explainability Factors
test('Conflict Risk Layer & Explainability Engine', async () => {
  const cells = await defaultRiskProvider.getRiskCells();
  assert.ok(cells.length >= 4, 'should have risk grid cells');

  const r8 = await defaultRiskProvider.getCellById('RISK-008');
  assert.ok(r8, 'RISK-008 (Raiwala) must exist');
  assert.equal(r8.overallScore, 87);

  const explanation = await defaultRiskProvider.getRiskExplanation('RISK-008');
  assert.ok(explanation, 'explanation must be returned');
  assert.ok(explanation.factors.recentSightings, 'must have recent sightings factor');
  assert.ok(explanation.factors.conflictHistory, 'must have conflict history factor');
  assert.ok(explanation.factors.livestockDensity, 'must have livestock density factor');
  assert.ok(explanation.factors.forestEdgeProximity, 'must have forest edge factor');

  // Test risk category mappings
  assert.equal(getRiskCategory(87).label, 'Critical Risk');
  assert.equal(getRiskCategory(65).label, 'High Risk');
  assert.equal(getRiskCategory(45).label, 'Moderate Risk');
  assert.equal(getRiskCategory(20).label, 'Low Risk');

  // Updating cell risk
  defaultRiskProvider.updateCellRisk('RISK-008', 92);
  const updated = await defaultRiskProvider.getCellById('RISK-008');
  assert.equal(updated.overallScore, 92);
});

// 7. Habitat Layer, Protected Reserves & Habitat Change
test('Habitat Layer: Protected Reserves & Habitat Change Pressure', async () => {
  const reserves = await defaultHabitatProvider.getReserves();
  assert.ok(reserves.length >= 2, 'should provide core protected reserves');
  const rajaji = reserves.find((r) => r.id === 'RES-RAJ-01');
  assert.ok(rajaji, 'Rajaji National Park must exist');
  assert.ok(rajaji.zones.coreKm2 > 0, 'Reserve must report core zone area');

  const corbett = reserves.find((r) => r.id === 'RES-COR-02');
  assert.ok(corbett, 'Corbett National Park must exist');

  // Habitat Change & Pressure Areas
  const pressureAreas = await defaultHabitatProvider.getHabitatPressureAreas();
  assert.ok(pressureAreas.length >= 2, 'should monitor habitat loss / encroachment areas');
  const raiwalaPress = pressureAreas.find((p) => p.id === 'PRESS-01');
  assert.ok(raiwalaPress, 'Raiwala linear expansion pressure area must exist');
  assert.ok(raiwalaPress.canopyLossPercent > 10, 'Should measure canopy loss percentage');
  assert.ok(raiwalaPress.impactSummary, 'Should include qualitative impact explanation');
});

// 8. Human Interface: Settlements & Infrastructure
test('Human Interface: Settlements & Infrastructure Corridors', async () => {
  const sets = await defaultHumanInterfaceProvider.getSettlements();
  assert.ok(sets.length >= 4);
  const raiwala = sets.find((s) => s.id === 'SET-RAI-01');
  assert.ok(raiwala, 'Raiwala settlement must exist');
  assert.equal(raiwala.distanceToForestMeters, 45);

  const infra = await defaultHumanInterfaceProvider.getInfrastructureCorridors();
  assert.ok(infra.length >= 2);
});

// 9. Alert System: Priority Queue & Evidence Panel
test('Alert System: Priority Queue & Contextual Evidence', async () => {
  const alerts = await defaultAlertProvider.getAlerts();
  assert.ok(alerts.length >= 3, 'should maintain active alerts queue');

  const topAlert = alerts[0];
  assert.ok(topAlert.riskScore >= alerts[alerts.length - 1].riskScore, 'Alerts should be prioritized by risk score');

  const alert = await defaultAlertProvider.getAlertById('ALT-2026-042');
  assert.ok(alert, 'ALT-2026-042 must be retrievable');
  assert.equal(alert.riskScore, 87);
  assert.ok(alert.evidenceTrapIds && alert.evidenceTrapIds.length > 0, 'Alert must link to evidence camera traps');
  assert.ok(alert.summary, 'Alert must contain summary assessment');
  assert.ok(alert.recommendedAction, 'Alert must contain recommended action');
});

// 10. Field Verification Workflow & Dispatch
test('Field Verification Workflow: Dispatch & Report Resolution', async () => {
  const teams = await defaultFieldTeamProvider.getTeams();
  assert.equal(teams.length, 3, 'should have 3 standby rapid response teams');
  const alpha = teams.find((t) => t.id === 'TEAM-ALPHA');
  assert.equal(alpha.status, 'available');

  // Dispatch Team Alpha
  await defaultFieldTeamProvider.dispatchTeam('TEAM-ALPHA', 'ALT-2026-042', { lat: 30.0125, lon: 78.238 });
  const updatedAlpha = await defaultFieldTeamProvider.getTeamById('TEAM-ALPHA');
  assert.equal(updatedAlpha.status, 'dispatched');
  assert.equal(updatedAlpha.activeAssignment.alertId, 'ALT-2026-042');

  // Submit Verification Report
  const report = await defaultFieldTeamProvider.submitVerificationReport('ALT-2026-042', {
    teamId: 'TEAM-ALPHA',
    officer: 'Ranger Vikram Negi',
    outcomeType: 'deterrent_applied',
    findings: 'Visual confirmation of leopard tracks near cattle enclosure.',
    threatStatus: 'RESOLVED_DEFUSED',
  });
  assert.ok(report.id.startsWith('REP-'));
  assert.equal(report.threatStatus, 'RESOLVED_DEFUSED');

  // Team Alpha should now be freed back to available status
  const freedAlpha = await defaultFieldTeamProvider.getTeamById('TEAM-ALPHA');
  assert.equal(freedAlpha.status, 'available');
});

// 11. Deterministic Mock Data Integrity
test('Deterministic Mock Data & Geography Boundaries', async () => {
  const traps = await defaultWildlifeProvider.getCameraTraps();
  const sets = await defaultHumanInterfaceProvider.getSettlements();

  // All Uttarakhand pilot points must fall within valid lat/lon bounds
  for (const trap of traps) {
    assert.ok(trap.lat >= 29.0 && trap.lat <= 31.0, `trap ${trap.id} lat out of Uttarakhand bounds`);
    assert.ok(trap.lon >= 77.5 && trap.lon <= 80.0, `trap ${trap.id} lon out of Uttarakhand bounds`);
  }

  for (const set of sets) {
    assert.ok(set.lat >= 29.0 && set.lat <= 31.0, `settlement ${set.id} lat out of bounds`);
    assert.ok(set.lon >= 77.5 && set.lon <= 80.0, `settlement ${set.id} lon out of bounds`);
  }
});

// 12. Simulation Scenarios & Demo Mode
test('Simulation Scenarios: Multi-Step Scenario Engine & Demo Mode', () => {
  assert.equal(scenariosData.length, 4, 'should define exactly 4 demonstration scenarios');

  const s1 = scenariosData.find((s) => s.id === 'scenario-leopard-early-warning');
  assert.ok(s1, 'Scenario 1: Leopard Early Warning must exist');
  assert.equal(s1.species, 'Panthera pardus (Indian Leopard)');
  assert.ok(s1.steps.length >= 3, 'scenario must have sequential steps');

  const s2 = scenariosData.find((s) => s.id === 'scenario-elephant-corridor');
  assert.ok(s2, 'Scenario 2: Elephant Railway Corridor crossing must exist');

  const s3 = scenariosData.find((s) => s.id === 'scenario-habitat-pressure');
  assert.ok(s3, 'Scenario 3: Habitat Pressure must exist');

  const s4 = scenariosData.find((s) => s.id === 'scenario-unauthorized-activity');
  assert.ok(s4, 'Scenario 4: Unauthorized Activity / Perimeter Disturbance must exist');
});
