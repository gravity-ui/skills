import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {alias: {'~@gravity-ui/uikit': '@gravity-ui/uikit', '~@diplodoc/transform': '@diplodoc/transform', url: 'url/'}},
  plugins: [react(), dynamicImport({filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor/') ? true : undefined})],
});
