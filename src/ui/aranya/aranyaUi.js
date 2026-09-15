// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Master UI Controller & Interaction Engine
import * as Cesium from 'cesium';
import { defaultWildlifeProvider } from '../../data/aranya/wildlifeProvider.js';
import { defaultMovementProvider } from '../../data/aranya/movementProvider.js';
import { defaultConflictProvider } from '../../data/aranya/conflictProvider.js';
import { defaultRiskProvider, getRiskCategory } from '../../data/aranya/riskProvider.js';
import { defaultHabitatProvider } from '../../data/aranya/habitatProvider.js';
import { defaultHumanInterfaceProvider } from '../../data/aranya/humanInterfaceProvider.js';
import { defaultFieldTeamProvider } from '../../data/aranya/fieldTeamProvider.js';
import { defaultAlertProvider } from '../../data/aranya/alertProvider.js';
import scenariosData from '../../data/aranya/scenarios.json';
import { CAMERA_PRESETS, flyToPreset } from '../../camera.js';

export class AranyaUi {
  constructor({ viewer, dataManager, styleManager }) {
    this.viewer = viewer;
    this.dataManager = dataManager;
    this.styleManager = styleManager;
    this.activeTab = 'wildlife';
    this.selectedItem = null;
    this.selectedType = null; // 'risk', 'trap', 'observation', 'alert', 'settlement', 'team'
    this.unsubscribers = [];
  }

  mount() {
    this._injectStyles();
    this._buildTopHud();
    this._buildLeftNav();
    this._buildRightRail();
    this._buildModals();
    this._attachEntitySelectionListener();
    this._subscribeProviders();
    this._updateCounters();

    // Check if user has dismissed welcome modal previously
    const hasSeenWelcome = localStorage.getItem('aranya:welcomed');
    if (!hasSeenWelcome) {
      this.showWelcomeModal();
    }
  }

  destroy() {
    for (const unsub of this.unsubscribers) {
      try { unsub(); } catch (e) {}
    }
    document.getElementById('aranya-top-hud')?.remove();
    document.getElementById('aranya-left-nav')?.remove();
    document.getElementById('aranya-right-rail')?.remove();
    document.getElementById('aranya-welcome-modal')?.remove();
    document.getElementById('aranya-simulator-modal')?.remove();
  }

