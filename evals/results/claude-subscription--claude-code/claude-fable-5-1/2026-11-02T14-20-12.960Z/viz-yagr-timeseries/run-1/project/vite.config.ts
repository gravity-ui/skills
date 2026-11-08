/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Компоненты Gravity UI импортируют CSS: пусть их обрабатывает vite, а не node.
    server: {deps: {inline: [/@gravity-ui\//]}},
    setupFiles: ['./src/test/setup.ts'],
  },
});
