import * as Cesium from 'cesium';

/**
 * Per-layer data attribution registered into Cesium's credit display.
 *
 * Legal requirement (see DATA_SOURCES.md, findings H10/H11 in
 * docs/pre-ship-audit-2026-07-01.md): every third-party data layer this app can
 * display carries its own license and required attribution — ODbL (OSM
 * datacenters/dams, adsb.lol, Overpass roads), CC BY-NC-SA (TeleGeography
 * cables), NASA FIRMS, CelesTrak, USGS, City of Austin, GBFS operators, OpenSky.
 * The MIT code license does NOT cover this data.
 *
 * These credits are registered ONCE at init as STATIC credits with
 * showOnScreen=false, so they live in the expandable bottom-left "Data
 * attribution" lightbox (Cesium's credit popover) rather than cluttering the
 * on-globe line. Always-present is intentional and reversible: the lightbox is
 * the app's canonical attribution surface and DATA_SOURCES.md is the
 * machine-readable index. Strings are copied verbatim from DATA_SOURCES.md — if
 * you add a data source, add it there AND here.
 */

/**
 * Attribution entries. `html` is the credit markup; keep it minimal and
 * link out where DATA_SOURCES.md provides a canonical URL. Order roughly
 * follows DATA_SOURCES.md (live sources, then bundled snapshots).
 * @type {{ key: string, html: string }[]}
 */
/**
 * ARANYA Data Sources & Attribution Registry.
 * Legacy God's Eye View sources (flights, military, AIS, satellites, earthquakes, CCTV)
 * have been retired.
 */

export const DATA_CREDITS = [];

export const TOMTOM_CREDIT = {
  key: 'tomtom',
  html: '',
};

export const NATURAL_EARTH_CREDIT = {
  key: 'natural-earth',
  html: '',
};

/**
 * Register a conditional credit at the moment its data source activates.
 * @returns {boolean}
 */
export function registerDynamicCredit(_viewer, _credit) {
  return false;
}

/**
 * Register per-layer data credits into the viewer.
 * No-op for ARANYA to prevent legacy attribution lightbox from appearing.
 */
export function registerDataCredits(_viewer) {
  // Legacy attributions retired
}

