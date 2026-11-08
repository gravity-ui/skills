import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Markdown preview uses @diplodoc/transform and markdown-it, which require
// Node built-ins ("process", "punycode") at load/call time. Point them at
// their browser-compatible packages so Vite does not externalize them.
const nodeModule = (path: string) => fileURLToPath(new URL(`./node_modules/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^process$/, replacement: nodeModule('process/browser.js') },
      { find: /^punycode$/, replacement: nodeModule('punycode/punycode.js') },
    ],
  },
});
