import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Пакеты Gravity UI импортируют CSS из ESM — их нужно прогонять через Vite, а не Node.
    server: {deps: {inline: ['@gravity-ui/uikit', '@gravity-ui/yagr']}},
  },
});
