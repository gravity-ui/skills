import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [
    react(),
    dynamicImport({
      filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor'),
    }),
  ],
  resolve: {
    alias: [
      // page-constructor's compiled CSS/SCSS uses webpack-style `~` imports
      // that mean "resolve from node_modules"
      {
        find: /^~/,
        replacement: fileURLToPath(new URL('./node_modules/', import.meta.url)),
      },
      // page-constructor's client build imports Node's `url` builtin in one util
      {
        find: 'url',
        replacement: fileURLToPath(new URL('./src/shims/url.ts', import.meta.url)),
      },
    ],
  },
});
