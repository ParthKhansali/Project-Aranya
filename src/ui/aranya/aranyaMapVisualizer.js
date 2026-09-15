// ARANYA — 3D Geospatial Map Visualizer for Cesium
// Renders camera traps, animal sightings, movement corridors, risk grid polygons,
// villages, field teams, and dynamic AI-predicted forward movement trajectories.
import * as Cesium from 'cesium';

export class AranyaMapVisualizer {
  constructor(viewer) {
    this.viewer = viewer;
    this.staticSource = new Cesium.CustomDataSource('aranya-static-layer');
    this.dynamicSource = new Cesium.CustomDataSource(
      'aranya-dynamic-trajectory',
    );
    this.simulationSource = new Cesium.CustomDataSource(
      'aranya-simulation-layer',
    );

    this.viewer.dataSources.add(this.staticSource);
    this.viewer.dataSources.add(this.dynamicSource);
    this.viewer.dataSources.add(this.simulationSource);

    this.clickHandler = null;
    this._pulseInterval = null;
  }

  destroy() {
    if (this._pulseInterval) clearInterval(this._pulseInterval);
    if (this.clickHandler && !this.clickHandler.isDestroyed()) {
      this.clickHandler.destroy();
    }
    try {
      this.viewer.dataSources.remove(this.staticSource, true);
      this.viewer.dataSources.remove(this.dynamicSource, true);
      this.viewer.dataSources.remove(this.simulationSource, true);
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 1. RENDER ALL BASE GEOSPATIAL LAYERS
  // -------------------------------------------------------------
  renderStaticLayers({
    cameraTraps = [],
    observations = [],
    riskCells = [],
    settlements = [],
    corridors = [],
    fieldTeams = [],
  }) {
    this.staticSource.entities.removeAll();

    // 1.1 Camera Traps
    for (const trap of cameraTraps) {
      const isTriggered = trap.status === 'triggered';
      this.staticSource.entities.add({
        id: `trap-${trap.id}`,
        name: `Camera Trap ${trap.id}`,
        position: Cesium.Cartesian3.fromDegrees(
          trap.lon,
          trap.lat,
          trap.elevation || 360,
        ),
        point: {
          pixelSize: isTriggered ? 12 : 9,
          color: Cesium.Color.fromCssColorString(
            isTriggered ? '#ef4444' : '#10b981',
          ),
          outlineColor: Cesium.Color.fromCssColorString('#030705'),
          outlineWidth: 2,
        },
        label: {
          text: `📷 ${trap.id}`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#030705'),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(6, 20, 14, 0.85)',
          ),
          backgroundPadding: new Cesium.Cartesian2(6, 3),
          pixelOffset: new Cesium.Cartesian2(0, -18),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            75000,
          ),
        },
        properties: {
          aranyaType: 'trap',
          aranyaData: trap,
        },
      });
    }

    // 1.2 Wildlife Observations
    const SPECIES_CONFIG = {
      Leopard: { color: '#f59e0b', icon: '🐆' },
      'Asian Elephant': { color: '#06b6d4', icon: '🐘' },
      'Bengal Tiger': { color: '#f97316', icon: '🐅' },
      'Spotted Deer': { color: '#10b981', icon: '🦌' },
      'Wild Boar': { color: '#94a3b8', icon: '🐗' },
    };

    for (const obs of observations) {
      const cfg = SPECIES_CONFIG[obs.species] || {
        color: '#34d399',
        icon: '🐾',
      };
      this.staticSource.entities.add({
        id: `obs-${obs.id}`,
        name: `${obs.species} (${obs.id})`,
        position: Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, 380),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString(cfg.color),
          outlineColor: Cesium.Color.fromCssColorString('#ffffff'),
          outlineWidth: 2,
        },
        label: {
          text: `${cfg.icon} ${obs.species} (${Math.round(obs.confidence * 100)}%)`,
          font: 'bold 12px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#030705'),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(14, 28, 22, 0.9)',
          ),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
          pixelOffset: new Cesium.Cartesian2(0, -22),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            95000,
          ),
        },
        properties: {
          aranyaType: 'observation',
          aranyaData: obs,
        },
      });
    }

    // 1.3 Human Settlements & Buffer Zones
    for (const set of settlements) {
      this.staticSource.entities.add({
        id: `set-${set.id}`,
        name: set.name,
        position: Cesium.Cartesian3.fromDegrees(set.lon, set.lat, 340),
        point: {
          pixelSize: 11,
          color: Cesium.Color.fromCssColorString('#f8fafc'),
          outlineColor: Cesium.Color.fromCssColorString('#475569'),
          outlineWidth: 2,
        },
        ellipse: {
          semiMajorAxis: 550,
          semiMinorAxis: 550,
          material: Cesium.Color.fromCssColorString('rgba(245, 158, 11, 0.15)'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(
            'rgba(245, 158, 11, 0.7)',
          ),
          outlineWidth: 1.5,
          height: 10,
        },
        label: {
          text: `🏘️ ${set.name}`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#f8fafc'),
          outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(15, 23, 42, 0.85)',
          ),
          backgroundPadding: new Cesium.Cartesian2(6, 3),
          pixelOffset: new Cesium.Cartesian2(0, -20),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            120000,
          ),
        },
        properties: {
          aranyaType: 'settlement',
          aranyaData: set,
        },
      });
    }

    // 1.4 Conflict Risk Cells
    for (const cell of riskCells) {
      const score = cell.overallScore;
      const colorString =
        score >= 81
          ? 'rgba(239, 68, 68, 0.28)'
          : score >= 61
            ? 'rgba(245, 158, 11, 0.22)'
            : score >= 31
              ? 'rgba(59, 130, 246, 0.18)'
              : 'rgba(16, 185, 129, 0.15)';
      const outlineString =
        score >= 81
          ? '#ef4444'
          : score >= 61
            ? '#f59e0b'
            : score >= 31
              ? '#3b82f6'
              : '#10b981';

      this.staticSource.entities.add({
        id: `risk-${cell.id}`,
        name: `Risk Sector ${cell.id} (${cell.overallScore})`,
        position: Cesium.Cartesian3.fromDegrees(
          cell.centerLon,
          cell.centerLat,
          300,
        ),
        ellipse: {
          semiMajorAxis: 1100,
          semiMinorAxis: 1100,
          material: Cesium.Color.fromCssColorString(colorString),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(outlineString),
          outlineWidth: 2,
          height: 15,
        },
        label: {
          text: `⚠️ ${cell.id} · RISK: ${cell.overallScore}`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(14, 28, 22, 0.85)',
          ),
          backgroundPadding: new Cesium.Cartesian2(6, 3),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            80000,
          ),
        },
        properties: {
          aranyaType: 'risk',
          aranyaData: cell,
        },
      });
    }

    // 1.5 Corridors
    for (const corr of corridors) {
      this.staticSource.entities.add({
        id: `corridor-${corr.id}`,
        name: corr.name,
        position: Cesium.Cartesian3.fromDegrees(
          corr.centerLon,
          corr.centerLat,
          350,
        ),
        label: {
          text: `🌲 ${corr.name}`,
          font: 'bold 12px Inter, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#34d399'),
          outlineColor: Cesium.Color.fromCssColorString('#022c22'),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(4, 30, 18, 0.85)',
          ),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            140000,
          ),
        },
        properties: {
          aranyaType: 'corridor',
          aranyaData: corr,
        },
      });
    }

    // 1.6 Field Response Teams
    for (const team of fieldTeams) {
      this.staticSource.entities.add({
        id: `team-${team.id}`,
        name: team.name,
        position: Cesium.Cartesian3.fromDegrees(
          team.currentBase.lon,
          team.currentBase.lat,
          360,
        ),
        point: {
          pixelSize: 11,
          color: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
        },
        label: {
          text: `🛡️ ${team.name} [${team.status}]`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(8, 20, 32, 0.85)',
          ),
          backgroundPadding: new Cesium.Cartesian2(6, 3),
          pixelOffset: new Cesium.Cartesian2(0, -20),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            90000,
          ),
        },
        properties: {
          aranyaType: 'team',
          aranyaData: team,
        },
      });
    }
  }

  // -------------------------------------------------------------
  // 2. SHOW ANIMAL MOVEMENT TRAIL & AI PREDICTIVE TRAJECTORY
  // -------------------------------------------------------------
  displayTrajectoryAndPrediction(item) {
    this.dynamicSource.entities.removeAll();
    if (!item) return;

    // 2.1 Draw Historical Path (Where animal came from)
    if (item.historicalTrail && item.historicalTrail.length >= 2) {
      const flatCoords = item.historicalTrail.flat();
      this.dynamicSource.entities.add({
        name: `Historical Movement: ${item.species || 'Wildlife'}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(flatCoords),
          width: 5.0,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: Cesium.Color.fromCssColorString('#f59e0b'), // Glowing amber
          }),
          clampToGround: true,
        },
      });

      // Waypoint pins along historical path
      item.historicalTrail.forEach((pt, idx) => {
        const isStart = idx === 0;
        this.dynamicSource.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            pt[0],
            pt[1],
            (pt[2] || 360) + 10,
          ),
          point: {
            pixelSize: isStart ? 8 : 6,
            color: Cesium.Color.fromCssColorString('#f59e0b'),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1.5,
          },
          label: {
            text: isStart ? '📍 ORIGIN' : `T-${idx * 45}m`,
            font: '10px Inter, sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#fde68a'),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString(
              'rgba(0, 0, 0, 0.75)',
            ),
            pixelOffset: new Cesium.Cartesian2(0, -12),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              35000,
            ),
          },
        });
      });
    }

    // 2.2 Draw AI Predicted Trajectory (Where animal will go)
    if (item.predictedTrajectory && item.predictedTrajectory.length >= 2) {
      const flatPred = item.predictedTrajectory.flat();
      this.dynamicSource.entities.add({
        name: `AI Predicted Trajectory: ${item.species || 'Wildlife'}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(flatPred),
          width: 5.0,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#ef4444'), // Red dash warning
            gapColor: Cesium.Color.TRANSPARENT,
            dashLength: 20.0,
          }),
          clampToGround: true,
        },
      });

      // Predicted destination node
      const dest =
        item.predictedTrajectory[item.predictedTrajectory.length - 1];
      const eta = item.aiThoughtProcess?.estimatedTimeOfArrival || '45m';
      this.dynamicSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          dest[0],
          dest[1],
          (dest[2] || 360) + 15,
        ),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#ef4444'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: `🚨 PREDICTED INGRESS · ETA: ${eta}`,
          font: 'bold 12px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(239, 68, 68, 0.9)',
          ),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
          pixelOffset: new Cesium.Cartesian2(0, -22),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });
    }

    // 2.3 Draw Conflict Risk Hotspot
    if (item.conflictHotspot) {
      const hs = item.conflictHotspot;
      this.dynamicSource.entities.add({
        name: `Conflict Hotspot: ${hs.name || 'Fringe Interface'}`,
        position: Cesium.Cartesian3.fromDegrees(hs.lon, hs.lat, 20),
        ellipse: {
          semiMajorAxis: hs.radius || 480,
          semiMinorAxis: hs.radius || 480,
          material: Cesium.Color.fromCssColorString('rgba(239, 68, 68, 0.38)'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ef4444'),
          outlineWidth: 2.5,
          height: 12,
        },
        label: {
          text: `⚠️ CONFLICT RISK ZONE (${hs.riskScore || 87}/100)`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#fca5a5'),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(15, 23, 42, 0.85)',
          ),
          pixelOffset: new Cesium.Cartesian2(0, 0),
        },
      });
    }
  }

  // -------------------------------------------------------------
  // 3. SIMULATION VISUALIZATION RUNNER
  // -------------------------------------------------------------
  visualizeSimulation(scenario) {
    this.simulationSource.entities.removeAll();
    if (!scenario) return;

    // Draw historical approach line for simulation
    if (scenario.movementHistory && scenario.movementHistory.length >= 2) {
      this.simulationSource.entities.add({
        name: `Simulated Approach Trail: ${scenario.species}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(
            scenario.movementHistory.flat(),
          ),
          width: 5.0,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.35,
            color: Cesium.Color.fromCssColorString('#f59e0b'),
          }),
          clampToGround: true,
        },
      });
    }

    // Draw AI predicted forward movement for simulation
    if (
      scenario.predictedTrajectory &&
      scenario.predictedTrajectory.length >= 2
    ) {
      this.simulationSource.entities.add({
        name: `AI Forward Trajectory: ${scenario.species}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(
            scenario.predictedTrajectory.flat(),
          ),
          width: 5.0,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#ef4444'),
            gapColor: Cesium.Color.TRANSPARENT,
            dashLength: 20.0,
          }),
          clampToGround: true,
        },
      });

      const dest =
        scenario.predictedTrajectory[scenario.predictedTrajectory.length - 1];
      const eta =
        scenario.aiThoughtProcess?.estimatedTimeOfArrival || '35 mins';
      this.simulationSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(dest[0], dest[1], 370),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString('#ef4444'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: `🚨 PROJECTED IMPACT POINT · ETA: ${eta}`,
          font: 'bold 12px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(220, 38, 38, 0.9)',
          ),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
          pixelOffset: new Cesium.Cartesian2(0, -22),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });
    }

    // Highlight conflict zone
    if (scenario.conflictZone) {
      const cz = scenario.conflictZone;
      this.simulationSource.entities.add({
        name: `Simulation Conflict Hotspot`,
        position: Cesium.Cartesian3.fromDegrees(cz.centerLon, cz.centerLat, 15),
        ellipse: {
          semiMajorAxis: cz.radiusMeters || 500,
          semiMinorAxis: cz.radiusMeters || 500,
          material: Cesium.Color.fromCssColorString('rgba(239, 68, 68, 0.45)'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ef4444'),
          outlineWidth: 3,
          height: 10,
        },
        label: {
          text: `🚨 ${cz.label || 'VILLAGE INTERFACE'} (RISK: ${cz.riskLevel || 87}/100)`,
          font: 'bold 12px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(15, 23, 42, 0.9)',
          ),
          backgroundPadding: new Cesium.Cartesian2(8, 4),
        },
      });
    }
  }

  // -------------------------------------------------------------
  // 4. ANIMATE TEAM DISPATCH ROUTE & INTERVENTION EFFECTS
  // -------------------------------------------------------------
  animateTeamDispatch(
    startCoords,
    targetCoords,
    teamName = 'Team Alpha (QRU)',
  ) {
    const routeId = 'team-dispatch-route';
    this.simulationSource.entities.removeById(routeId);

    this.simulationSource.entities.add({
      id: routeId,
      name: `QRT Dispatch Route: ${teamName}`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          startCoords.lon,
          startCoords.lat,
          350,
          (startCoords.lon + targetCoords.lon) / 2,
          (startCoords.lat + targetCoords.lat) / 2,
          360,
          targetCoords.lon,
          targetCoords.lat,
          350,
        ]),
        width: 4.5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.35,
          color: Cesium.Color.fromCssColorString('#38bdf8'), // Glowing Cyan / Blue
        }),
        clampToGround: true,
      },
    });
  }

  triggerAcousticDeterrentEffect(coords) {
    const sirenId = 'acoustic-siren-ring';
    this.simulationSource.entities.removeById(sirenId);

    this.simulationSource.entities.add({
      id: sirenId,
      name: 'Acoustic Virtual Fence Deterrent',
      position: Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, 10),
      ellipse: {
        semiMajorAxis: 350,
        semiMinorAxis: 350,
        material: Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.35)'),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
        outlineWidth: 3,
        height: 15,
      },
      label: {
        text: '🔊 VIRTUAL FENCE ACTIVE · 120 dB DETERRENT',
        font: 'bold 11px Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#38bdf8'),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString(
          'rgba(8, 20, 32, 0.9)',
        ),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        pixelOffset: new Cesium.Cartesian2(0, -18),
      },
    });
  }

  // -------------------------------------------------------------
  // 5. CESIUM ENTITY PICKING
  // -------------------------------------------------------------
  setupEntityPicking(onSelectCallback) {
    if (this.clickHandler) this.clickHandler.destroy();
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    );

    this.clickHandler.setInputAction((movement) => {
      const picked = this.viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id && picked.id.properties) {
        const aranyaType = picked.id.properties.aranyaType?.getValue();
        const aranyaData = picked.id.properties.aranyaData?.getValue();
        if (
          aranyaType &&
          aranyaData &&
          typeof onSelectCallback === 'function'
        ) {
          onSelectCallback(aranyaType, aranyaData);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
