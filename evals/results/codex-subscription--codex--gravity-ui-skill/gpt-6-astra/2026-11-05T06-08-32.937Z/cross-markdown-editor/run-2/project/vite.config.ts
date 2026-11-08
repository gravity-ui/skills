import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // markdown-it needs the browser implementation for internationalized links.
    alias: {punycode: 'punycode/'},
  },
});
