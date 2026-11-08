import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react(), dynamicImport()],
  resolve: {
    alias: [
      {find: /^~/, replacement: ''},
      {find: /^url$/, replacement: require.resolve('url/')},
    ],
  },
});
