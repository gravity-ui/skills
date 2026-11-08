/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Gravity UI ships ESM with CSS imports; inline it so vitest processes them.
    server: {
      deps: {
        inline: ['@gravity-ui/uikit'],
      },
    },
  },
});
