/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Компоненты uikit импортируют CSS — прогоняем пакет через пайплайн Vite, чтобы Node не спотыкался на .css.
    server: { deps: { inline: ['@gravity-ui/uikit'] } },
  },
});
