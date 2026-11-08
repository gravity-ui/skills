import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      punycode: 'punycode/punycode.js',
      process: 'process/browser',
    },
  },
});
