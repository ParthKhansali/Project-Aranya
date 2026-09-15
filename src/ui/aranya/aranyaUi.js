// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Master UI Controller, Interaction Engine & Decision Support System (DSS)
import * as Cesium from 'cesium';
import { defaultWildlifeProvider } from '../../data/aranya/wildlifeProvider.js';
import { defaultMovementProvider } from '../../data/aranya/movementProvider.js';
import { defaultConflictProvider } from '../../data/aranya/conflictProvider.js';
import {
  defaultRiskProvider,
  getRiskCategory,
} from '../../data/aranya/riskProvider.js';
import { defaultHabitatProvider } from '../../data/aranya/habitatProvider.js';
import { defaultHumanInterfaceProvider } from '../../data/aranya/humanInterfaceProvider.js';
import { defaultFieldTeamProvider } from '../../data/aranya/fieldTeamProvider.js';
import { defaultAlertProvider } from '../../data/aranya/alertProvider.js';
import scenariosData from '../../data/aranya/scenarios.json';
import { CAMERA_PRESETS, flyToPreset } from '../../camera.js';
import { AranyaMapVisualizer } from './aranyaMapVisualizer.js';
import './aranya.css';

export class AranyaUi {
  constructor({ viewer, dataManager, styleManager }) {
    this.viewer = viewer;
    this.dataManager = dataManager;
    this.styleManager = styleManager;
    this.activeTab = 'wildlife';
    this.selectedItem = null;
    this.selectedType = null;
    this.unsubscribers = [];
    this.mapVisualizer = new AranyaMapVisualizer(viewer);
  }

  async mount() {
    // 1. Hide legacy military HUD, bottom command dock, scope mask, and Cesium credit / Ion logo
    const intelHud = document.getElementById('intel-hud');
    if (intelHud) {
      intelHud.style.display = 'none';
      intelHud.innerHTML = '';
    }
    const commandDock = document.getElementById('command-dock');
    if (commandDock) {
      commandDock.style.display = 'none';
      commandDock.setAttribute('hidden', '');
      commandDock.setAttribute('aria-hidden', 'true');
    }
    document.getElementById('scope-mask')?.remove();
    const cesiumCredits = document.getElementById('cesium-credits');
    if (cesiumCredits) {
      cesiumCredits.style.cssText =
        'display: none !important; visibility: hidden !important; pointer-events: none !important; width: 0 !important; height: 0 !important; position: absolute !important; left: -9999px !important;';
      cesiumCredits.setAttribute('hidden', '');
      cesiumCredits.setAttribute('aria-hidden', 'true');
    }
    document
      .querySelectorAll(
        '.cesium-widget-credits, .cesium-credit-lightbox, .cesium-credit-lightbox-overlay',
      )
      .forEach((el) => {
        el.style.display = 'none';
      });

    // 2. Build ARANYA DOM components
    this._buildTopHud();
    this._buildLeftNav();
    this._buildRightRail();
    this._buildModals();
    this._buildToastContainer();

    // 3. Initialize 3D Map Visualizer layers on the Cesium globe
    await this._initMapLayers();

    // 4. Setup entity picking so clicking items on the 3D globe opens their dossier
    this.mapVisualizer.setupEntityPicking((type, data) =>
      this.inspectItem(type, data),
    );

    this._attachEntitySelectionListener();
    this._subscribeProviders();
    this._updateCounters();

    // 5. Check if user has dismissed welcome modal previously; otherwise display starting choices
    const hasSeenWelcome = localStorage.getItem('aranya:welcomed');
    if (!hasSeenWelcome) {
      this.showWelcomeModal();
    }
  }

  destroy() {
    for (const unsub of this.unsubscribers) {
      try {
        unsub();
      } catch (e) {}
    }
    this.mapVisualizer?.destroy();
    document.getElementById('aranya-top-hud')?.remove();
    document.getElementById('aranya-left-nav')?.remove();
    document.getElementById('aranya-right-rail')?.remove();
    document.getElementById('aranya-welcome-modal')?.remove();
    document.getElementById('aranya-simulator-modal')?.remove();
    document.getElementById('aranya-toast-container')?.remove();
  }

  // -------------------------------------------------------------
  // INITIALIZE 3D MAP LAYERS
  // -------------------------------------------------------------
  async _initMapLayers() {
    try {
      const [
        cameraTraps,
        observations,
        riskCells,
        settlements,
        corridors,
        fieldTeams,
      ] = await Promise.all([
        defaultWildlifeProvider.getCameraTraps(),
        defaultWildlifeProvider.getObservations(),
        defaultRiskProvider.getRiskCells(),
        defaultHumanInterfaceProvider.getSettlements(),
        defaultHabitatProvider.getCorridors(),
        defaultFieldTeamProvider.getTeams(),
      ]);

      this.mapVisualizer.renderStaticLayers({
        cameraTraps,
        observations,
        riskCells,
        settlements,
        corridors,
        fieldTeams,
      });
    } catch (err) {
      console.warn('[ARANYA] Could not initialize 3D map layers:', err);
    }
  }

