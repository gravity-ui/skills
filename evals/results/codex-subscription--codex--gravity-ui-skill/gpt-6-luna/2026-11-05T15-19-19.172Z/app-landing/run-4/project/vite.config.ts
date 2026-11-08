import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
  resolve: {
    alias: {
      url: resolve(process.cwd(), 'node_modules/url/'),
      '~@gravity-ui/uikit/styles/styles.css': resolve(
        process.cwd(),
        'node_modules/@gravity-ui/uikit/styles/styles.css',
      ),
      '~@diplodoc/transform/dist/css/yfm.css': resolve(
        process.cwd(),
        'node_modules/@diplodoc/transform/dist/css/yfm.css',
      ),
    },
  },
});
