import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {alias: [
    {find: /^~(.*)$/, replacement: '$1'},
    {find: /^url$/, replacement: 'url/'},
  ]},
  plugins: [react(), dynamicImport({filter: (id) => id.includes('/node_modules/@gravity-ui/page-constructor')})],
});
