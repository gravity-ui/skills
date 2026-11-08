/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {
    // page-constructor styles use webpack-style `~pkg` imports
    alias: [
      { find: /^~(.*)$/, replacement: '$1' },
      // page-constructor imports Node's `url`; use the browser polyfill
      { find: /^url$/, replacement: 'url/' },
    ],
  },
  plugins: [
    react(),
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
});
