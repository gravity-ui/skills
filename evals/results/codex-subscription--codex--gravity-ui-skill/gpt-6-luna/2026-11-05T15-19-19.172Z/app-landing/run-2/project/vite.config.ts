import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: [{find: /^~/, replacement: ''}],
  },
  plugins: [react()],
});
