import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [react(), dynamicImport()],
  resolve: {
    // page-constructor's compiled CSS uses webpack-style `~pkg` imports
    alias: [{ find: /^~(@(?:diplodoc|gravity-ui)\/)/, replacement: '$1' }],
  },
});
