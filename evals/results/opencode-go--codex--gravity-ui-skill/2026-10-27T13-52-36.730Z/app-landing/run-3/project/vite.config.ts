import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: fileURLToPath(new URL('./node_modules/', import.meta.url)),
      },
    ],
  },
});
