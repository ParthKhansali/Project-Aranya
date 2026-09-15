import * as Cesium from 'cesium';

/**
 * ARANYA Camera Presets
 * Primary launch geography: INDIA (lat 22.5, lon 79.5)
 * Primary pilot geography: UTTARAKHAND (Rajaji & Corbett landscapes)
 */
export const CAMERA_PRESETS = {
  india: {
    destination: Cesium.Cartesian3.fromDegrees(79.5, 22.5, 3800000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
  },
  uttarakhand: {
    destination: Cesium.Cartesian3.fromDegrees(78.22, 30.04, 62000),
    orientation: {
      heading: Cesium.Math.toRadians(12),
      pitch: Cesium.Math.toRadians(-48),
      roll: 0.0,
    },
  },
  rajaji: {
    destination: Cesium.Cartesian3.fromDegrees(78.205, 30.065, 18500),
    orientation: {
      heading: Cesium.Math.toRadians(25),
      pitch: Cesium.Math.toRadians(-42),
      roll: 0.0,
    },
  },
  corbett: {
    destination: Cesium.Cartesian3.fromDegrees(78.95, 29.52, 36000),
    orientation: {
      heading: Cesium.Math.toRadians(-15),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0.0,
    },
  },
  raiwala: {
    destination: Cesium.Cartesian3.fromDegrees(78.238, 30.012, 5200),
    orientation: {
      heading: Cesium.Math.toRadians(35),
      pitch: Cesium.Math.toRadians(-38),
      roll: 0.0,
    },
  },
  global: {
    destination: Cesium.Cartesian3.fromDegrees(78.0, 20.0, 18000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
  },
};

/**
 * Fly the camera to a preset location with a smooth animation.
 */
export function flyToPreset(viewer, presetName, duration = 3.0) {
  const preset = CAMERA_PRESETS[presetName];
  if (!preset) return;

  viewer.camera.flyTo({
    destination: preset.destination,
    orientation: preset.orientation,
    duration,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  });
}

/**
 * ARANYA Startup Camera Flight:
 * On boot, centers immediately on INDIA at high altitude,
 * then smoothly descends into the Uttarakhand pilot landscape.
 * Never starts on USA or generic full Earth.
 * @returns {Function} Cancels pending startup flight.
 */
export function flyToIndiaStartup(viewer) {
  // 1. Instantly set camera over India
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(79.5, 22.5, 3800000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
  });

  // 2. Smooth cinematic entry into Uttarakhand pilot landscape after brief orientation pause
  const timer = setTimeout(() => {
    if (viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(78.22, 30.04, 62000),
      orientation: {
        heading: Cesium.Math.toRadians(15),
        pitch: Cesium.Math.toRadians(-48),
        roll: 0.0,
      },
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }, 600);

  return () => {
    clearTimeout(timer);
    if (!viewer.isDestroyed()) viewer.camera.cancelFlight();
  };
}

// Backward-compatible alias for existing startup hook
export function flyToAustin(viewer) {
  return flyToIndiaStartup(viewer);
}
