import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [
    react(),
    // Требуется page-constructor: динамические импорты блоков под Vite.
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
  resolve: {
    // CSS page-constructor использует webpack-префикс `~` в @import;
    // Vite его не понимает, поэтому разворачиваем только эти два пакета.
    alias: [
      { find: /^~@diplodoc\/transform\//, replacement: '@diplodoc/transform/' },
      { find: /^~@gravity-ui\/uikit\//, replacement: '@gravity-ui/uikit/' },
    ],
  },
});
