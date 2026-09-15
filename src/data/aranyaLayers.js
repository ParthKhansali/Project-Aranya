// ARANYA — Wildlife & Human-Conflict Intelligence Platform
// Cesium Data Layers Integration Module
import * as Cesium from 'cesium';
import { defaultWildlifeProvider } from './aranya/wildlifeProvider.js';
import { defaultMovementProvider } from './aranya/movementProvider.js';
import { defaultRiskProvider, getRiskCategory } from './aranya/riskProvider.js';
import { defaultHabitatProvider } from './aranya/habitatProvider.js';
import { defaultHumanInterfaceProvider } from './aranya/humanInterfaceProvider.js';
import { defaultFieldTeamProvider } from './aranya/fieldTeamProvider.js';
import { registerEntityContext, selectEntityContext } from './contextStore.js';

// Crisp vector pin generator
function createPinDataUri(icon, bgColor, label = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.7"/>
    </filter>
    <g filter="url(#sh)">
      <circle cx="28" cy="24" r="18" fill="${bgColor}" stroke="#ffffff" stroke-width="2.2"/>
      <polygon points="21,38 35,38 28,49" fill="${bgColor}"/>
      <text x="28" y="30" font-family="'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" font-size="16" text-anchor="middle">${icon}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// -------------------------------------------------------------
// 1. ARANYA WILDLIFE & CAMERA TRAPS LAYER
// -------------------------------------------------------------
export function createAranyaWildlifeLayer() {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _clickHandler = null;
  let _unsubscribe = null;

  async function syncEntities() {
    if (!_dataSource || !_enabled) return;
    _dataSource.entities.removeAll();

    // 1. Camera Traps
    const traps = await defaultWildlifeProvider.getCameraTraps();
    for (const trap of traps) {
      const isTriggered = trap.status === 'triggered';
      const pinColor = isTriggered ? '#EF4444' : '#10B981';
      const entity = _dataSource.entities.add({
        id: `camera-trap:${trap.id}`,
        name: `${trap.name} [${trap.id}]`,
        position: Cesium.Cartesian3.fromDegrees(trap.lon, trap.lat, 10),
        billboard: {
          image: createPinDataUri('📷', pinColor),
          scale: isTriggered ? 0.9 : 0.75,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: trap.id,
          font: '11px "Space Grotesk", sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, 8),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
        },
      });

      registerEntityContext(entity, {
        id: `camera-trap:${trap.id}`,
        layerId: 'aranya-wildlife',
        type: 'camera_trap',
        title: trap.name,
        data: trap,
      });
    }

    // 2. Observations
    const observations = await defaultWildlifeProvider.getObservations();
    for (const obs of observations) {
      const pinColor = obs.speciesKey === 'leopard' ? '#F59E0B' :
                       obs.speciesKey === 'elephant' ? '#06B6D4' :
                       obs.speciesKey === 'tiger' ? '#F97316' :
                       obs.speciesKey === 'sloth_bear' ? '#854D0E' : '#10B981';

      const entity = _dataSource.entities.add({
        id: `observation:${obs.id}`,
        name: `${obs.species} Sighting`,
        position: Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, 15),
        billboard: {
          image: createPinDataUri(obs.icon || '🐾', pinColor),
          scale: 0.8,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `${obs.icon || ''} ${obs.species.split(' ')[0]}`,
          font: 'bold 11px sans-serif',
          fillColor: Cesium.Color.fromCssColorString(pinColor),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000),
        },
      });

      registerEntityContext(entity, {
        id: `observation:${obs.id}`,
        layerId: 'aranya-wildlife',
        type: 'observation',
        title: `${obs.species} Detection`,
        data: obs,
      });
    }
  }

  return {
    id: 'aranya-wildlife',
    name: 'Wildlife Detections & Traps',
    icon: '🐾',
    source: 'ARANYA IoT & Camera Trap Grid',

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('aranya-wildlife-ds');
      _viewer.dataSources.add(_dataSource);
      _dataSource.show = false;

      _clickHandler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = _viewer.scene.pick(click.position);
        if (picked && picked.id && String(picked.id.id).startsWith('camera-trap:') || String(picked.id?.id).startsWith('observation:')) {
          _viewer.selectedEntity = picked.id;
          selectEntityContext(picked.id);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      _unsubscribe = defaultWildlifeProvider.subscribe(() => {
        if (_enabled) syncEntities();
      });
    },

    async enable() {
      if (_enabled) return;
      _enabled = true;
      if (_dataSource) {
        _dataSource.show = true;
        await syncEntities();
      }
    },

    async disable() {
      if (!_enabled) return;
      _enabled = false;
      if (_dataSource) {
        _dataSource.show = false;
      }
    },

    destroy() {
      if (_unsubscribe) _unsubscribe();
      if (_clickHandler) _clickHandler.destroy();
      if (_dataSource && _viewer) {
        _viewer.dataSources.remove(_dataSource, true);
      }
    },

    getStats() {
      return {
        count: _dataSource ? _dataSource.entities.values.length : 0,
        status: _enabled ? 'nominal' : 'standby',
        source: 'ARANYA Camera Trap & Sensor Grid',
      };
    },
  };
}

