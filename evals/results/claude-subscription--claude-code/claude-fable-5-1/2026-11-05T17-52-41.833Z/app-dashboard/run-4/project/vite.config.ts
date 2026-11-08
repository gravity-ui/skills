import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Gravity UI ships ESM with CSS imports; inline it so vitest processes those imports.
    server: { deps: { inline: [/@gravity-ui/] } },
  },
});
