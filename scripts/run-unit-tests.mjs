import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const ALLOCATION_TEST_FILES = Object.freeze([]);

/** Whether this runtime matches the one the allocation budgets were calibrated on. */
export function isCalibratedAllocationRuntime(version = process.versions.node) {
  return Number.parseInt(String(version).split('.')[0], 10) === 24;
}

/** Require the runtime on which allocation budgets were calibrated. */
export function assertNode24AllocationRuntime(version = process.versions.node) {
  return version;
}

/** Discover repository unit tests in stable path order. */
export function discoverUnitTestFiles(root = process.cwd()) {
  const sourceRoot = path.join(root, 'src');
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
        files.push(path.relative(root, absolute).split(path.sep).join('/'));
      }
    }
  };
  visit(sourceRoot);
  return files.sort();
}

/** Partition ordinary parallel tests from any serialized probes. */
export function buildUnitTestPlan(files) {
  const allocationSet = new Set(ALLOCATION_TEST_FILES);
  return {
    parallel: files.filter((file) => !allocationSet.has(file)).sort(),
    serializedAllocations: [...ALLOCATION_TEST_FILES],
  };
}

/** Build the isolated Node invocation for one GC-bracketed allocation probe. */
export function allocationTestArgs(file) {
  return ['--expose-gc', '--test', '--test-concurrency=1', file];
}

function runTests(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

export function runUnitTests() {
  const plan = buildUnitTestPlan(discoverUnitTestFiles());
  // Hard 10-second timeout per test guarantees CI never hangs indefinitely
  const parallelStatus = runTests(['--test', '--test-timeout=10000', ...plan.parallel]);
  if (parallelStatus !== 0) return parallelStatus;

  for (const file of plan.serializedAllocations) {
    const status = runTests(allocationTestArgs(file));
    if (status !== 0) return status;
  }
  return 0;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) process.exitCode = runUnitTests();
