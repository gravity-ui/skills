import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @gravity-ui/page-constructor styles use webpack-style `~pkg/...` imports in CSS
      // (`@import '~@gravity-ui/uikit/...'`), which Vite does not resolve by default.
      { find: /^~/, replacement: '' },
      // @gravity-ui/page-constructor imports Node's `url` module in browser code
      // (`getAbsolutePath`). Point it at the browser polyfill instead of Vite's external stub.
      { find: /^url$/, replacement: fileURLToPath(new URL('./node_modules/url/url.js', import.meta.url)) },
    ],
  },
});
