/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Process Gravity UI through Vite so its CSS imports resolve in tests.
    server: { deps: { inline: ['@gravity-ui/uikit'] } },
  },
});
