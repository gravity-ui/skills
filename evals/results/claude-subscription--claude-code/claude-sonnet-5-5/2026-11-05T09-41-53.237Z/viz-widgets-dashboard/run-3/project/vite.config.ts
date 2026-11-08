import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Gravity UI импортирует .css из node_modules — пусть их обработает vite.
    server: { deps: { inline: [/@gravity-ui/] } },
  },
});
