import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Walk static imports only: dynamic imports must stay outside the startup graph.
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
function staticDependencies(key, visited = new Set()) {
  if (visited.has(key)) return visited;
  visited.add(key);
  for (const dependency of manifest[key]?.imports ?? []) staticDependencies(dependency, visited);
  return visited;
}
const entry = Object.keys(manifest).find((key) => manifest[key].isEntry);
assert(entry, 'Missing application entry');
const startup = staticDependencies(entry);
const renderers = ['GravityChartsWidget', 'YagrWidget'].map((name) => {
  const key = Object.keys(manifest).find((key) => key.endsWith(`/${name}.js`));
  assert(key, `${name} must exist as a separate chunk`);
  assert(manifest[key].isDynamicEntry, `${name} must be dynamically imported`);
  assert(!startup.has(key), `${name} must not load with the app entry`);
  return key;
});
assert(!staticDependencies(renderers[0]).has(renderers[1]), 'Sales must not preload monitoring');
assert(!staticDependencies(renderers[1]).has(renderers[0]), 'Monitoring must not preload sales');
console.log('Lazy loading verified: both chart renderers are independent dynamic chunks.');
