import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// tools/compare-cold-start.mjs
// Alternate fresh Chrome processes for both variants, with the same source tree and CPU/cache settings.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'verification/cold-start');
const baselineSource = JSON.parse(fs.readFileSync(path.join(evidence, 'baseline-source.json')));
const afterSource = JSON.parse(fs.readFileSync(path.join(evidence, 'after-source.json')));
assert.equal(baselineSource.fingerprint, afterSource.fingerprint, 'Comparison source trees differ');
const samples = [];
for (let round = 0; round < 7; round++) {
  for (const variant of round % 2 ? ['after', 'baseline'] : ['baseline', 'after']) {
    const output = path.join(evidence, `${variant}-trial-${round}.json`);
    const result = spawnSync(process.execPath, [path.join(root, 'tools/measure-cold-start.mjs')], {
      cwd: root,
      env: { ...process.env, FOLIA_STARTUP_RUNS: '1', FOLIA_STARTUP_ASSETS: `verification/cold-start/${variant}-web`, FOLIA_STARTUP_OUTPUT: output },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    samples.push({ variant, round, ...JSON.parse(fs.readFileSync(output)).samples[0] });
    console.log(`Completed ${variant} round ${round + 1}`);
  }
}
const medians = Object.fromEntries(['baseline', 'after'].map(variant => {
  const matching = samples.filter(sample => sample.variant === variant);
  const median = key => matching.map(sample => sample[key]).sort((a, b) => a - b)[Math.floor(matching.length / 2)];
  return [variant, { readyMs: median('readyMs'), paintMs: median('paintMs'), scriptBytes: median('scriptBytes'), longTaskMs: median('longTaskMs') }];
}));
const report = { sourceFingerprint: baselineSource.fingerprint, runsPerVariant: 7, cpuThrottle: 4, freshBrowserPerSample: true,
  medians, samples, limitation: 'Windows Chrome Web startup with mocked native host and offline providers; not HarmonyOS device cold-launch timing.' };
fs.writeFileSync(path.join(evidence, 'comparison.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(medians, null, 2));
