// Service-worker / release consistency check. Run: node dev/check_sw.mjs
//
// Verifies the auto-update contract that makes "force refresh on new content"
// work: (1) every precached path exists on disk, (2) every local asset
// referenced by index.html is in the precache (else it won't work offline and
// won't be refreshed atomically with the release), (3) all ?v=N cache-bust
// params agree with each other and with the CACHE name in sw.js — a mismatch
// means returning users would not be promoted onto the new version.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sw = readFileSync(root + 'sw.js', 'utf8');
const html = readFileSync(root + 'index.html', 'utf8');
let problems = 0;
const fail = (msg) => { console.error('FAIL ' + msg); problems++; };

// 1. CACHE name and version params.
const cacheM = sw.match(/const CACHE = 'pca-v(\d+)'/);
if (!cacheM) fail('sw.js: cannot find CACHE name');
const swVer = cacheM && cacheM[1];
const vers = [...html.matchAll(/\?v=(\d+)/g)].map(m => m[1]);
if (!vers.length) fail('index.html: no ?v=N cache-bust params found');
const uniq = [...new Set(vers)];
if (uniq.length > 1) fail(`index.html: mixed ?v= values: ${uniq.join(', ')}`);
if (swVer && uniq.length === 1 && uniq[0] !== swVer) {
  fail(`version mismatch: index.html ?v=${uniq[0]} vs sw.js CACHE pca-v${swVer}`);
}

// 2. Precache entries exist on disk.
const preM = sw.match(/const PRECACHE = \[([\s\S]*?)\];/);
if (!preM) fail('sw.js: cannot find PRECACHE list');
const precache = preM
  ? [...preM[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(p => p !== './')
  : [];
for (const p of precache) {
  if (!existsSync(root + p)) fail(`sw.js precaches missing file: ${p}`);
}

// 3. Every local asset referenced by index.html is precached.
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(m => m[1])
  .filter(u => !/^(https?:|#|data:)/.test(u))
  .map(u => u.replace(/\?v=\d+$/, ''));
const preSet = new Set(precache);
for (const r of refs) {
  if (!preSet.has(r)) fail(`index.html references ${r} but it is not in the sw.js PRECACHE`);
}

// 4. ES-module imports under js/ must also be precached (they load at runtime).
const seen = new Set();
const queue = ['js/app/pca.js'];
while (queue.length) {
  const f = queue.pop();
  if (seen.has(f) || !existsSync(root + f)) continue;
  seen.add(f);
  const src = readFileSync(root + f, 'utf8');
  for (const m of src.matchAll(/from\s+'([^']+)'/g)) {
    const rel = new URL(m[1], 'file:///' + f).pathname.slice(1);
    queue.push(rel);
  }
}
for (const f of seen) {
  if (!preSet.has(f)) fail(`module ${f} is imported at runtime but not in the sw.js PRECACHE`);
}

console.log(problems
  ? `${problems} problem(s)`
  : `OK — sw cache pca-v${swVer}, ${precache.length} precached files, ${seen.size} runtime modules, versions consistent`);
process.exit(problems ? 1 : 0);
