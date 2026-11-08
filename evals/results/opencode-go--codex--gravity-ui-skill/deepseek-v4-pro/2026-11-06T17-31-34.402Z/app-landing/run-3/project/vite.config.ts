import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dynamicImport(),
    nodePolyfills({ include: ['url'] }),
  ],
  resolve: {
    alias: {
      '~@gravity-ui/uikit': path.resolve('node_modules/@gravity-ui/uikit'),
      '~@diplodoc/transform': path.resolve('node_modules/@diplodoc/transform'),
    },
  },
});