// -------------------------------------------------------------
// 2. ARANYA MOVEMENT & CORRIDORS LAYER
// -------------------------------------------------------------
export function createAranyaMovementLayer() {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _unsubscribe = null;

  async function syncEntities() {
    if (!_dataSource || !_enabled) return;
    _dataSource.entities.removeAll();

    const trails = await defaultMovementProvider.getActiveTrails();
    for (const trail of trails) {
      const positions = trail.coordinates.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1], 15));
      const color = trail.speciesKey === 'leopard' ? Cesium.Color.fromCssColorString('#F59E0B') :
                    trail.speciesKey === 'elephant' ? Cesium.Color.fromCssColorString('#06B6D4') :
                    Cesium.Color.fromCssColorString('#F97316');

      // Corridor / GPS Trail Line
      _dataSource.entities.add({
        id: `trail:${trail.id}`,
        name: trail.name,
        polyline: {
          positions,
          width: 4.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: color.withAlpha(0.9),
          }),
          clampToGround: true,
        },
      });

      // Trail Waypoint Nodes
      trail.coordinates.forEach((coord, idx) => {
        const isLatest = idx === trail.coordinates.length - 1;
        _dataSource.entities.add({
          id: `trail-pt:${trail.id}-${idx}`,
          position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 10),
          point: {
            pixelSize: isLatest ? 10 : 6,
            color: isLatest ? Cesium.Color.RED : color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
          label: isLatest ? {
            text: `Latest: ${trail.species.split(' ')[0]}`,
            font: 'bold 11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 45000),
          } : undefined,
        });
      });
    }
  }

  return {
    id: 'aranya-movement',
    name: 'Wildlife Movement Corridors',
    icon: '🧭',
    source: 'GPS Collar & Corridor Analytics',

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('aranya-movement-ds');
      _viewer.dataSources.add(_dataSource);
      _dataSource.show = false;

      _unsubscribe = defaultMovementProvider.subscribe(() => {
        if (_enabled) syncEntities();
      });
    },

    async enable() {
      if (_enabled) return;
      _enabled = true;
      if (_dataSource) {
        _dataSource.show = true;
        await syncEntities();
      }
    },

    async disable() {
      if (!_enabled) return;
      _enabled = false;
      if (_dataSource) {
        _dataSource.show = false;
      }
    },

    destroy() {
      if (_unsubscribe) _unsubscribe();
      if (_dataSource && _viewer) {
        _viewer.dataSources.remove(_dataSource, true);
      }
    },

    getStats() {
      return {
        count: _dataSource ? _dataSource.entities.values.length : 0,
        status: _enabled ? 'tracking' : 'standby',
        source: 'Wildlife Telemetry Network',
      };
    },
  };
}

