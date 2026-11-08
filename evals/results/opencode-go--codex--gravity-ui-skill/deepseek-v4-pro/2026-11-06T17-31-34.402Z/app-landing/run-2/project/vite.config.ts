import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';
import {nodePolyfills} from 'vite-plugin-node-polyfills';
import path from 'path';
import fs from 'fs';

const nodeModules = path.resolve(__dirname, 'node_modules');

function resolveTilde(id: string): string | null {
  if (!id.startsWith('~')) return null;
  const cleaned = id.slice(1);
  const candidate = path.join(nodeModules, cleaned);
  try {
    if (fs.statSync(candidate).isFile()) return candidate;
  } catch {}
  try {
    const pkgJsonPath = path.join(nodeModules, cleaned, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    const entry = pkg.style || pkg.main;
    if (entry) return path.join(nodeModules, cleaned, entry);
  } catch {}
  return candidate;
}

export default defineConfig({
  plugins: [react(), dynamicImport(), nodePolyfills()],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(nodeModules, '$1'),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        importer(url: string) {
          if (url.startsWith('~')) {
            const result = resolveTilde(url);
            if (result) return {file: result};
          }
          return null;
        },
      },
    },
  },
});
