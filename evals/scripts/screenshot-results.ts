// Screenshot every finished run: results/**/run-N/project/dist is the Vite build the sandbox produced,
// so it is served statically (SPA fallback to index.html) and captured with host Playwright. Writes
// run-N/screenshot.jpg; runs that already have one are skipped. No install or build on the host.
//
//   node scripts/screenshot-results.ts [<experiment|glob>...] [--redo]
//
// Evals whose UI only appears after an interaction get one click before the capture (a dialog, a toast,
// a dropdown, a date picker). Kept here, not in evals/: a file there would change every eval fingerprint.
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const resultsDir = join(root, 'results');
const REVEAL: Record<string, string> = {
  'comp-modal-confirm': 'button',
  'comp-toast': 'button',
  'comp-actions-menu': 'button',
  'edge-calendar': 'input',
};
const redo = process.argv.includes('--redo');
const globs = process.argv.slice(2).filter((a) => a !== '--redo').map((g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`));
const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };

function* runDirs(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (!statSync(p).isDirectory()) continue;
    if (/^run-\d+$/.test(entry)) yield p;
    else yield* runDirs(p);
  }
}

function serve(dist: string): Promise<{ url: string; close: () => void }> {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = join(dist, path);
    if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html');
    res.setHeader('content-type', MIME[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => {
    const { port } = server.address() as { port: number };
    ok({ url: `http://127.0.0.1:${port}/`, close: () => server.close() });
  }));
}

const todo = [...readdirSync(resultsDir)]
  .filter((exp) => statSync(join(resultsDir, exp)).isDirectory() && (!globs.length || globs.some((g) => g.test(exp))))
  .flatMap((exp) => [...runDirs(join(resultsDir, exp))])
  .filter((run) => existsSync(join(run, 'project', 'dist', 'index.html')) && (redo || !existsSync(join(run, 'screenshot.jpg'))));
console.log(`${todo.length} run(s) to screenshot`);

const browser = await chromium.launch();
let done = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (todo.length) {
    const run = todo.shift()!;
    const site = await serve(join(run, 'project', 'dist'));
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 15_000 });
      await page.waitForTimeout(500);
      const reveal = REVEAL[run.split('/').at(-2)!];
      if (reveal) {
        await page.locator(reveal).first().click({ timeout: 3_000 }).catch(() => {});
        await page.waitForTimeout(800);
      }
      await page.screenshot({ path: join(run, 'screenshot.jpg'), type: 'jpeg', quality: 75 });
      done++;
    } catch (e) {
      console.error(`✗ ${run.slice(resultsDir.length + 1)}: ${(e as Error).message.split('\n')[0]}`);
    } finally {
      await page.close();
      site.close();
    }
  }
}));
await browser.close();
console.log(`${done} screenshot(s) written`);