// -------------------------------------------------------------
// 3. ARANYA CONFLICT RISK POLYGONS LAYER (EXPLAINABILITY)
// -------------------------------------------------------------
export function createAranyaRiskLayer() {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _clickHandler = null;
  let _unsubscribe = null;

  async function syncEntities() {
    if (!_dataSource || !_enabled) return;
    _dataSource.entities.removeAll();

    const cells = await defaultRiskProvider.getRiskCells();
    for (const cell of cells) {
      const cat = getRiskCategory(cell.overallScore);
      const cesiumColor = Cesium.Color.fromCssColorString(cat.color);

      // Risk Grid Polygon
      const flatCoords = cell.polygonCoordinates.flat();
      const polygonEntity = _dataSource.entities.add({
        id: `risk-cell:${cell.id}`,
        name: `${cell.name} [${cell.overallScore}/100 - ${cat.label}]`,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
          material: cesiumColor.withAlpha(0.35),
          outline: true,
          outlineColor: cesiumColor.withAlpha(0.9),
          outlineWidth: 3,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });

      // Centroid Risk Badge Label
      _dataSource.entities.add({
        id: `risk-badge:${cell.id}`,
        position: Cesium.Cartesian3.fromDegrees(cell.centerLon, cell.centerLat, 20),
        billboard: {
          image: createPinDataUri(`${cell.overallScore}`, cat.color),
          scale: 0.85,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `[ RISK ${cell.overallScore} ] ${cell.id}`,
          font: 'bold 12px "Space Grotesk", sans-serif',
          fillColor: Cesium.Color.WHITE,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
          showBackground: true,
          pixelOffset: new Cesium.Cartesian2(0, 14),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 90000),
        },
      });

      registerEntityContext(polygonEntity, {
        id: `risk-cell:${cell.id}`,
        layerId: 'aranya-risk',
        type: 'risk_cell',
        title: cell.name,
        data: cell,
      });
    }
  }

  return {
    id: 'aranya-risk',
    name: 'Conflict Risk Landscape',
    icon: '⚠️',
    source: 'Explainable Conflict Risk Engine',

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('aranya-risk-ds');
      _viewer.dataSources.add(_dataSource);
      _dataSource.show = false;

      _clickHandler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = _viewer.scene.pick(click.position);
        if (picked && picked.id && (String(picked.id.id).startsWith('risk-cell:') || String(picked.id.id).startsWith('risk-badge:'))) {
          const rawId = picked.id.id.replace('risk-badge:', 'risk-cell:');
          const entity = _dataSource.entities.getById(rawId) || picked.id;
          _viewer.selectedEntity = entity;
          selectEntityContext(entity);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      _unsubscribe = defaultRiskProvider.subscribe(() => {
        if (_enabled) syncEntities();
      });
    },

    async enable() {
      if (_enabled) return;
      _enabled = true;
      if (_dataSource) {
        _dataSource.show = true;
        await syncEntities();
      }
    },

    async disable() {
      if (!_enabled) return;
      _enabled = false;
      if (_dataSource) {
        _dataSource.show = false;
      }
    },

    destroy() {
      if (_unsubscribe) _unsubscribe();
      if (_clickHandler) _clickHandler.destroy();
      if (_dataSource && _viewer) {
        _viewer.dataSources.remove(_dataSource, true);
      }
    },

    getStats() {
      return {
        count: _dataSource ? _dataSource.entities.values.length : 0,
        status: _enabled ? 'evaluating' : 'standby',
        source: 'Continuous Spatio-Temporal Risk Modeler',
      };
    },
  };
}

