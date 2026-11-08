import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // uikit импортирует .css внутри ESM-модулей — для Node их нужно прогонять через Vite.
    server: { deps: { inline: [/@gravity-ui\//] } },
  },
});
