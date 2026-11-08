import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    server: {
      deps: {
        // uikit импортирует CSS внутри ESM-сборки; инлайним, чтобы vitest обработал эти импорты
        inline: ['@gravity-ui/uikit'],
      },
    },
  },
});
