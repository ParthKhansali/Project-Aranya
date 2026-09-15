import * as Cesium from 'cesium';

/**
 * AI Forest Health and Wildfire Intelligence Dashboard.
 * Monitors real-time NASA FIRMS thermal anomaly satellite feeds, calculates
 * threat severity, displays priority alerts, and dispatches field incident logs.
 */
export class ConservationAlertsDashboard {
  constructor({ viewer, styleManager, dataManager }) {
    this.viewer = viewer;
    this.styleManager = styleManager;
    this.dataManager = dataManager;
    this.container = null;
    this.fires = [];
    this.highestFire = null;
    this.intervalId = null;
    this._currentReserveIndex = 0;
    this._targetEntity = null;
    this._reserveEntity = null;

    this.reserves = [
      { name: 'Amazon Biosphere & Jaú Reserve', lat: -2.3, lon: -62.6, height: 450000 },
      { name: 'Congo Basin & Salonga Rainforest', lat: -2.4, lon: 21.6, height: 500000 },
      { name: 'California Redwood & Sequoia Forests', lat: 38.5, lon: -121.0, height: 400000 },
      { name: 'Sundarbans Mangrove World Heritage', lat: 21.9, lon: 89.3, height: 350000 },
      { name: 'Heart of Borneo Tropical Reserve', lat: 1.1, lon: 116.0, height: 450000 },
      { name: 'Australian Blue Mountains Eucalypt Forest', lat: -33.8, lon: 150.4, height: 300000 },
    ];
  }

  mount(parent = document.body) {
    if (this.container) return;

    this.container = document.createElement('section');
    this.container.id = 'conservation-dashboard';
    this.container.className = 'conservation-dashboard-panel';
    this.container.setAttribute('aria-label', 'Forest Health & Wildfire Intelligence Console');

    this.container.innerHTML = `
      <div class="cons-header">
        <div class="cons-badge">
          <span class="cons-pulse"></span>
          <span>SATELLITE INTEL · ACTIVE</span>
        </div>
        <h2 class="cons-title">FOREST HEALTH & WILDFIRE COMMAND</h2>
      </div>

      <div class="cons-metrics-grid">
        <div class="cons-metric-card">
          <span class="cons-metric-label">ACTIVE WILDFIRES</span>
          <strong id="cons-fire-count" class="cons-metric-value text-red">--</strong>
          <small class="cons-metric-sub">NASA VIIRS 24h trailing</small>
        </div>
        <div class="cons-metric-card">
          <span class="cons-metric-label">PEAK RADIATIVE POWER</span>
          <strong id="cons-max-frp" class="cons-metric-value text-orange">-- MW</strong>
          <small class="cons-metric-sub">Thermal intensity</small>
        </div>
        <div class="cons-metric-card">
          <span class="cons-metric-label">THREAT STATUS</span>
          <strong id="cons-threat-level" class="cons-metric-value text-green">EVALUATING</strong>
          <small class="cons-metric-sub">Forest canopy exposure</small>
        </div>
      </div>

      <div class="cons-actions">
        <button id="cons-fly-worst-btn" class="cons-btn cons-btn-primary" type="button" title="Fly camera to the highest-intensity fire">
          <span class="material-symbols-outlined">local_fire_department</span>
          <span>LOCATE WORST WILDFIRE</span>
        </button>
        <button id="cons-cycle-reserves-btn" class="cons-btn" type="button" title="Cycle through critical protected forest reserves">
          <span class="material-symbols-outlined">forest</span>
          <span>SCAN PROTECTED FORESTS</span>
        </button>
        <button id="cons-flir-toggle-btn" class="cons-btn cons-btn-thermal" type="button" title="Switch to FLIR Thermal Sensor View">
          <span class="material-symbols-outlined">thermostat</span>
          <span>FLIR THERMAL OPTICS</span>
        </button>
        <button id="cons-export-report-btn" class="cons-btn" type="button" title="Export incident data for field ranger verification">
          <span class="material-symbols-outlined">download</span>
          <span>EXPORT RANGER REPORT</span>
        </button>
      </div>

      <div id="cons-focus-info" class="cons-focus-banner" hidden>
        <div class="cons-focus-indicator">TARGET ACQUIRED</div>
        <div id="cons-focus-text" class="cons-focus-detail">--</div>
      </div>
    `;

    parent.appendChild(this.container);
    this._attachEvents();
    this.refresh();
    this.intervalId = setInterval(() => this.refresh(), 30000);

    // Auto-enable both wildfire and protected forest layers
    if (this.dataManager) {
      this.dataManager.setEnabled('local-firms', true, { origin: 'user' }).catch(() => {});
      this.dataManager.setEnabled('local-forests', true, { origin: 'user' }).catch(() => {});
    }
  }

