import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    // Diplodoc and markdown-it also target Node; provide their browser dependencies.
    nodePolyfills({include: ['fs', 'path', 'process', 'punycode', 'url']}),
  ],
});
