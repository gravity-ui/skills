import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [
    react(),
    // Required by @gravity-ui/page-constructor under Vite (see its README "Note about Vite").
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
  resolve: {
    // page-constructor CSS uses webpack-style `~package/...` imports.
    alias: [{ find: /^~(?=@)/, replacement: '' }],
  },
});
