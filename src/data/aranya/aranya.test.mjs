// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Domain Unit Test Suite
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

test('Species Taxonomy & Conflict Profiles', () => {
  const speciesList = speciesData.species || speciesData;
  assert.ok(Array.isArray(speciesList), 'species data should be an array');
  assert.equal(speciesList.length, 6, 'should contain 6 key Indian wildlife species');
  const leopard = speciesList.find(s => s.id === 'leopard');
  assert.ok(leopard, 'leopard species must exist');
  assert.equal(leopard.commonName, 'Indian Leopard');
  assert.ok(leopard.primaryConflictType, 'should have conflict profile info');
});

test('Wildlife Provider: Camera Traps & Observations', async () => {
  const traps = await defaultWildlifeProvider.getCameraTraps();
  assert.ok(traps.length >= 2, 'should have camera traps');
  const cam17 = traps.find(t => t.id === 'CAM-017');
  assert.ok(cam17, 'CAM-017 must exist');

  const obs = await defaultWildlifeProvider.getObservations();
  assert.ok(obs.length >= 1, 'should have observations');

  // Test simulation addition
  const simulated = defaultWildlifeProvider.addSimulatedObservation({
    species: 'Panthera pardus (Indian Leopard)',
    lat: 30.0125,
    lon: 78.2380,
  });
  assert.ok(simulated.id.startsWith('SIM-WL-'));
  const updatedObs = await defaultWildlifeProvider.getObservations();
  assert.equal(updatedObs[0].id, simulated.id);
});

test('Movement Provider: Trails & Active Trails', async () => {
  const trails = await defaultMovementProvider.getActiveTrails();
  assert.ok(trails.length >= 1, 'should have active movement trails');
  assert.ok(Array.isArray(trails[0].coordinates), 'trail must have coordinate array');
});

test('Risk Assessment & Explainability Engine', async () => {
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

  // Test category calculation
  assert.equal(getRiskCategory(87).label, 'Critical Risk');
  assert.equal(getRiskCategory(24).label, 'Low Risk');

  // Test updating cell risk
  defaultRiskProvider.updateCellRisk('RISK-008', 91);
  const updated = await defaultRiskProvider.getCellById('RISK-008');
  assert.equal(updated.overallScore, 91);
});

test('Conflict Provider: Historical Incidents & Stats', async () => {
  const incidents = await defaultConflictProvider.getIncidents();
  assert.ok(incidents.length >= 5, 'should have historical incidents');

  const filtered = await defaultConflictProvider.getIncidents({ speciesKey: 'leopard' });
  assert.ok(filtered.length >= 1);
  assert.ok(filtered.every(i => i.speciesKey === 'leopard'));

  const stats = defaultConflictProvider.getStatsByLandscape();
  assert.ok(Object.keys(stats).length >= 1);
});

test('Habitat Provider: Protected Reserves & Critical Corridors', async () => {
  const reserves = await defaultHabitatProvider.getReserves();
  assert.ok(reserves.length >= 2);
  const rajaji = reserves.find(r => r.id === 'RES-RAJ-01');
  assert.ok(rajaji, 'Rajaji National Park must exist');

  const corridors = await defaultHabitatProvider.getCorridors();
  const c7 = corridors.find(c => c.id === 'CORR-07');
  assert.ok(c7, 'Chilla-Motichur Corridor #07 must exist');
  assert.ok(c7.pinchPoints.length >= 2, 'should have pinch points');
});

test('Human Interface: Settlements & Corridors', async () => {
  const sets = await defaultHumanInterfaceProvider.getSettlements();
  assert.ok(sets.length >= 4);
  const raiwala = sets.find(s => s.id === 'SET-RAI-01');
  assert.ok(raiwala, 'Raiwala settlement must exist');
  assert.equal(raiwala.distanceToForestMeters, 45);

  const infra = await defaultHumanInterfaceProvider.getInfrastructureCorridors();
  assert.ok(infra.length >= 2);
});

test('Field Teams: Dispatch & Ground Verification Workflow', async () => {
  const teams = await defaultFieldTeamProvider.getTeams();
  assert.equal(teams.length, 3);
  const alpha = teams.find(t => t.id === 'TEAM-ALPHA');
  assert.equal(alpha.status, 'available');

  // Dispatch Team Alpha
  await defaultFieldTeamProvider.dispatchTeam('TEAM-ALPHA', 'ALT-2026-042', { lat: 30.0125, lon: 78.2380 });
  const updatedAlpha = await defaultFieldTeamProvider.getTeamById('TEAM-ALPHA');
  assert.equal(updatedAlpha.status, 'dispatched');
  assert.equal(updatedAlpha.activeAssignment.alertId, 'ALT-2026-042');

  // Submit Verification Report
  const report = await defaultFieldTeamProvider.submitVerificationReport('ALT-2026-042', {
    teamId: 'TEAM-ALPHA',
    officer: 'Ranger Vikram Negi',
    outcomeType: 'deterrent_applied',
    findings: 'Visual confirmation of leopard tracks near cattle enclosure.',
    threatStatus: 'RESOLVED_DEFUSED'
  });
  assert.ok(report.id.startsWith('REP-'));
  assert.equal(report.threatStatus, 'RESOLVED_DEFUSED');

  // Team Alpha should now be available again
  const freedAlpha = await defaultFieldTeamProvider.getTeamById('TEAM-ALPHA');
  assert.equal(freedAlpha.status, 'available');
});

test('Alert Provider: Priority Queue & Status Transitions', async () => {
  const alerts = await defaultAlertProvider.getAlerts();
  assert.ok(alerts.length >= 3);

  const alert = await defaultAlertProvider.getAlertById('ALT-2026-042');
  assert.ok(alert);
  assert.equal(alert.riskScore, 87);

  // Transition status
  await defaultAlertProvider.updateAlertStatus('ALT-2026-042', 'ASSIGNED', 'TEAM-ALPHA');
  const updated = await defaultAlertProvider.getAlertById('ALT-2026-042');
  assert.equal(updated.status, 'ASSIGNED');
  assert.equal(updated.assignedTeam, 'TEAM-ALPHA');
});

test('Scenarios Definition: 4 Demonstration Scenarios', () => {
  assert.equal(scenariosData.length, 4, 'should define exactly 4 demonstration scenarios');
  const s1 = scenariosData.find(s => s.id === 'scenario-leopard-early-warning');
  assert.ok(s1, 'Scenario 1: Leopard Early Warning must exist');
  assert.ok(s1.steps.length >= 3, 'scenario must have multi-step actions');
});
