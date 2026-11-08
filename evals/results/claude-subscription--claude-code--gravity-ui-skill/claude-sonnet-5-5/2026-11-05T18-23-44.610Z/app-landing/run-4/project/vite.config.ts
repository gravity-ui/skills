import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {
    // page-constructor styles use webpack-style `~pkg` imports
    alias: [
      { find: /^~/, replacement: '' },
      // page-constructor imports Node's `url` in browser code
      { find: /^url$/, replacement: 'url/' },
    ],
  },
  plugins: [
    react(),
    // Required by page-constructor: its blocks are loaded via dynamic imports.
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
});
