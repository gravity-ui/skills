import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {
    // page-constructor CSS imports uikit/diplodoc styles with a webpack-style `~` prefix.
    alias: [{ find: /^~(?=@)/, replacement: '' }],
  },
  plugins: [
    react(),
    // Required by @gravity-ui/page-constructor for its dynamic block imports under Vite.
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
});
