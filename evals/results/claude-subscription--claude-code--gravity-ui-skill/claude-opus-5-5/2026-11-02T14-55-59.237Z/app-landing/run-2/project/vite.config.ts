import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {
    // page-constructor's SCSS uses webpack-style `~@scope/pkg` CSS imports.
    alias: [{ find: /^~(@[^/]+\/.*)$/, replacement: '$1' }],
  },
  plugins: [
    react(),
    // page-constructor loads blocks via dynamic imports, which Vite needs this plugin for.
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
});