// -------------------------------------------------------------
// 4. ARANYA PROTECTED RESERVES & CORRIDORS LAYER
// -------------------------------------------------------------
export function createAranyaReservesLayer() {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;

  async function syncEntities() {
    if (!_dataSource || !_enabled) return;
    _dataSource.entities.removeAll();

    // 1. Reserves
    const reserves = await defaultHabitatProvider.getReserves();
    for (const res of reserves) {
      const flatCoords = res.boundaryCoordinates.flat();
      _dataSource.entities.add({
        id: `reserve:${res.id}`,
        name: res.name,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
          material: Cesium.Color.fromCssColorString('#10B981').withAlpha(0.12),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#10B981').withAlpha(0.8),
          outlineWidth: 2.5,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `🌲 ${res.name.toUpperCase()}`,
          font: 'bold 13px sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#34D399'),
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
          showBackground: true,
          position: Cesium.Cartesian3.fromDegrees(res.centerLon, res.centerLat, 50),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
    }

    // 2. Critical Corridors
    const corridors = await defaultHabitatProvider.getCorridors();
    for (const corr of corridors) {
      const positions = corr.coordinates.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1], 20));
      _dataSource.entities.add({
        id: `corridor:${corr.id}`,
        name: corr.name,
        polyline: {
          positions,
          width: 6.0,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#38BDF8'),
            dashLength: 16.0,
          }),
          clampToGround: true,
        },
      });

      // Pinch point markers
      if (corr.pinchPoints) {
        for (const pp of corr.pinchPoints) {
          _dataSource.entities.add({
            id: `pinch-point:${pp.name}`,
            position: Cesium.Cartesian3.fromDegrees(pp.lon, pp.lat, 15),
            billboard: {
              image: createPinDataUri('⚠️', '#F59E0B'),
              scale: 0.65,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            label: {
              text: `Pinch Point: ${pp.name}`,
              font: '10px sans-serif',
              fillColor: Cesium.Color.YELLOW,
              pixelOffset: new Cesium.Cartesian2(0, 10),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000),
            }
          });
        }
      }
    }
  }

  return {
    id: 'aranya-reserves',
    name: 'Protected Reserves & Corridors',
    icon: '🌲',
    source: 'Uttarakhand Forest Dept & WDPA',

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('aranya-reserves-ds');
      _viewer.dataSources.add(_dataSource);
      _dataSource.show = false;
    },

    async enable() {
      if (_enabled) return;
      _enabled = true;
      if (_dataSource) {
        _dataSource.show = true;
        await syncEntities();
      }
    },

    async disable() {
      if (!_enabled) return;
      _enabled = false;
      if (_dataSource) {
        _dataSource.show = false;
      }
    },

    destroy() {
      if (_dataSource && _viewer) {
        _viewer.dataSources.remove(_dataSource, true);
      }
    },

    getStats() {
      return {
        count: _dataSource ? _dataSource.entities.values.length : 0,
        status: _enabled ? 'nominal' : 'standby',
        source: 'Protected Forest Boundaries',
      };
    },
  };
}

// -------------------------------------------------------------
// 5. ARANYA HUMAN INTERFACE (SETTLEMENTS & INFRASTRUCTURE)
// -------------------------------------------------------------
export function createAranyaHumanInterfaceLayer() {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _clickHandler = null;

  async function syncEntities() {
    if (!_dataSource || !_enabled) return;
    _dataSource.entities.removeAll();

    // 1. Settlements
    const settlements = await defaultHumanInterfaceProvider.getSettlements();
    for (const set of settlements) {
      const pinColor = set.distanceToForestMeters < 50 ? '#EF4444' : '#EAB308';
      const entity = _dataSource.entities.add({
        id: `settlement:${set.id}`,
        name: set.name,
        position: Cesium.Cartesian3.fromDegrees(set.lon, set.lat, 10),
        billboard: {
          image: createPinDataUri('🏘️', pinColor),
          scale: 0.75,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `${set.name} (${set.distanceToForestMeters}m to forest)`,
          font: 'bold 11px sans-serif',
          fillColor: Cesium.Color.WHITE,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.65),
          showBackground: true,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 65000),
        },
      });

      registerEntityContext(entity, {
        id: `settlement:${set.id}`,
        layerId: 'aranya-human-interface',
        type: 'settlement',
        title: set.name,
        data: set,
      });
    }

    // 2. Transport Infrastructure
    const corridors = await defaultHumanInterfaceProvider.getInfrastructureCorridors();
    for (const inf of corridors) {
      const positions = inf.coordinates.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1], 15));
      const color = inf.type.includes('Railway') ? Cesium.Color.RED : Cesium.Color.YELLOW;
      _dataSource.entities.add({
        id: `infra:${inf.id}`,
        name: inf.name,
        polyline: {
          positions,
          width: 3.5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: color.withAlpha(0.85),
            dashLength: 12.0,
          }),
          clampToGround: true,
        },
      });
    }
  }

  return {
    id: 'aranya-human-interface',
    name: 'Fringe Villages & Linear Infrastructure',
    icon: '🏘️',
    source: 'Human Interface Analytics',

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('aranya-human-ds');
      _viewer.dataSources.add(_dataSource);
      _dataSource.show = false;

      _clickHandler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = _viewer.scene.pick(click.position);
        if (picked && picked.id && String(picked.id.id).startsWith('settlement:')) {
          _viewer.selectedEntity = picked.id;
          selectEntityContext(picked.id);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    async enable() {
      if (_enabled) return;
      _enabled = true;
      if (_dataSource) {
        _dataSource.show = true;
        await syncEntities();
      }
    },

    async disable() {
      if (!_enabled) return;
      _enabled = false;
      if (_dataSource) {
        _dataSource.show = false;
      }
    },

    destroy() {
      if (_clickHandler) _clickHandler.destroy();
      if (_dataSource && _viewer) {
        _viewer.dataSources.remove(_dataSource, true);
      }
    },

    getStats() {
      return {
        count: _dataSource ? _dataSource.entities.values.length : 0,
        status: _enabled ? 'monitoring' : 'standby',
        source: 'Settlement & Infrastructure Registry',
      };
    },
  };
}