  _attachEvents() {
    const flyBtn = this.container.querySelector('#cons-fly-worst-btn');
    const reservesBtn = this.container.querySelector('#cons-cycle-reserves-btn');
    const flirBtn = this.container.querySelector('#cons-flir-toggle-btn');
    const exportBtn = this.container.querySelector('#cons-export-report-btn');

    flyBtn?.addEventListener('click', () => this.flyToWorstFire());
    reservesBtn?.addEventListener('click', () => this.cycleNextReserve());
    flirBtn?.addEventListener('click', () => this.toggleThermalOptics());
    exportBtn?.addEventListener('click', () => this.exportIncidentReport());
  }

  async refresh() {
    try {
      const res = await fetch('/api/firms');
      if (!res.ok) return;
      const data = await res.json();
      this.fires = Array.isArray(data?.fires) ? data.fires : [];
      this._updateDisplay();
    } catch (err) {
      console.warn('[conservation-dashboard] refresh failed:', err);
    }
  }

  _updateDisplay() {
    const countEl = this.container?.querySelector('#cons-fire-count');
    const frpEl = this.container?.querySelector('#cons-max-frp');
    const threatEl = this.container?.querySelector('#cons-threat-level');

    if (!countEl) return;

    countEl.textContent = this.fires.length.toLocaleString();

    let maxFrp = 0;
    let worst = null;

    for (const fire of this.fires) {
      const frp = Number(fire.frp || 0);
      if (frp > maxFrp) {
        maxFrp = frp;
        worst = fire;
      }
    }

    this.highestFire = worst;

    if (frpEl) {
      frpEl.textContent = maxFrp > 0 ? `${maxFrp.toFixed(1)} MW` : '0 MW';
    }

    if (threatEl) {
      if (maxFrp > 250 || this.fires.length > 5000) {
        threatEl.textContent = 'CRITICAL';
        threatEl.className = 'cons-metric-value text-red';
      } else if (maxFrp > 80 || this.fires.length > 1000) {
        threatEl.textContent = 'HIGH';
        threatEl.className = 'cons-metric-value text-orange';
      } else if (this.fires.length > 0) {
        threatEl.textContent = 'ELEVATED';
        threatEl.className = 'cons-metric-value text-yellow';
      } else {
        threatEl.textContent = 'NOMINAL';
        threatEl.className = 'cons-metric-value text-green';
      }
    }
  }

