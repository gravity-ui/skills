import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [react(), dynamicImport()],
  resolve: {
    alias: [
      // page-constructor styles use webpack-style `~pkg/...` imports
      { find: /^~(.*)$/, replacement: '$1' },
      // page-constructor imports Node's `url` module; use the browser polyfill
      { find: /^url$/, replacement: 'url/' },
    ],
  },
});