// -------------------------------------------------------------
// 6. ARANYA FIELD RESPONSE TEAMS LAYER
// -------------------------------------------------------------
export function createAranyaFieldTeamsLayer() {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _clickHandler = null;
  let _unsubscribe = null;

  async function syncEntities() {
    if (!_dataSource || !_enabled) return;
    _dataSource.entities.removeAll();

    const teams = await defaultFieldTeamProvider.getTeams();
    for (const team of teams) {
      const pinColor = team.status === 'dispatched' ? '#EF4444' :
                       team.status === 'on_scene' ? '#F59E0B' : '#10B981';

      const entity = _dataSource.entities.add({
        id: `field-team:${team.id}`,
        name: team.name,
        position: Cesium.Cartesian3.fromDegrees(team.currentLon, team.currentLat, 15),
        billboard: {
          image: createPinDataUri('🛡️', pinColor),
          scale: 0.85,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `${team.name.split('—')[0].trim()} [${team.status.toUpperCase()}]`,
          font: 'bold 11px sans-serif',
          fillColor: Cesium.Color.WHITE,
          backgroundColor: Cesium.Color.fromCssColorString(pinColor).withAlpha(0.75),
          showBackground: true,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });

      registerEntityContext(entity, {
        id: `field-team:${team.id}`,
        layerId: 'aranya-field-teams',
        type: 'field_team',
        title: team.name,
        data: team,
      });
    }
  }

  return {
    id: 'aranya-field-teams',
    name: 'Field Response Teams & QRUs',
    icon: '🛡️',
    source: 'Forest Department QRU Dispatch',

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('aranya-teams-ds');
      _viewer.dataSources.add(_dataSource);
      _dataSource.show = false;

      _clickHandler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = _viewer.scene.pick(click.position);
        if (picked && picked.id && String(picked.id.id).startsWith('field-team:')) {
          _viewer.selectedEntity = picked.id;
          selectEntityContext(picked.id);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      _unsubscribe = defaultFieldTeamProvider.subscribe(() => {
        if (_enabled) syncEntities();
      });
    },

    async enable() {
      if (_enabled) return;
      _enabled = true;
      if (_dataSource) {
        _dataSource.show = true;
        await syncEntities();
      }
    },

    async disable() {
      if (!_enabled) return;
      _enabled = false;
      if (_dataSource) {
        _dataSource.show = false;
      }
    },

    destroy() {
      if (_unsubscribe) _unsubscribe();
      if (_clickHandler) _clickHandler.destroy();
      if (_dataSource && _viewer) {
        _viewer.dataSources.remove(_dataSource, true);
      }
    },

    getStats() {
      return {
        count: _dataSource ? _dataSource.entities.values.length : 0,
        status: _enabled ? 'deployed' : 'standby',
        source: 'Ground Quick Response Units',
      };
    },
  };
}