  _injectStyles() {
    if (document.getElementById('aranya-custom-css')) return;
    const link = document.createElement('link');
    link.id = 'aranya-custom-css';
    link.rel = 'stylesheet';
    link.href = '/src/ui/aranya/aranya.css';
    document.head.appendChild(link);
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
          <span id="stat-sightings-val" class="aranya-stat-val text-green">14</span>
        </div>
        <div class="aranya-stat-pill">
          <span class="aranya-stat-label">MAX CONFLICT RISK</span>
          <span id="stat-risk-val" class="aranya-stat-val critical">87 CRITICAL</span>
        </div>
        <div class="aranya-stat-pill">
          <span class="aranya-stat-label">PRIORITY ALERTS</span>
          <span id="stat-alerts-val" class="aranya-stat-val warning">3 ACTIVE</span>
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
    hud.querySelectorAll('.aranya-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        hud.querySelectorAll('.aranya-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.dataset.preset;
        flyToPreset(this.viewer, preset);
      });
    });

    // Action handlers
    document.getElementById('btn-open-sim')?.addEventListener('click', () => this.showSimulatorModal());
    document.getElementById('btn-open-welcome')?.addEventListener('click', () => this.showWelcomeModal());
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
    nav.querySelectorAll('.aranya-tab-item').forEach(btn => {
      btn.addEventListener('click', () => {
        nav.querySelectorAll('.aranya-tab-item').forEach(b => b.classList.remove('active'));
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
      headingTraps.textContent = `CAMERA TRAPS (${traps.length})`;
      container.appendChild(headingTraps);

      for (const trap of traps) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">📷 ${trap.id}</span>
            <span class="aranya-badge ${trap.status === 'triggered' ? 'aranya-badge-red' : 'aranya-badge-green'}">${trap.status.toUpperCase()}</span>
          </div>
          <div class="aranya-card-sub">${trap.name}</div>
          <div class="aranya-card-sub" style="margin-top:4px;color:#a7f3d0">Last: ${trap.lastTriggerSpecies || 'Routine stand-by'}</div>
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
      headingObs.style.marginTop = '12px';
      headingObs.textContent = `RECENT OBSERVATIONS (${obs.length})`;
      container.appendChild(headingObs);

      for (const item of obs) {
        const card = document.createElement('div');
        card.className = 'aranya-list-card';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">${item.icon || '🐾'} ${item.species}</span>
            <span class="aranya-badge aranya-badge-amber">${item.detectionMethod}</span>
          </div>
          <div class="aranya-card-sub">${item.locationName}</div>
          <div class="aranya-card-sub" style="margin-top:4px;color:#cbd5e1">${item.behaviorNotes}</div>
        `;
        card.addEventListener('click', () => {
          this.flyToLocation(item.lon, item.lat, 4000);
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
        const badgeClass = cell.overallScore >= 81 ? 'aranya-badge-red' :
                           cell.overallScore >= 61 ? 'aranya-badge-amber' :
                           cell.overallScore >= 31 ? 'aranya-badge-blue' : 'aranya-badge-green';
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
        const badgeClass = alert.severity === 'critical' ? 'aranya-badge-red' :
                           alert.severity === 'high' ? 'aranya-badge-amber' : 'aranya-badge-blue';
        card.innerHTML = `
          <div class="aranya-card-top">
            <span class="aranya-card-title">🚨 ${alert.id}</span>
            <span class="aranya-badge ${badgeClass}">${alert.status}</span>
          </div>
          <div class="aranya-card-sub" style="font-weight:700;color:#f0fdf4">${alert.title}</div>
          <div class="aranya-card-sub" style="margin-top:4px;">${alert.summary}</div>
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
          const mid = corr.coordinates[Math.floor(corr.coordinates.length / 2)];
          this.flyToLocation(mid[0], mid[1], 8000);
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
  // 3. RIGHT CONTEXT INTELLIGENCE RAIL
  // -------------------------------------------------------------
  _buildRightRail() {
    const rail = document.createElement('aside');
    rail.id = 'aranya-right-rail';
    rail.className = 'aranya-glass';
    rail.style.display = 'none';
    rail.innerHTML = `
      <div class="aranya-rail-header">
        <h3 id="aranya-rail-title"><span>AREA INTELLIGENCE</span></h3>
        <button id="aranya-rail-close-btn" class="aranya-rail-close" type="button" aria-label="Close panel">✕</button>
      </div>
      <div id="aranya-rail-content" class="aranya-rail-body"></div>
    `;

    document.body.appendChild(rail);
    document.getElementById('aranya-rail-close-btn')?.addEventListener('click', () => {
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

    if (type === 'risk') {
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

          ${Object.entries(data.factors || {}).map(([key, f]) => `
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
          `).join('')}

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

      document.getElementById('btn-dispatch-from-risk')?.addEventListener('click', async () => {
        await defaultFieldTeamProvider.dispatchTeam('TEAM-ALPHA', `ALERT-${data.id}`, { lat: data.centerLat, lon: data.centerLon });
        alert(`Team Alpha (QRU) dispatched to ${data.name}!`);
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

          <div style="width:100%;height:180px;background:#0d1813;border:1px solid var(--aranya-border);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;overflow:hidden;margin-bottom:14px">
            <div style="font-size:48px;margin-bottom:8px">🐆</div>
            <div style="font-size:11px;font-weight:700;color:#34d399">INFRARED SENSOR CAPTURE · 20:42 IST</div>
            <div style="position:absolute;bottom:8px;right:8px;font-size:10px;font-family:var(--aranya-font-mono);background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:4px">
              CONFIDENCE: ${(data.confidence * 100).toFixed(0)}%
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
            <div style="background:rgba(8,16,12,0.6);padding:8px;border-radius:6px;border:1px solid rgba(52,211,153,0.15)">
              <div class="aranya-stat-label">LAST SIGHTING</div>
              <strong style="font-size:12px;color:#f0fdf4">${data.lastTriggerSpecies || 'None'}</strong>
            </div>
            <div style="background:rgba(8,16,12,0.6);padding:8px;border-radius:6px;border:1px solid rgba(52,211,153,0.15)">
              <div class="aranya-stat-label">NEAREST VILLAGE</div>
              <strong style="font-size:12px;color:#f59e0b">${data.nearestVillage || 'Raiwala (180m)'}</strong>
            </div>
          </div>

          <div class="aranya-card-sub" style="margin-bottom:12px;color:#e2e8f0">
            <strong>Hardware Diagnostics:</strong> Battery 94% · Cellular Uplink nominal · Solar charge active · Storage 68%
          </div>

          <button id="btn-inspect-trap-risk" class="aranya-btn aranya-btn-primary" style="width:100%">
            <span>⚠️ VIEW SECTOR CONFLICT RISK (87)</span>
          </button>
        </div>
      `;

      document.getElementById('btn-inspect-trap-risk')?.addEventListener('click', async () => {
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
              <strong style="font-size:12px;color:#f0fdf4">Automated Detection & Escalation</strong>
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
            ${data.status === 'NEW' ? `
              <button id="btn-dispatch-team-alpha" class="aranya-btn aranya-btn-primary">
                <span>🛡️ DISPATCH TEAM ALPHA (QRU)</span>
              </button>
            ` : data.status === 'ASSIGNED' || data.status === 'IN_VERIFICATION' ? `
              <button id="btn-submit-outcome" class="aranya-btn aranya-btn-primary">
                <span>📋 SUBMIT FIELD VERIFICATION OUTCOME</span>
              </button>
            ` : `
              <div style="padding:10px;background:rgba(16,185,129,0.2);border:1px solid var(--aranya-emerald);border-radius:6px;text-align:center;font-size:12px;font-weight:700;color:#34d399">
                ✓ VERIFIED & DEFUSED BY GROUND TEAM
              </div>
            `}
          </div>
        </div>
      `;

      document.getElementById('btn-dispatch-team-alpha')?.addEventListener('click', async () => {
        await defaultFieldTeamProvider.dispatchTeam('TEAM-ALPHA', data.id, { lat: data.lat, lon: data.lon });
        await defaultAlertProvider.updateAlertStatus(data.id, 'IN_VERIFICATION', 'TEAM-ALPHA');
        alert(`Team Alpha dispatched to ${data.title}!`);
        this.inspectItem('alert', await defaultAlertProvider.getAlertById(data.id));
        this.renderNavTab();
        this._updateCounters();
      });

      document.getElementById('btn-submit-outcome')?.addEventListener('click', async () => {
        await defaultFieldTeamProvider.submitVerificationReport(data.id, {
          teamId: 'TEAM-ALPHA',
          outcomeType: 'deterrent_applied',
          findings: 'Visual confirmation of adult leopard tracks 45m from boma. Sirens sounded.',
          threatStatus: 'RESOLVED_DEFUSED'
        });
        await defaultAlertProvider.updateAlertStatus(data.id, 'VERIFIED', 'TEAM-ALPHA');
        alert('Field Verification Report filed! Alert resolved and threat defused.');
        this.inspectItem('alert', await defaultAlertProvider.getAlertById(data.id));
        this.renderNavTab();
        this._updateCounters();
      });
    } else {
      // Generic item inspection
      titleEl.innerHTML = `<span>INTELLIGENCE INSPECTOR</span>`;
      bodyEl.innerHTML = `
        <div class="aranya-risk-engine-card">
          <strong style="font-size:16px;color:#f0fdf4">${data.name || data.title || 'Selected Target'}</strong>
          <pre style="margin-top:12px;font-size:11px;font-family:var(--aranya-font-mono);color:#cbd5e1;overflow-x:auto;white-space:pre-wrap">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
    }
  }

  // -------------------------------------------------------------
  // 4. MODALS (WELCOME & EVENT SIMULATOR)
  // -------------------------------------------------------------
  _buildModals() {
    // Welcome Modal
    const welcomeModal = document.createElement('div');
    welcomeModal.id = 'aranya-welcome-modal';
    welcomeModal.className = 'aranya-modal-backdrop';
    welcomeModal.style.display = 'none';
    welcomeModal.innerHTML = `
      <div class="aranya-modal-card">
        <div class="aranya-modal-kicker">PROTOTYPE GEOSPATIAL INTELLIGENCE</div>
        <h2 class="aranya-modal-title">ARANYA — Wildlife & Human-Conflict Intelligence Platform</h2>
        <p class="aranya-modal-p">
          A specialized decision-support prototype for monitoring wildlife movement, corridor fragmentation, and human-wildlife conflict zones in India, with <strong>Uttarakhand (Rajaji & Corbett landscapes)</strong> as the primary pilot geography.
        </p>

        <div class="aranya-entry-choices">
          <button id="entry-uttarakhand" class="aranya-entry-btn primary" type="button">
            <span class="aranya-entry-icon">🏔️</span>
            <div class="aranya-entry-text">
              <strong>ENTER UTTARAKHAND PILOT (RECOMMENDED)</strong>
              <small>Explore Rajaji-Corbett corridors, Raiwala leopard conflict interfaces, and real-time camera traps</small>
            </div>
          </button>
          <button id="entry-india" class="aranya-entry-btn" type="button">
            <span class="aranya-entry-icon">🇮🇳</span>
            <div class="aranya-entry-text">
              <strong>ENTER INDIA OVERVIEW</strong>
              <small>Subcontinent-scale wildlife corridors, tiger reserves, and protected biosphere network</small>
            </div>
          </button>
          <button id="entry-global" class="aranya-entry-btn" type="button">
            <span class="aranya-entry-icon">🌐</span>
            <div class="aranya-entry-text">
              <strong>GLOBAL CONTEXT</strong>
              <small>Planetary vegetation health (NDVI) and biosphere comparisons</small>
            </div>
          </button>
        </div>

        <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--aranya-text-muted)">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input id="chk-dont-show-welcome" type="checkbox" />
            <span>Don't show on startup</span>
          </label>
          <button id="btn-close-welcome" style="background:transparent;border:none;color:#34d399;font-weight:700;cursor:pointer">CLOSE</button>
        </div>
      </div>
    `;
    document.body.appendChild(welcomeModal);

    // Simulator Modal
    const simModal = document.createElement('div');
    simModal.id = 'aranya-simulator-modal';
    simModal.className = 'aranya-modal-backdrop';
    simModal.style.display = 'none';
    simModal.innerHTML = `
      <div class="aranya-modal-card" style="width:720px">
        <div class="aranya-modal-kicker">SCENARIO DEMONSTRATION ENGINE</div>
        <h2 class="aranya-modal-title">Live Event Simulator</h2>
        <p class="aranya-modal-p">
          Select a realistic operational scenario to simulate sensor triggers, real-time risk escalation, alert broadcasts, and ground team verification.
        </p>

        <div class="aranya-scenario-grid">
          ${scenariosData.map(s => `
            <div class="aranya-scenario-card" data-scenario-id="${s.id}">
              <div>
                <h4>${s.title}</h4>
                <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-bottom:6px">${s.species}</div>
                <p>${s.description}</p>
              </div>
              <button class="aranya-btn aranya-btn-primary" type="button" style="margin-top:10px">
                <span>▶ RUN SCENARIO</span>
              </button>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:20px;text-align:right">
          <button id="btn-close-sim" class="aranya-btn aranya-btn-secondary" style="display:inline-flex;width:auto;padding:8px 18px">CLOSE</button>
        </div>
      </div>
    `;
    document.body.appendChild(simModal);

    // Attach modal events
    document.getElementById('entry-uttarakhand')?.addEventListener('click', () => {
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
    document.getElementById('btn-close-welcome')?.addEventListener('click', () => this.closeWelcomeModal());
    document.getElementById('btn-close-sim')?.addEventListener('click', () => this.closeSimulatorModal());

    simModal.querySelectorAll('.aranya-scenario-card').forEach(card => {
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

  async runScenario(scenarioId) {
    const scenario = scenariosData.find(s => s.id === scenarioId);
    if (!scenario) return;

    this.closeSimulatorModal();

    // 1. Move camera smoothly to scenario location
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(scenario.targetLon, scenario.targetLat, scenario.cameraHeight),
      orientation: {
        heading: Cesium.Math.toRadians(25),
        pitch: Cesium.Math.toRadians(scenario.cameraPitch),
        roll: 0.0,
      },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });

    // 2. Execute scenario steps sequentially
    for (const step of scenario.steps) {
      await new Promise(resolve => setTimeout(resolve, step.delayMs));

      if (step.action === 'TRIGGER_CAMERA_TRAP') {
        defaultWildlifeProvider.addSimulatedObservation({
          species: scenario.species,
          trapId: step.trapId,
          confidence: step.confidence,
          lat: scenario.targetLat,
          lon: scenario.targetLon,
        });
      } else if (step.action === 'UPDATE_RISK_CELL') {
        defaultRiskProvider.updateCellRisk(step.cellId, step.score);
      } else if (step.action === 'GENERATE_ALERT') {
        const alert = await defaultAlertProvider.getAlertById(step.alertId);
        if (alert) {
          this.inspectItem('alert', alert);
        }
      }
    }

    this._updateCounters();
    this.renderNavTab();
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
      defaultWildlifeProvider.subscribe(() => this._updateCounters()),
      defaultRiskProvider.subscribe(() => this._updateCounters()),
      defaultAlertProvider.subscribe(() => this._updateCounters()),
      defaultFieldTeamProvider.subscribe(() => this._updateCounters())
    );
  }

  async _updateCounters() {
    const obs = await defaultWildlifeProvider.getObservations();
    const cells = await defaultRiskProvider.getRiskCells();
    const alerts = await defaultAlertProvider.getAlerts({ status: 'NEW' });

    const maxScore = Math.max(...cells.map(c => c.overallScore), 0);

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