  // -------------------------------------------------------------
  // 1. TOP HUD
  // -------------------------------------------------------------
  _buildTopHud() {
    const hud = document.createElement('header');
    hud.id = 'aranya-top-hud';
    hud.className = 'aranya-glass';
    hud.innerHTML = `
      <div class="aranya-brand">
        <div class="aranya-logo-badge">🌿</div>
        <div class="aranya-title-wrap">
          <h1>ARANYA <span class="aranya-tag-accent">INTELLIGENCE</span></h1>
          <p class="aranya-subtitle">WILDLIFE & HUMAN-CONFLICT INTELLIGENCE PLATFORM · UTTARAKHAND</p>
        </div>
      </div>

      <nav class="aranya-presets-bar" aria-label="Landscape navigation">
        <button class="aranya-preset-btn" data-preset="india" title="India Subcontinent Overview">🇮🇳 INDIA</button>
        <button class="aranya-preset-btn active" data-preset="uttarakhand" title="Uttarakhand Pilot Corridor">🏔️ UTTARAKHAND</button>
        <button class="aranya-preset-btn" data-preset="rajaji" title="Rajaji National Park Core & Buffer">🌲 RAJAJI</button>
        <button class="aranya-preset-btn" data-preset="corbett" title="Jim Corbett National Park & Ramnagar">🐅 CORBETT</button>
        <button class="aranya-preset-btn" data-preset="raiwala" title="Raiwala Conflict Interface Focus">🚨 RAIWALA</button>
        <button class="aranya-preset-btn" data-preset="global" title="Global Context">🌐 GLOBAL</button>
      </nav>

      <div class="aranya-stats-pill-group">
        <div class="aranya-stat-pill">
          <span class="aranya-stat-label">ACTIVE SIGHTINGS</span>
          <span id="stat-sightings-val" class="aranya-stat-val text-green">7</span>
        </div>
        <div class="aranya-stat-pill">
          <span class="aranya-stat-label">MAX CONFLICT RISK</span>
          <span id="stat-risk-val" class="aranya-stat-val critical">87 CRITICAL</span>
        </div>
        <div class="aranya-stat-pill">
          <span class="aranya-stat-label">PRIORITY ALERTS</span>
          <span id="stat-alerts-val" class="aranya-stat-val warning">1 ACTIVE</span>
        </div>
      </div>

      <div class="aranya-hud-actions">
        <button id="btn-open-sim" class="aranya-sim-btn" type="button" title="Open Interactive Event Simulator">
          <span>⚡ SIMULATE EVENT</span>
        </button>
        <button id="btn-open-welcome" class="aranya-btn aranya-btn-secondary" type="button" title="Region Selector & Mission Guide">
          <span>🗺️ GUIDE</span>
        </button>
      </div>
    `;

    document.body.appendChild(hud);

    // Preset button click handlers
    hud.querySelectorAll('.aranya-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        hud
          .querySelectorAll('.aranya-preset-btn')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.dataset.preset;
        flyToPreset(this.viewer, preset);
      });
    });

    // Action handlers
    document
      .getElementById('btn-open-sim')
      ?.addEventListener('click', () => this.showSimulatorModal());
    document
      .getElementById('btn-open-welcome')
      ?.addEventListener('click', () => this.showWelcomeModal());
  }

  // -------------------------------------------------------------
  // 2. LEFT OPERATIONS NAVIGATION
  // -------------------------------------------------------------
  _buildLeftNav() {
    const nav = document.createElement('aside');
    nav.id = 'aranya-left-nav';
    nav.className = 'aranya-glass';
    nav.innerHTML = `
      <div class="aranya-nav-header">
        <h3><span>OPERATIONAL PANELS</span> <small id="nav-active-filter" style="font-size:10px;color:var(--aranya-emerald)">PILOT SECTORS</small></h3>
      </div>
      <div class="aranya-tabs-bar">
        <button class="aranya-tab-item active" data-tab="wildlife">🐾 Wildlife</button>
        <button class="aranya-tab-item" data-tab="risk">⚠️ Risk Grid</button>
        <button class="aranya-tab-item" data-tab="alerts">🚨 Alerts</button>
        <button class="aranya-tab-item" data-tab="habitats">🌲 Corridors</button>
        <button class="aranya-tab-item" data-tab="settlements">🏘️ Villages</button>
        <button class="aranya-tab-item" data-tab="teams">🛡️ Teams</button>
      </div>
      <div id="aranya-nav-content" class="aranya-nav-body"></div>
    `;

    document.body.appendChild(nav);

    // Tab switching
    nav.querySelectorAll('.aranya-tab-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        nav
          .querySelectorAll('.aranya-tab-item')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderNavTab();
      });
    });

    this.renderNavTab();
  }

  async renderNavTab() {
    const container = document.getElementById('aranya-nav-content');
    if (!container) return;
    container.innerHTML = '';

    if (this.activeTab === 'wildlife') {
      const traps = await defaultWildlifeProvider.getCameraTraps();
      const obs = await defaultWildlifeProvider.getObservations();

      const headingTraps = document.createElement('div');
      headingTraps.className = 'aranya-card-sub';
      headingTraps.style.fontWeight = 'bold';
      headingTraps.textContent = `CAMERA TRAP STATIONS (${traps.length})`;
      container.appendChild(headingTraps);

      for (const trap of traps) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">📷 ${trap.id}</span>
            <span class="aranya-badge ${trap.status === 'triggered' ? 'aranya-badge-red' : 'aranya-badge-green'}">${trap.status.toUpperCase()}</span>
          </div>
          <div class="aranya-card-sub" style="font-weight:600;color:#f0fdf4">${trap.name}</div>
          <div class="aranya-card-sub" style="margin-top:4px;color:#a7f3d0">Last: ${trap.lastDetection?.species || trap.lastTriggerSpecies || 'Routine standby'} · Batt: ${trap.battery || 88}%</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(trap.lon, trap.lat, 3500);
          this.inspectItem('trap', trap);
        });
        container.appendChild(card);
      }

      const headingObs = document.createElement('div');
      headingObs.className = 'aranya-card-sub';
      headingObs.style.fontWeight = 'bold';
      headingObs.style.marginTop = '14px';
      headingObs.textContent = `RECENT OBSERVATIONS (${obs.length})`;
      container.appendChild(headingObs);

      for (const item of obs) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        const riskScore = item.conflictRiskIndex || 80;
        const badgeClass =
          riskScore >= 80
            ? 'aranya-badge-red'
            : riskScore >= 60
              ? 'aranya-badge-amber'
              : 'aranya-badge-green';
        const icon =
          item.icon ||
          (item.species === 'Leopard'
            ? '🐆'
            : item.species === 'Asian Elephant'
              ? '🐘'
              : item.species === 'Bengal Tiger'
                ? '🐅'
                : item.species === 'Spotted Deer'
                  ? '🦌'
                  : '🐗');

        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">${icon} ${item.species}</span>
            <span class="aranya-badge ${badgeClass}">${riskScore ? `RISK ${riskScore}` : 'STABLE'}</span>
          </div>
          <div class="aranya-card-sub" style="font-weight:600;color:#f0fdf4">${item.cameraName || item.locationName || 'Uttarakhand Corridor'}</div>
          <div class="aranya-card-sub" style="margin-top:4px;color:#cbd5e1">${item.status || item.recentMovement}</div>
          <div class="aranya-card-sub" style="margin-top:2px;font-size:10px;color:var(--aranya-emerald)">${item.timestamp} · Conf: ${Math.round((item.confidence || 0.9) * 100)}%</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(item.lon, item.lat, 3500);
          this.inspectItem('observation', item);
        });
        container.appendChild(card);
      }
    } else if (this.activeTab === 'risk') {
      const cells = await defaultRiskProvider.getRiskCells();
      for (const cell of cells) {
        const cat = getRiskCategory(cell.overallScore);
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        const badgeClass =
          cell.overallScore >= 81
            ? 'aranya-badge-red'
            : cell.overallScore >= 61
              ? 'aranya-badge-amber'
              : cell.overallScore >= 31
                ? 'aranya-badge-blue'
                : 'aranya-badge-green';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">⚠️ ${cell.id}</span>
            <span class="aranya-badge ${badgeClass}">${cell.overallScore} - ${cat.label}</span>
          </div>
          <div class="aranya-card-sub" style="font-weight:600;color:#f0fdf4">${cell.name}</div>
          <div class="aranya-card-sub" style="margin-top:4px;">Primary: ${cell.primaryThreat}</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(cell.centerLon, cell.centerLat, 4800);
          this.inspectItem('risk', cell);
        });
        container.appendChild(card);
      }
    } else if (this.activeTab === 'alerts') {
      const alerts = await defaultAlertProvider.getAlerts();
      for (const alert of alerts) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">🚨 ${alert.id}</span>
            <span class="aranya-badge ${alert.severity === 'CRITICAL' ? 'aranya-badge-red' : 'aranya-badge-amber'}">${alert.severity}</span>
          </div>
          <div class="aranya-card-sub" style="font-weight:600;color:#f0fdf4">${alert.title}</div>
          <div class="aranya-card-sub" style="margin-top:4px;color:#cbd5e1">${alert.summary}</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(alert.lon, alert.lat, 4000);
          this.inspectItem('alert', alert);
        });
        container.appendChild(card);
      }
    } else if (this.activeTab === 'habitats') {
      const corridors = await defaultHabitatProvider.getCorridors();
      for (const corr of corridors) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">🌲 ${corr.name}</span>
            <span class="aranya-badge aranya-badge-blue">FN: ${corr.functionalityScore}/100</span>
          </div>
          <div class="aranya-card-sub">${corr.description}</div>
          <div class="aranya-card-sub" style="margin-top:6px;color:#f59e0b">Pinch Points: ${corr.pinchPoints ? corr.pinchPoints.length : 0} critical bottlenecks</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(corr.centerLon, corr.centerLat, 8000);
          this.inspectItem('corridor', corr);
        });
        container.appendChild(card);
      }
    } else if (this.activeTab === 'settlements') {
      const sets = await defaultHumanInterfaceProvider.getSettlements();
      for (const set of sets) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">🏘️ ${set.name}</span>
            <span class="aranya-badge ${set.distanceToForestMeters < 60 ? 'aranya-badge-red' : 'aranya-badge-amber'}">${set.distanceToForestMeters}m to forest</span>
          </div>
          <div class="aranya-card-sub">Population: ${set.population.toLocaleString()} · Conflict Index: ${set.conflictHistoryScore}/100</div>
          <div class="aranya-card-sub" style="margin-top:4px;">${set.primaryVulnerability}</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(set.lon, set.lat, 4500);
          this.inspectItem('settlement', set);
        });
        container.appendChild(card);
      }
    } else if (this.activeTab === 'teams') {
      const teams = await defaultFieldTeamProvider.getTeams();
      for (const team of teams) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">🛡️ ${team.name.split('—')[0]}</span>
            <span class="aranya-badge ${team.status === 'dispatched' ? 'aranya-badge-red' : 'aranya-badge-green'}">${team.status.toUpperCase()}</span>
          </div>
          <div class="aranya-card-sub" style="color:#f0fdf4">${team.division}</div>
          <div class="aranya-card-sub" style="margin-top:4px;">Base: ${team.baseStation} · Vehicle: ${team.vehicle}</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(team.currentLon, team.currentLat, 3800);
          this.inspectItem('team', team);
        });
        container.appendChild(card);
      }
    }
  }

  // -------------------------------------------------------------
  // 3. RIGHT CONTEXT INTELLIGENCE RAIL (EXECUTIVE DOSSIERS & XAI)
  // -------------------------------------------------------------
  _buildRightRail() {
    const rail = document.createElement('aside');
    rail.id = 'aranya-right-rail';
    rail.className = 'aranya-glass';
    rail.style.display = 'none';
    rail.innerHTML = `
      <div class="aranya-rail-header">
        <h3 id="aranya-rail-title"><span>INTELLIGENCE INSPECTOR</span></h3>
        <button id="aranya-rail-close-btn" class="aranya-rail-close" type="button" aria-label="Close panel">✕</button>
      </div>
      <div id="aranya-rail-content" class="aranya-rail-body"></div>
    `;

    document.body.appendChild(rail);
    document
      .getElementById('aranya-rail-close-btn')
      ?.addEventListener('click', () => {
        rail.style.display = 'none';
      });
  }

  inspectItem(type, data) {
    this.selectedType = type;
    this.selectedItem = data;

    const rail = document.getElementById('aranya-right-rail');
    const titleEl = document.getElementById('aranya-rail-title');
    const bodyEl = document.getElementById('aranya-rail-content');
    if (!rail || !bodyEl) return;

    rail.style.display = 'flex';
    bodyEl.innerHTML = '';

    if (type === 'observation') {
      titleEl.innerHTML = `<span>🐾 WILDLIFE INTELLIGENCE DOSSIER</span>`;
      const xai = data.aiThoughtProcess;
      const riskScore = data.conflictRiskIndex || 87;

      // Draw spatial historical trail and AI forward predictive trajectory onto 3D Cesium globe
      this.mapVisualizer.displayTrajectoryAndPrediction(data);

      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-card-top" style="margin-bottom:8px">
            <div>
              <div class="aranya-modal-kicker">TARGET CLASSIFICATION</div>
              <strong style="font-size:18px;color:#f0fdf4">${data.icon || '🐾'} ${data.species}</strong>
              <div style="font-size:12px;font-style:italic;color:var(--aranya-emerald)">${data.scientificName || 'Panthera pardus'}</div>
            </div>
            <div class="aranya-badge ${riskScore >= 80 ? 'aranya-badge-red' : riskScore >= 60 ? 'aranya-badge-amber' : 'aranya-badge-green'}" style="font-size:12px;padding:6px 10px">
              RISK: ${riskScore}/100
            </div>
          </div>

          <!-- Sensor Capture & Location Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">
            <div class="aranya-stat-pill" style="flex-direction:column;align-items:flex-start;padding:8px">
              <span class="aranya-stat-label">DETECTION SENSOR</span>
              <strong style="font-size:12px;color:#f0fdf4">${data.source || 'CAM-017'} (${Math.round((data.confidence || 0.9) * 100)}%)</strong>
            </div>
            <div class="aranya-stat-pill" style="flex-direction:column;align-items:flex-start;padding:8px">
              <span class="aranya-stat-label">TIME OF DETECTION</span>
              <strong style="font-size:12px;color:#38bdf8">${data.timestamp}</strong>
            </div>
            <div class="aranya-stat-pill" style="flex-direction:column;align-items:flex-start;padding:8px">
              <span class="aranya-stat-label">NEAREST INTERFACE</span>
              <strong style="font-size:12px;color:#f59e0b">${data.nearbySettlement || 'Raiwala Fringe (1.4 km)'}</strong>
            </div>
            <div class="aranya-stat-pill" style="flex-direction:column;align-items:flex-start;padding:8px">
              <span class="aranya-stat-label">OBSERVED BEHAVIOR</span>
              <strong style="font-size:12px;color:#f0fdf4">${data.status || 'Crepuscular Ingress'}</strong>
            </div>
          </div>

          <!-- AI Predictive Trajectory & Thought Process (Explainable AI / DSS) -->
          ${
            xai
              ? `
            <div style="margin-top:14px;padding:14px;background:rgba(8, 20, 16, 0.95);border-radius:10px;border:1px solid rgba(52, 211, 153, 0.4);box-shadow:0 4px 16px rgba(0,0,0,0.5)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:16px">🧠</span>
                <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#34d399;text-transform:uppercase">
                  AI PREDICTIVE THOUGHT PROCESS & TRAJECTORY
                </div>
              </div>
              <div style="font-size:12px;font-weight:700;color:#f0fdf4;margin-bottom:6px">
                ${xai.predictionSummary}
              </div>
              <div style="display:flex;gap:8px;margin-bottom:12px">
                <span class="aranya-badge aranya-badge-blue" style="font-size:10px">${xai.confidenceScore}</span>
                <span class="aranya-badge aranya-badge-red" style="font-size:10px">ETA: ${xai.estimatedTimeOfArrival}</span>
              </div>

              <div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:6px;text-transform:uppercase">
                WHY DID AI PREDICT THIS PATH? (EVIDENCE REASONING)
              </div>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${(xai.reasoningSteps || [])
                  .map(
                    (r) => `
                  <div style="background:rgba(255,255,255,0.04);padding:8px 10px;border-radius:6px;border-left:3px solid #34d399">
                    <strong style="font-size:11px;color:#34d399;display:block">${r.factor}</strong>
                    <div style="font-size:11px;color:#cbd5e1;line-height:1.4">${r.detail}</div>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Actions & Decision Support Interventions -->
          <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
            <button id="btn-dispatch-team-from-obs" class="aranya-btn aranya-btn-primary" style="width:100%">
              <span>🛡️ DISPATCH RAPID RESPONSE TEAM ALPHA</span>
            </button>
            <button id="btn-siren-from-obs" class="aranya-btn aranya-btn-secondary" style="width:100%">
              <span>📢 TRIGGER ACOUSTIC VIRTUAL FENCE (120 dB)</span>
            </button>
            <button id="btn-sms-from-obs" class="aranya-btn aranya-btn-secondary" style="width:100%">
              <span>📲 BROADCAST VILLAGE EARLY-WARNING SMS</span>
            </button>
          </div>
        </div>
      `;

      document
        .getElementById('btn-dispatch-team-from-obs')
        ?.addEventListener('click', async () => {
          const teamBase = { lon: 78.238, lat: 30.012 };
          const targetCoords = {
            lon: data.conflictHotspot?.lon || data.lon,
            lat: data.conflictHotspot?.lat || data.lat,
          };
          this.mapVisualizer.animateTeamDispatch(
            teamBase,
            targetCoords,
            'Team Alpha (QRU)',
          );
          this.showToast(
            '🛡️ Patrol Dispatched',
            'Quick Response Team Alpha dispatched to conflict intercept zone!',
            'success',
          );
        });

      document
        .getElementById('btn-siren-from-obs')
        ?.addEventListener('click', () => {
          const targetCoords = {
            lon: data.conflictHotspot?.lon || data.lon,
            lat: data.conflictHotspot?.lat || data.lat,
          };
          this.mapVisualizer.triggerAcousticDeterrentEffect(targetCoords);
          this.showToast(
            '📢 Siren Activated',
            'Acoustic virtual fence deterrent sounding at 120 dB along perimeter!',
            'warning',
          );
        });

      document
        .getElementById('btn-sms-from-obs')
        ?.addEventListener('click', () => {
          this.showToast(
            '📲 SMS Advisory Sent',
            'Automated early-warning broadcast sent to Ward Sarpanch & WhatsApp Network.',
            'info',
          );
        });
    } else if (type === 'risk') {
      titleEl.innerHTML = `<span>⚠️ EXPLAINABLE RISK ENGINE</span>`;
      const cat = getRiskCategory(data.overallScore);
      const scoreColor = cat.color;

      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-risk-score-display">
            <div>
              <div class="aranya-modal-kicker">SECTOR RISK ASSESSMENT</div>
              <strong style="font-size:15px;color:#f0fdf4">${data.name}</strong>
              <div class="aranya-card-sub" style="margin-top:2px">${data.landscape}</div>
            </div>
            <div class="aranya-big-score" style="color:${scoreColor}">${data.overallScore}</div>
          </div>
          <div class="aranya-badge ${data.overallScore >= 81 ? 'aranya-badge-red' : 'aranya-badge-amber'}" style="margin-bottom:14px;display:inline-block">
            ${cat.label.toUpperCase()} · THREAT: ${data.dominantSpecies}
          </div>

          <div style="font-size:12px;font-weight:700;letter-spacing:0.8px;color:#34d399;margin-bottom:8px">
            WHY IS THIS AREA HIGH RISK? (EVIDENCE BREAKDOWN)
          </div>

          ${Object.entries(data.factors || {})
            .map(
              ([key, f]) => `
            <div class="aranya-factor-row">
              <div class="aranya-factor-meta">
                <span style="text-transform:capitalize;font-weight:600">${key.replace(/([A-Z])/g, ' $1')}</span>
                <span style="font-family:var(--aranya-font-mono)">${f.score}/100 (+${f.contribution} pts)</span>
              </div>
              <div class="aranya-factor-bar">
                <div class="aranya-factor-fill" style="width:${f.score}%;background:${f.score > 75 ? '#ef4444' : f.score > 50 ? '#f59e0b' : '#10b981'}"></div>
              </div>
              <div class="aranya-factor-desc">${f.description}</div>
            </div>
          `,
            )
            .join('')}

          <div style="margin-top:16px;padding:12px;background:rgba(9,18,14,0.6);border-radius:8px;border:1px solid rgba(52,211,153,0.2)">
            <div style="font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:4px">RECOMMENDED AI ACTION</div>
            <div style="font-size:12px;line-height:1.5;color:#f0fdf4">${data.recommendedAction}</div>
          </div>

          <div style="margin-top:14px">
            <button id="btn-dispatch-from-risk" class="aranya-btn aranya-btn-primary" style="width:100%">
              <span>🛡️ DISPATCH TEAM ALPHA TO SECTOR</span>
            </button>
          </div>
        </div>
      `;

      document
        .getElementById('btn-dispatch-from-risk')
        ?.addEventListener('click', async () => {
          await defaultFieldTeamProvider.dispatchTeam(
            'TEAM-ALPHA',
            `ALERT-${data.id}`,
            { lat: data.centerLat, lon: data.centerLon },
          );
          this.mapVisualizer.animateTeamDispatch(
            { lon: 78.238, lat: 30.012 },
            { lon: data.centerLon, lat: data.centerLat },
            'Team Alpha (QRU)',
          );
          this.showToast(
            '🛡️ Team Dispatched',
            `Team Alpha dispatched to ${data.name}!`,
            'success',
          );
          this.renderNavTab();
        });
    } else if (type === 'trap') {
      titleEl.innerHTML = `<span>📷 CAMERA TRAP INSPECTOR</span>`;
      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-card-top">
            <strong style="font-size:16px;color:#f0fdf4">${data.name}</strong>
            <span class="aranya-badge ${data.status === 'triggered' ? 'aranya-badge-red' : 'aranya-badge-green'}">${data.status.toUpperCase()}</span>
          </div>
          <div class="aranya-card-sub" style="margin-bottom:12px">Grid ID: ${data.id} · Model: Reconyx HyperFire 2 Dual-Optic</div>

          <div style="width:100%;height:140px;background:#0d1813;border:1px solid var(--aranya-border);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;overflow:hidden;margin-bottom:14px">
            <div style="font-size:42px;margin-bottom:6px">${data.lastDetection?.species === 'Asian Elephant' ? '🐘' : '🐆'}</div>
            <div style="font-size:11px;font-weight:700;color:#34d399">INFRARED THERMAL SENSOR CAPTURE</div>
            <div style="position:absolute;bottom:6px;right:6px;font-size:10px;font-family:var(--aranya-font-mono);background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:4px">
              CONFIDENCE: ${Math.round((data.lastDetection?.confidence || 0.94) * 100)}%
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
            <div style="background:rgba(8,16,12,0.6);padding:8px;border-radius:6px;border:1px solid rgba(52,211,153,0.15)">
              <div class="aranya-stat-label">LAST SIGHTING</div>
              <strong style="font-size:12px;color:#f0fdf4">${data.lastDetection?.species || data.lastTriggerSpecies || 'None'}</strong>
            </div>
            <div style="background:rgba(8,16,12,0.6);padding:8px;border-radius:6px;border:1px solid rgba(52,211,153,0.15)">
              <div class="aranya-stat-label">BATTERY HEALTH</div>
              <strong style="font-size:12px;color:#10b981">${data.battery || 88}% (Solar Linked)</strong>
            </div>
          </div>

          <div class="aranya-card-sub" style="margin-bottom:12px;color:#e2e8f0">
            <strong>Diagnostics:</strong> Uplink nominal · 4G LTE signal -68 dBm · MicroSD 74% free
          </div>

          <button id="btn-inspect-trap-risk" class="aranya-btn aranya-btn-primary" style="width:100%">
            <span>⚠️ VIEW SECTOR CONFLICT RISK (87)</span>
          </button>
        </div>
      `;

      document
        .getElementById('btn-inspect-trap-risk')
        ?.addEventListener('click', async () => {
          const cell = await defaultRiskProvider.getCellById('RISK-008');
          if (cell) this.inspectItem('risk', cell);
        });
    } else if (type === 'alert') {
      titleEl.innerHTML = `<span>🚨 PRIORITY ALERT & VERIFICATION</span>`;
      bodyEl.innerHTML = `
        <div class="aranya-verify-box">
          <div class="aranya-modal-kicker">INCIDENT MANAGEMENT</div>
          <strong style="font-size:16px;color:#f0fdf4">${data.title}</strong>
          <div class="aranya-card-sub" style="margin:4px 0 12px">${data.summary}</div>

          <div style="display:flex;gap:8px;margin-bottom:14px">
            <span class="aranya-badge aranya-badge-red">${data.severity.toUpperCase()}</span>
            <span class="aranya-badge aranya-badge-blue">STAGE: ${data.status}</span>
            <span class="aranya-badge aranya-badge-amber">RISK: ${data.riskScore}/100</span>
          </div>

          <div style="padding:12px;background:rgba(9,18,14,0.7);border-radius:8px;border:1px solid var(--aranya-border);margin-bottom:14px">
            <div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:4px">RECOMMENDED FIELD ACTION</div>
            <div style="font-size:12px;line-height:1.4;color:#f0fdf4">${data.recommendedAction}</div>
          </div>

          <div style="font-size:12px;font-weight:800;color:#34d399;margin-bottom:8px">FIELD VERIFICATION PROGRESS</div>
          <div class="aranya-verify-step">
            <div class="aranya-step-num">1</div>
            <div>
              <strong style="font-size:12px;color:#f0fdf4">Automated Sensor Detection</strong>
              <div style="font-size:10px;color:var(--aranya-text-muted)">Verified via CAM-017 & CAM-018</div>
            </div>
          </div>

          <div class="aranya-verify-step">
            <div class="aranya-step-num" style="background:${data.status !== 'NEW' ? 'var(--aranya-emerald)' : '#6b7280'}">2</div>
            <div>
              <strong style="font-size:12px;color:#f0fdf4">Field Team Dispatch</strong>
              <div style="font-size:10px;color:var(--aranya-text-muted)">${data.assignedTeam ? `Assigned: ${data.assignedTeam}` : 'Awaiting assignment'}</div>
            </div>
          </div>

          <div class="aranya-verify-step">
            <div class="aranya-step-num" style="background:${data.status === 'VERIFIED' ? 'var(--aranya-emerald)' : '#6b7280'}">3</div>
            <div>
              <strong style="font-size:12px;color:#f0fdf4">Ground Verification & Mitigation</strong>
              <div style="font-size:10px;color:var(--aranya-text-muted)">Inspect cattle pens, activate siren deterrent</div>
            </div>
          </div>

          <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
            ${
              data.status === 'NEW'
                ? `
              <button id="btn-dispatch-team-alpha" class="aranya-btn aranya-btn-primary">
                <span>🛡️ DISPATCH TEAM ALPHA (QRU)</span>
              </button>
            `
                : data.status === 'ASSIGNED' ||
                    data.status === 'IN_VERIFICATION'
                  ? `
              <button id="btn-submit-outcome" class="aranya-btn aranya-btn-primary">
                <span>📋 SUBMIT FIELD VERIFICATION OUTCOME</span>
              </button>
            `
                  : `
              <div style="padding:10px;background:rgba(16,185,129,0.2);border:1px solid var(--aranya-emerald);border-radius:6px;text-align:center;font-size:12px;font-weight:700;color:#34d399">
                ✓ VERIFIED & DEFUSED BY GROUND TEAM
              </div>
            `
            }
          </div>
        </div>
      `;

      document
        .getElementById('btn-dispatch-team-alpha')
        ?.addEventListener('click', async () => {
          await defaultFieldTeamProvider.dispatchTeam('TEAM-ALPHA', data.id, {
            lat: data.lat,
            lon: data.lon,
          });
          await defaultAlertProvider.updateAlertStatus(
            data.id,
            'IN_VERIFICATION',
            'TEAM-ALPHA',
          );
          this.mapVisualizer.animateTeamDispatch(
            { lon: 78.238, lat: 30.012 },
            { lon: data.lon, lat: data.lat },
            'Team Alpha (QRU)',
          );
          this.showToast(
            '🛡️ Team Dispatched',
            `Team Alpha dispatched to ${data.title}!`,
            'success',
          );
          this.inspectItem(
            'alert',
            await defaultAlertProvider.getAlertById(data.id),
          );
          this.renderNavTab();
          this._updateCounters();
        });

      document
        .getElementById('btn-submit-outcome')
        ?.addEventListener('click', async () => {
          await defaultFieldTeamProvider.submitVerificationReport(data.id, {
            teamId: 'TEAM-ALPHA',
            outcomeType: 'deterrent_applied',
            findings:
              'Visual confirmation of adult leopard tracks 45m from boma. Sirens sounded.',
            threatStatus: 'RESOLVED_DEFUSED',
          });
          await defaultAlertProvider.updateAlertStatus(
            data.id,
            'VERIFIED',
            'TEAM-ALPHA',
          );
          this.showToast(
            '📋 Report Filed',
            'Field Verification Report filed! Alert resolved and threat defused.',
            'success',
          );
          this.inspectItem(
            'alert',
            await defaultAlertProvider.getAlertById(data.id),
          );
          this.renderNavTab();
          this._updateCounters();
        });
    } else if (type === 'settlement') {
      titleEl.innerHTML = `<span>🏘️ VILLAGE INTERFACE DOSSIER</span>`;
      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-card-top">
            <strong style="font-size:16px;color:#f0fdf4">${data.name}</strong>
            <span class="aranya-badge aranya-badge-amber">DISTANCE: ${data.distanceToForestMeters}m</span>
          </div>
          <div class="aranya-card-sub" style="margin-bottom:12px">Type: ${data.type} · Population: ${data.population?.toLocaleString() || 12400}</div>

          <div style="background:rgba(8,16,12,0.6);padding:10px;border-radius:8px;border:1px solid rgba(52,211,153,0.2);margin-bottom:12px">
            <div class="aranya-stat-label">PRIMARY CONFLICT VULNERABILITY</div>
            <div style="font-size:12px;color:#f0fdf4;margin-top:4px">${data.primaryVulnerability}</div>
          </div>

          <div style="background:rgba(8,16,12,0.6);padding:10px;border-radius:8px;border:1px solid rgba(52,211,153,0.2);margin-bottom:12px">
            <div class="aranya-stat-label">ACTIVE MITIGATION MEASURES</div>
            <div style="font-size:12px;color:#34d399;margin-top:4px">${data.activeMitigation}</div>
          </div>

          <button id="btn-broadcast-to-village" class="aranya-btn aranya-btn-primary" style="width:100%">
            <span>📲 SEND WARD EARLY-WARNING SMS</span>
          </button>
        </div>
      `;

      document
        .getElementById('btn-broadcast-to-village')
        ?.addEventListener('click', () => {
          this.showToast(
            '📲 SMS Advisory Sent',
            `Early-warning broadcast transmitted to ${data.name} Ward Captains.`,
            'info',
          );
        });
    } else if (type === 'corridor') {
      titleEl.innerHTML = `<span>🌲 CORRIDOR HEALTH DOSSIER</span>`;
      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-card-top">
            <strong style="font-size:16px;color:#f0fdf4">${data.name}</strong>
            <span class="aranya-badge aranya-badge-blue">FN: ${data.functionalityScore}/100</span>
          </div>
          <div class="aranya-card-sub" style="margin-bottom:12px">${data.description}</div>

          <div style="background:rgba(8,16,12,0.6);padding:10px;border-radius:8px;border:1px solid rgba(52,211,153,0.2);margin-bottom:12px">
            <div class="aranya-stat-label">CRITICAL BOTTLENECK PINCH-POINTS</div>
            <div style="font-size:12px;color:#f59e0b;margin-top:4px">${data.pinchPoints ? data.pinchPoints.join(' · ') : 'Highway overpass culvert KM-42'}</div>
          </div>

          <div style="background:rgba(8,16,12,0.6);padding:10px;border-radius:8px;border:1px solid rgba(52,211,153,0.2);margin-bottom:12px">
            <div class="aranya-stat-label">KEY CORRIDOR USERS</div>
            <div style="font-size:12px;color:#f0fdf4;margin-top:4px">${(data.keyUsers || ['Asian Elephant', 'Bengal Tiger', 'Indian Leopard']).join(', ')}</div>
          </div>
        </div>
      `;
    } else if (type === 'team') {
      titleEl.innerHTML = `<span>🛡️ FIELD RESPONSE TEAM</span>`;
      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-card-top">
            <strong style="font-size:16px;color:#f0fdf4">${data.name}</strong>
            <span class="aranya-badge ${data.status === 'dispatched' ? 'aranya-badge-red' : 'aranya-badge-green'}">${data.status.toUpperCase()}</span>
          </div>
          <div class="aranya-card-sub" style="margin-bottom:12px">Division: ${data.division} · Base: ${data.baseStation}</div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="background:rgba(8,16,12,0.6);padding:8px;border-radius:6px;border:1px solid rgba(52,211,153,0.15)">
              <div class="aranya-stat-label">PATROL VEHICLE</div>
              <strong style="font-size:12px;color:#f0fdf4">${data.vehicle}</strong>
            </div>
            <div style="background:rgba(8,16,12,0.6);padding:8px;border-radius:6px;border:1px solid rgba(52,211,153,0.15)">
              <div class="aranya-stat-label">EQUIPMENT</div>
              <strong style="font-size:12px;color:#38bdf8">${data.equipment?.length || 4} Tools Active</strong>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'scenario') {
      titleEl.innerHTML = `<span>⚡ SIMULATION INTELLIGENCE DOSSIER</span>`;
      const xai = data.aiThoughtProcess;
      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <div class="aranya-modal-kicker">ACTIVE MULTI-STEP SIMULATION</div>
          <strong style="font-size:18px;color:#f0fdf4">${data.title}</strong>
          <div class="aranya-card-sub" style="margin:4px 0 12px">${data.subtitle}</div>

          <div style="background:rgba(8, 20, 16, 0.95);padding:12px;border-radius:10px;border:1px solid rgba(52, 211, 153, 0.4);margin-bottom:14px">
            <div style="font-size:11px;font-weight:800;color:#34d399;text-transform:uppercase;margin-bottom:4px">
              🧠 AI PREDICTIVE THOUGHT PROCESS
            </div>
            <div style="font-size:12px;font-weight:700;color:#f0fdf4;margin-bottom:8px">
              ${xai?.predictionSummary || 'Ingress trajectory targeting boundary interface'}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${(xai?.reasoningSteps || [])
                .map(
                  (r) => `
                <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:4px;border-left:2px solid #34d399">
                  <strong style="font-size:10px;color:#34d399">${r.factor}:</strong>
                  <span style="font-size:11px;color:#cbd5e1">${r.detail}</span>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            <button id="btn-sim-dispatch" class="aranya-btn aranya-btn-primary">
              <span>🛡️ EXECUTE QRT INTERCEPT DISPATCH</span>
            </button>
            <button id="btn-sim-deterrent" class="aranya-btn aranya-btn-secondary">
              <span>📢 TRIGGER ACOUSTIC DETERRENT SIREN</span>
            </button>
          </div>
        </div>
      `;

      document
        .getElementById('btn-sim-dispatch')
        ?.addEventListener('click', () => {
          const cz = data.conflictZone;
          this.mapVisualizer.animateTeamDispatch(
            { lon: 78.238, lat: 30.012 },
            { lon: cz.centerLon, lat: cz.centerLat },
            'Team Alpha',
          );
          this.showToast(
            '🛡️ Dispatched',
            'Rapid Response Team Alpha in transit to conflict zone.',
            'success',
          );
        });

      document
        .getElementById('btn-sim-deterrent')
        ?.addEventListener('click', () => {
          const cz = data.conflictZone;
          this.mapVisualizer.triggerAcousticDeterrentEffect({
            lon: cz.centerLon,
            lat: cz.centerLat,
          });
          this.showToast(
            '📢 Siren Activated',
            'Acoustic Virtual Fence sounding along perimeter.',
            'warning',
          );
        });
    }
  }

  // -------------------------------------------------------------
  // 4. MODALS (WELCOME & EVENT SIMULATOR)
  // -------------------------------------------------------------
  _buildModals() {
    // 4.1 Welcome Modal
    const welcomeModal = document.createElement('div');
    welcomeModal.id = 'aranya-welcome-modal';
    welcomeModal.className = 'aranya-modal-backdrop';
    welcomeModal.innerHTML = `
      <div class="aranya-modal-card">
        <div class="aranya-modal-kicker">WILDLIFE & HUMAN-CONFLICT INTELLIGENCE</div>
        <h2 class="aranya-modal-title">Welcome to ARANYA</h2>
        <p class="aranya-modal-p">
          A prototype geospatial decision-support platform designed to track wildlife movement patterns,
          monitor ecological corridor fragmentation, and anticipate human-wildlife conflict risk zones in India.
        </p>

        <div class="aranya-entry-choices">
          <button id="entry-uttarakhand" class="aranya-entry-btn primary" type="button">
            <span class="aranya-entry-icon">🏔️</span>
            <div class="aranya-entry-text">
              <strong>ENTER UTTARAKHAND PILOT (RECOMMENDED)</strong>
              <small>Explore Rajaji-Corbett corridors, camera traps, live alerts, and Raiwala conflict interface.</small>
            </div>
          </button>

          <button id="entry-india" class="aranya-entry-btn" type="button">
            <span class="aranya-entry-icon">🇮🇳</span>
            <div class="aranya-entry-text">
              <strong>ENTER INDIA OVERVIEW</strong>
              <small>National wildlife corridor overview and subcontinental protected reserve clusters.</small>
            </div>
          </button>

          <button id="entry-global" class="aranya-entry-btn" type="button">
            <span class="aranya-entry-icon">🌐</span>
            <div class="aranya-entry-text">
              <strong>GLOBAL CONTEXT</strong>
              <small>Explore planetary satellite imagery and high-altitude contextual terrain.</small>
            </div>
          </button>
        </div>

        <div style="margin-top:20px;display:flex;align-items:center;justify-content:space-between">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--aranya-text-muted);cursor:pointer">
            <input type="checkbox" id="chk-dont-show-welcome" /> Do not show again
          </label>
          <button id="btn-close-welcome" class="aranya-btn aranya-btn-secondary" type="button">Enter Platform</button>
        </div>
      </div>
    `;
    document.body.appendChild(welcomeModal);

    // 4.2 Simulator Modal
    const simModal = document.createElement('div');
    simModal.id = 'aranya-simulator-modal';
    simModal.className = 'aranya-modal-backdrop';
    simModal.style.display = 'none';
    simModal.innerHTML = `
      <div class="aranya-modal-card" style="width:720px">
        <div class="aranya-modal-kicker">DECISION SUPPORT SIMULATOR</div>
        <h2 class="aranya-modal-title">Interactive Conflict Scenarios</h2>
        <p class="aranya-modal-p">
          Select an operational scenario to simulate sensor triggers, historical tracks, AI predictive trajectories, and field response workflows live on the 3D globe.
        </p>

        <div class="aranya-scenario-grid">
          ${scenariosData
            .map(
              (s) => `
            <div class="aranya-scenario-card" data-scenario-id="${s.id}">
              <div>
                <h4>${s.title}</h4>
                <div style="font-size:10px;font-weight:700;color:var(--aranya-emerald);margin-bottom:6px">${s.subtitle}</div>
                <p>${s.description}</p>
              </div>
              <button class="aranya-btn aranya-btn-primary" type="button">
                <span>⚡ EXECUTE SCENARIO</span>
              </button>
            </div>
          `,
            )
            .join('')}
        </div>

        <div style="margin-top:20px;text-align:right">
          <button id="btn-close-sim" class="aranya-btn aranya-btn-secondary" type="button">Close Simulator</button>
        </div>
      </div>
    `;
    document.body.appendChild(simModal);

    // Attach modal events
    document
      .getElementById('entry-uttarakhand')
      ?.addEventListener('click', () => {
        this.closeWelcomeModal();
        flyToPreset(this.viewer, 'uttarakhand');
      });
    document.getElementById('entry-india')?.addEventListener('click', () => {
      this.closeWelcomeModal();
      flyToPreset(this.viewer, 'india');
    });
    document.getElementById('entry-global')?.addEventListener('click', () => {
      this.closeWelcomeModal();
      flyToPreset(this.viewer, 'global');
    });
    document
      .getElementById('btn-close-welcome')
      ?.addEventListener('click', () => this.closeWelcomeModal());
    document
      .getElementById('btn-close-sim')
      ?.addEventListener('click', () => this.closeSimulatorModal());

    simModal.querySelectorAll('.aranya-scenario-card').forEach((card) => {
      card.querySelector('button')?.addEventListener('click', () => {
        const scenarioId = card.dataset.scenarioId;
        this.runScenario(scenarioId);
      });
    });
  }

  showWelcomeModal() {
    const el = document.getElementById('aranya-welcome-modal');
    if (el) el.style.display = 'flex';
  }

  closeWelcomeModal() {
    const el = document.getElementById('aranya-welcome-modal');
    if (el) el.style.display = 'none';
    const chk = document.getElementById('chk-dont-show-welcome');
    if (chk?.checked) {
      localStorage.setItem('aranya:welcomed', 'true');
    }
  }

  showSimulatorModal() {
    const el = document.getElementById('aranya-simulator-modal');
    if (el) el.style.display = 'flex';
  }

  closeSimulatorModal() {
    const el = document.getElementById('aranya-simulator-modal');
    if (el) el.style.display = 'none';
  }

  // -------------------------------------------------------------
  // 5. RUN SCENARIO WITH LIVE MAP VISUALIZATION & AI REASONING
  // -------------------------------------------------------------
  async runScenario(scenarioId) {
    const scenario = scenariosData.find((s) => s.id === scenarioId);
    if (!scenario) return;

    this.closeSimulatorModal();

    // 1. Move camera smoothly to scenario location on the 3D globe
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        scenario.targetLon,
        scenario.targetLat,
        scenario.cameraHeight,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(25),
        pitch: Cesium.Math.toRadians(scenario.cameraPitch),
        roll: 0.0,
      },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });

    // 2. Render Historical Path, AI Forward Trajectory & Conflict Hotspot on Map
    this.mapVisualizer.visualizeSimulation(scenario);

    // 3. Open Intelligence Inspector with complete AI Thought Process & Actions
    this.inspectItem('scenario', scenario);
    this.showToast(
      '⚡ Scenario Initiated',
      `${scenario.title} running with AI trajectory prediction.`,
      'info',
    );

    // 4. Execute scenario steps sequentially
    for (const step of scenario.steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delayMs));

      if (step.action === 'TRIGGER_CAMERA_TRAP') {
        defaultWildlifeProvider.addSimulatedObservation({
          species: scenario.species,
          trapId: step.trapId,
          confidence: step.confidence,
          lat: scenario.targetLat,
          lon: scenario.targetLon,
        });
        this.showToast('📷 Camera Trap Triggered', step.message, 'warning');
      } else if (step.action === 'UPDATE_RISK_CELL') {
        defaultRiskProvider.updateCellRisk(step.cellId, step.score);
        this.showToast('⚠️ Risk Grid Escalation', step.message, 'error');
      } else if (step.action === 'GENERATE_ALERT') {
        const alert = await defaultAlertProvider.getAlertById(step.alertId);
        if (alert) {
          this.showToast('🚨 Priority Alert Generated', alert.title, 'error');
        }
      }
    }

    await this._initMapLayers();
    this._updateCounters();
    this.renderNavTab();
  }

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  _buildToastContainer() {
    const c = document.createElement('div');
    c.id = 'aranya-toast-container';
    c.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(c);
  }

  showToast(title, message, type = 'info') {
    const c = document.getElementById('aranya-toast-container');
    if (!c) return;

    const toast = document.createElement('div');
    const borderCol =
      type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';
    toast.style.cssText = `background:rgba(6,18,12,0.92);border:1px solid ${borderCol};box-shadow:0 8px 30px rgba(0,0,0,0.6);backdrop-filter:blur(10px);color:#f0fdf4;padding:12px 18px;border-radius:10px;font-size:12px;display:flex;flex-direction:column;gap:2px;pointer-events:auto;min-width:320px;max-width:90vw;animation:aranyaFadeIn 0.3s ease`;
    toast.innerHTML = `
      <div style="font-weight:800;color:${borderCol};font-size:11px;letter-spacing:0.5px">${title}</div>
      <div style="color:#e2e8f0;font-size:12px;line-height:1.4">${message}</div>
    `;
    c.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  _attachEntitySelectionListener() {
    window.addEventListener('gev:entity-selected', (e) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.layerId === 'aranya-risk') {
        this.inspectItem('risk', detail.data);
      } else if (detail.type === 'camera_trap') {
        this.inspectItem('trap', detail.data);
      } else if (detail.type === 'observation') {
        this.inspectItem('observation', detail.data);
      } else if (detail.type === 'settlement') {
        this.inspectItem('settlement', detail.data);
      } else if (detail.type === 'field_team') {
        this.inspectItem('team', detail.data);
      }
    });
  }

  _subscribeProviders() {
    this.unsubscribers.push(
      defaultWildlifeProvider.subscribe(() => {
        this._updateCounters();
        this._initMapLayers();
      }),
      defaultRiskProvider.subscribe(() => {
        this._updateCounters();
        this._initMapLayers();
      }),
      defaultAlertProvider.subscribe(() => this._updateCounters()),
      defaultFieldTeamProvider.subscribe(() => this._updateCounters()),
    );
  }

  async _updateCounters() {
    const obs = await defaultWildlifeProvider.getObservations();
    const cells = await defaultRiskProvider.getRiskCells();
    const alerts = await defaultAlertProvider.getAlerts({ status: 'NEW' });

    const maxScore = Math.max(...cells.map((c) => c.overallScore), 0);

    const sEl = document.getElementById('stat-sightings-val');
    if (sEl) sEl.textContent = `${obs.length}`;

    const rEl = document.getElementById('stat-risk-val');
    if (rEl) {
      rEl.textContent = `${maxScore} CRITICAL`;
    }

    const aEl = document.getElementById('stat-alerts-val');
    if (aEl) aEl.textContent = `${alerts.length} ACTIVE`;
  }

  flyToLocation(lon, lat, height = 4000) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
      duration: 2.0,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }
}
