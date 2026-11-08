import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // uikit импортирует CSS из своих ESM-файлов; Node этого не умеет, поэтому пропускаем пакет через Vite.
    server: { deps: { inline: [/@gravity-ui\//] } },
  },
});
