import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), dynamicImport(), nodePolyfills({include: ['url']})],
  resolve: {
    alias: [{find: /^~(.+)$/, replacement: '$1'}],
  },
});
