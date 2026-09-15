import * as Cesium from 'cesium';
import { createLocalGeoJsonLayer } from './localGeojsonCore.js';

const forestsUrl = new URL(
  './local_data/forests/forests.geojsonl',
  import.meta.url,
).href;

/**
 * Protected Forest Reserves & National Parks layer.
 * Renders high-visibility ecological boundaries, biomes, and threat classifications.
 * @param {object} services Caller-owned context, overlay and render operations.
 */
export function createForestReservesLayer(services) {
  return createLocalGeoJsonLayer(
    {
      id: 'local-forests',
      url: forestsUrl,
      name: 'Protected Forest Reserves',
      color: '#10b981', // Vivid Emerald Green
      icon: '🌲',
      source: 'WDPA · UNESCO',
      labels: true,
      labelMax: 800,
      labelGridPx: 120,
    },
    services,
  );
}

/**
 * NASA GIBS MODIS 8-Day NDVI (Normalized Difference Vegetation Index)
 * Highlights vegetative health and tree canopy loss:
 * Green = Dense healthy forest canopy
 * Yellow/Brown = Degraded/sparse vegetation
 * Red/Bare = Critical canopy loss or burned zones
 */
export function createVegetationHealthLayer() {
  let viewerInstance = null;
  let imageryLayer = null;
  let isEnabled = false;

  return {
    id: 'vegetation-health',
    name: 'Canopy Health (NDVI)',
    icon: '🍃',
    source: 'NASA GIBS · MODIS',

    init(viewer) {
      viewerInstance = viewer;
    },

    async enable() {
      if (isEnabled || !viewerInstance) return;
      try {
        const provider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
          maximumLevel: 9,
          credit: new Cesium.Credit('NASA GIBS / MODIS NDVI Vegetation Health', true),
        });
        imageryLayer = viewerInstance.imageryLayers.addImageryProvider(provider);
        imageryLayer.alpha = 0.55;
        isEnabled = true;
      } catch (err) {
        console.warn('[vegetation-layer] failed to load NDVI provider:', err);
      }
    },

    async disable() {
      if (!isEnabled || !viewerInstance || !imageryLayer) return;
      try {
        viewerInstance.imageryLayers.remove(imageryLayer, true);
        imageryLayer = null;
        isEnabled = false;
      } catch (err) {
        console.warn('[vegetation-layer] failed to remove NDVI provider:', err);
      }
    },

    getStats() {
      return {
        count: isEnabled ? 1 : 0,
        status: isEnabled ? 'nominal' : 'offline',
        source: 'NASA GIBS MODIS NDVI',
      };
    },
  };
}
