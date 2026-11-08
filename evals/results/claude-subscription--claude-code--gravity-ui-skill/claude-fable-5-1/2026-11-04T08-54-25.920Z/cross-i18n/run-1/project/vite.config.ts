import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // uikit ESM modules import .css files; let Vite process them instead of Node.
    server: { deps: { inline: ['@gravity-ui/uikit'] } },
  },
});
