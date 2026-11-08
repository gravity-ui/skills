/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    css: false,
    server: {
      deps: {
        // стили uikit импортируются из ESM-сборки; vitest должен обработать их сам
        inline: [/@gravity-ui\/uikit/],
      },
    },
  },
});
