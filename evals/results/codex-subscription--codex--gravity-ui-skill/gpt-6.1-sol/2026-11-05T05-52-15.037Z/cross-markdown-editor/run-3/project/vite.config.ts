import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // markdown-it 13 imports Node's punycode name; use its browser implementation.
    alias: {punycode: 'punycode/punycode.es6.js'},
  },
});
