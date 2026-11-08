import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {
    alias: [
      {find: '~@diplodoc/transform', replacement: new URL('./node_modules/@diplodoc/transform', import.meta.url).pathname},
      {find: '~@gravity-ui/uikit', replacement: new URL('./node_modules/@gravity-ui/uikit', import.meta.url).pathname},
      {find: 'url', replacement: 'url/'},
    ],
  },
  plugins: [react(), dynamicImport({
    filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor/') ? true : undefined,
  })],
});
