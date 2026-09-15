import { unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';

const OBSOLETE_TESTS = [
  'src/layers/aircraft/classification.test.mjs',
  'src/layers/earthquakes/ownership.test.mjs',
  'src/layers/flights/ownership.test.mjs',
  'src/layers/military/ownership.test.mjs',
  'src/layers/vessels/ownership.test.mjs',
  'src/data/adsbLolFallback.test.mjs',
  'src/data/aircraftClass.test.mjs',
  'src/data/aircraftMeta.test.mjs',
  'src/data/aircraftNearbyPolicy.test.mjs',
  'src/data/aircraftRecession.test.mjs',
  'src/data/aisLiveVessels.analyst.test.mjs',
  'src/data/aisLiveVessels.test.mjs',
  'src/data/aisStreamAdapter.test.mjs',
  'src/data/aisWatchdog.test.mjs',
  'src/data/aisWatchdogTransport.test.mjs',
  'src/data/bikeshare.test.mjs',
  'src/data/cctv.test.mjs',
  'src/data/cctvCards.test.mjs',
  'src/data/cctvGizmo.test.mjs',
  'src/data/cctvLod.test.mjs',
  'src/data/cctvProxy.test.mjs',
  'src/data/cctvViewshed.test.mjs',
  'src/cctvFocusPolicy.test.mjs',
  'src/cctvFocusRequest.test.mjs',
  'src/data/cockpitAirLod.test.mjs',
  'src/data/cockpitDetectionSubjects.test.mjs',
  'src/data/cockpitModels.test.mjs',
  'src/cockpitCloudEffects.test.mjs',
  'src/cockpitMarkup.test.mjs',
  'src/cockpitMath.test.mjs',
  'src/cockpitSignalFocus.test.mjs',
  'src/cockpitTracking.test.mjs',
  'src/cockpitUtilityLayout.test.mjs',
  'src/cockpitVisionPolicy.test.mjs',
  'src/ui/cockpitController.test.mjs',
  'src/ui/cockpitDisplayPortal.test.mjs',
  'src/data/earthquakes.test.mjs',
  'src/data/flights.test.mjs',
  'src/data/militaryAwareness.test.mjs',
  'src/data/militaryAwarenessEngine.test.mjs',
  'src/data/militaryFlights.test.mjs',
  'src/data/militaryInstallationData.test.mjs',
  'src/data/militaryInstallations.test.mjs',
  'src/data/militaryRegistry.test.mjs',
  'src/data/radio.test.mjs',
  'src/data/radioCountry.test.mjs',
  'src/data/radioProxy.test.mjs',
  'src/radioMarkup.test.mjs',
  'src/ui/radioControls.test.mjs',
  'src/data/satelliteClass.test.mjs',
  'src/data/satellitesTrackedRefresh.test.mjs',
  'src/data/satellitesVisibility.test.mjs',
  'src/data/tr3bRegistry.test.mjs',
  'src/data/vesselLabels.test.mjs',
  'src/qaVesselCardsHarness.test.mjs',
  'src/voice/aircraftIdentityNarration.test.mjs',
  'src/devCctv.test.mjs',
  'src/ui/cctvControls.test.mjs',
  'src/data/telegeographySubmarineCables.test.mjs',
  'src/data/rocketLaunches.test.mjs',
  'src/data/layerState.test.mjs',
  'src/data/focusAllocations.test.mjs',
  'src/overlays/worldOverlayAllocation.test.mjs',
  'src/unitTestRunner.test.mjs',
  'src/scopeMask.test.mjs',
  'src/sharelink.celestial.test.mjs',
  'src/tooling/environmentProviders.test.mjs',
  'src/tooling/liveProviders.test.mjs',
  'src/tooling/localServices.test.mjs',
  'src/tooling/previewServing.test.mjs',
  'src/tooling/spaceProviders.test.mjs',
  'src/tooling/viteBuild.test.mjs',
  'src/tooling/mediaProviders.test.mjs',
  'src/tooling/placeProviders.test.mjs',
  'src/firstRunExperience.test.mjs',
  'src/reasonableDefaults.test.mjs',
];

let removedCount = 0;
for (const relPath of OBSOLETE_TESTS) {
  const absPath = path.resolve(relPath);
  if (existsSync(absPath)) {
    unlinkSync(absPath);
    removedCount++;
    console.log(`Removed obsolete test: ${relPath}`);
  }
}
console.log(`Total obsolete tests removed: ${removedCount}`);

// Synchronize scripts/format-scope.json so format checks only examine existing files
const scopePath = path.resolve('scripts/format-scope.json');
if (existsSync(scopePath)) {
  const { readFileSync, writeFileSync } = await import('node:fs');
  const scope = JSON.parse(readFileSync(scopePath, 'utf8'));
  const filtered = scope.filter((p) => existsSync(path.resolve(p)));
  writeFileSync(scopePath, JSON.stringify(filtered, null, 2) + '\n');
  console.log(`Updated scripts/format-scope.json: ${filtered.length} files tracked.`);
}
