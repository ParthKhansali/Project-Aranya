import { localGeoJsonServices } from './localGeojson.js';
import { createFirmsHeatmapLayer } from './firmsHeatmap.js';
import { createForestReservesLayer, createVegetationHealthLayer } from './forestLayers.js';

// Protected Forest Reserves and Biospheres
const forests = createForestReservesLayer(localGeoJsonServices);

// Live NASA FIRMS active fires & thermal anomalies (VIIRS)
const fires = createFirmsHeatmapLayer({
  id: 'local-firms',
  name: 'Active Wildfires (FIRMS)',
  icon: '🔥',
  source: 'NASA FIRMS · VIIRS LIVE',
});

// NASA GIBS MODIS NDVI Canopy Health
const vegetationHealth = createVegetationHealthLayer();

export default [
  forests,
  fires,
  vegetationHealth,
];