  async flyToWorstFire() {
    if (!this.highestFire && this.fires.length > 0) {
      this.highestFire = this.fires.reduce((prev, curr) => (Number(curr.frp || 0) > Number(prev.frp || 0) ? curr : prev), this.fires[0]);
    }

    if (!this.highestFire || !this.viewer) {
      alert('Scanning satellite telemetry for high-intensity wildfire signatures...');
      return;
    }

    // Ensure FIRMS active fires layer is enabled in the manager
    if (this.dataManager) {
      try {
        await this.dataManager.setEnabled('local-firms', true, { origin: 'user' });
      } catch (e) {
        console.warn('[conservation] Error enabling local-firms:', e);
      }
    }

    const lat = Number(this.highestFire.lat || this.highestFire.latitude);
    const lon = Number(this.highestFire.lon || this.highestFire.longitude);
    const frp = Number(this.highestFire.frp || 0).toFixed(1);
    const sat = this.highestFire.satellite || this.highestFire.sensor || 'VIIRS';

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      // Clean up previous target entity
      if (this._targetEntity && this.viewer.entities.contains(this._targetEntity)) {
        this.viewer.entities.remove(this._targetEntity);
      }

      // Add high-visibility hotspot target marker entity
      this._targetEntity = this.viewer.entities.add({
        name: `🔥 Active Wildfire Hotspot [${frp} MW]`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 20),
        point: {
          pixelSize: 22,
          color: Cesium.Color.fromCssColorString('#ff2200'),
          outlineColor: Cesium.Color.fromCssColorString('#ffe600'),
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        ellipse: {
          semiMajorAxis: 3500,
          semiMinorAxis: 3500,
          material: Cesium.Color.RED.withAlpha(0.32),
          outline: true,
          outlineColor: Cesium.Color.YELLOW.withAlpha(0.85),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `🔥 WILDFIRE THERMAL ANOMALY\nPeak FRP: ${frp} MW | Sensor: ${sat}\nLat: ${lat.toFixed(4)}° Lon: ${lon.toFixed(4)}°`,
          font: 'bold 14px "Inter", monospace, sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          showBackground: true,
          backgroundColor: new Cesium.Color(0.85, 0.05, 0.05, 0.88),
          backgroundPadding: new Cesium.Cartesian2(10, 6),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -28),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: `
          <div style="font-family: sans-serif; padding: 12px; color: #f3f4f6; background: #111827; border-radius: 8px;">
            <h3 style="color: #ef4444; margin-top: 0;">🔥 High-Intensity Wildfire Hotspot</h3>
            <p><strong>Radiative Power:</strong> ${frp} MW</p>
            <p><strong>Satellite Instrument:</strong> ${sat} (NASA FIRMS)</p>
            <p><strong>Geo Coordinates:</strong> ${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E</p>
            <p style="color: #f59e0b; margin-bottom: 0;"><strong>Threat Priority:</strong> Level 1 Urgent — Dispatch Field Ranger Verification</p>
          </div>
        `,
      });

      // Fly to the fire hotspot with an angled 3D camera view (pitch -45 deg)
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat - 0.28, 42000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
        duration: 2.2,
      });

      // Select the target entity to display info bubble and selection reticle
      this.viewer.selectedEntity = this._targetEntity;

      const focusBanner = this.container?.querySelector('#cons-focus-info');
      const focusText = this.container?.querySelector('#cons-focus-text');
      if (focusBanner && focusText) {
        focusBanner.hidden = false;
        focusText.textContent = `Wildfire Hotspot @ ${lat.toFixed(4)}°, ${lon.toFixed(4)}° | FRP: ${frp} MW | Sensor: ${sat}`;
      }
    }
  }

  async cycleNextReserve() {
    if (!this.viewer || !this.reserves.length) return;
    const reserve = this.reserves[this._currentReserveIndex % this.reserves.length];
    this._currentReserveIndex++;

    // Ensure protected forests layer is active
    if (this.dataManager) {
      try {
        await this.dataManager.setEnabled('local-forests', true, { origin: 'user' });
      } catch (e) {
        console.warn('[conservation] Error enabling local-forests:', e);
      }
    }

    // Clean up previous reserve entity
    if (this._reserveEntity && this.viewer.entities.contains(this._reserveEntity)) {
      this.viewer.entities.remove(this._reserveEntity);
    }

    // Add highlighted reserve marker
    this._reserveEntity = this.viewer.entities.add({
      name: `Protected Reserve: ${reserve.name}`,
      position: Cesium.Cartesian3.fromDegrees(reserve.lon, reserve.lat, 20),
      point: {
        pixelSize: 20,
        color: Cesium.Color.fromCssColorString('#10b981'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      ellipse: {
        semiMajorAxis: 22000,
        semiMinorAxis: 22000,
        material: Cesium.Color.fromCssColorString('#10b981').withAlpha(0.24),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#10b981'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: `🌲 ${reserve.name}\nUNESCO Protected Biosphere Reserve`,
        font: 'bold 13px "Inter", sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        showBackground: true,
        backgroundColor: new Cesium.Color(0.06, 0.45, 0.28, 0.88),
        backgroundPadding: new Cesium.Cartesian2(8, 5),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -25),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(reserve.lon, reserve.lat - 1.2, reserve.height * 0.85),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-48),
        roll: 0,
      },
      duration: 2.5,
    });

    this.viewer.selectedEntity = this._reserveEntity;

    const focusBanner = this.container?.querySelector('#cons-focus-info');
    const focusText = this.container?.querySelector('#cons-focus-text');
    if (focusBanner && focusText) {
      focusBanner.hidden = false;
      focusText.textContent = `Protected Area: ${reserve.name} [Monitoring Canopy Health & Boundary Intrusion]`;
    }
  }

  toggleThermalOptics() {
    if (this.styleManager && typeof this.styleManager.setStyle === 'function') {
      const current = String(this.styleManager.activeStyleName || '').toLowerCase();
      if (current.includes('thermal')) {
        this.styleManager.setStyle('normal');
      } else {
        this.styleManager.setStyle('thermal');
      }
    } else {
      // Fallback: trigger keypress for '4' (thermal shader)
      const event = new KeyboardEvent('keydown', { key: '4', code: 'Digit4', bubbles: true });
      window.dispatchEvent(event);
    }
  }

  exportIncidentReport() {
    if (!this.fires.length) {
      alert('No active fire detections available to export.');
      return;
    }

    const headers = ['latitude', 'longitude', 'frp_mw', 'confidence', 'satellite_sensor', 'acq_date', 'acq_time'];
    const rows = this.fires.slice(0, 5000).map((f) => [
      f.lat ?? f.latitude ?? '',
      f.lon ?? f.longitude ?? '',
      f.frp ?? '',
      f.confidence ?? '',
      f.satellite ?? f.sensor ?? 'VIIRS',
      f.acq_date ?? '',
      f.acq_time ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `forest_fire_threat_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this._targetEntity && this.viewer?.entities?.contains(this._targetEntity)) {
      this.viewer.entities.remove(this._targetEntity);
    }
    if (this._reserveEntity && this.viewer?.entities?.contains(this._reserveEntity)) {
      this.viewer.entities.remove(this._reserveEntity);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}
