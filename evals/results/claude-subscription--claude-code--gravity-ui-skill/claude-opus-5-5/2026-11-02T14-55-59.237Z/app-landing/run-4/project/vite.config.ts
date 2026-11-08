import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [
    react(),
    // Required by @gravity-ui/page-constructor: its blocks are loaded via dynamic imports.
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
  resolve: {
    // page-constructor styles use webpack-style `~pkg/...` imports; strip the tilde for Vite.
    alias: [{ find: /^~(.*)$/, replacement: '$1' }],
  },
});
