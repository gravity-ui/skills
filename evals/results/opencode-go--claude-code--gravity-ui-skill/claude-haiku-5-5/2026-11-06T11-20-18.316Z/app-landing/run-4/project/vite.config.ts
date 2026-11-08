import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @gravity-ui/page-constructor ships CSS with webpack-style `~pkg/...` imports.
      { find: /^~/, replacement: '' },
      // @gravity-ui/page-constructor imports Node's `url` in one browser utility; use the browser build.
      { find: /^url$/, replacement: fileURLToPath(new URL('./node_modules/url/url.js', import.meta.url)) },
    ],
  },
});
