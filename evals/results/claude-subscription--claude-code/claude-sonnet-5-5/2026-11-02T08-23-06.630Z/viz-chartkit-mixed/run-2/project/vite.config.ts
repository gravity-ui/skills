import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Пакеты @gravity-ui импортируют .css — их должен обрабатывать Vite, а не голый Node
    server: {deps: {inline: [/@gravity-ui/]}},
  },
});
