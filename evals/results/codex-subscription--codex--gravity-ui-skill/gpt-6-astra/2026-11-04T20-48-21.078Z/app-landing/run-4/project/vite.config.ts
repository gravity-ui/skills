import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [react(), dynamicImport()],
  resolve: {
    alias: [
      {find: /^~(.*)$/, replacement: '$1'},
      {find: /^url$/, replacement: 'url/'},
    ],
  },
});
