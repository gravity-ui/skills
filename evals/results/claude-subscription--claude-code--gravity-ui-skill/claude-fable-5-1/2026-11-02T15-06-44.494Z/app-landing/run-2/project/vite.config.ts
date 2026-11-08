import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    // Required by @gravity-ui/page-constructor: its blocks are loaded via dynamic imports.
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
  resolve: {
    alias: [
      // page-constructor's SCSS uses webpack-style `~pkg/...` imports; strip the tilde for Vite.
      { find: /^~(.+)/, replacement: '$1' },
      // page-constructor imports Node's `url` module; point it at the browser polyfill.
      { find: /^url$/, replacement: require.resolve('url/') },
    ],
  },
});
