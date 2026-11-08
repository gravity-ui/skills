import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // uikit ships ESM that imports CSS; let vitest transform it instead of externalizing.
    server: {deps: {inline: [/@gravity-ui\//]}},
  },
});
