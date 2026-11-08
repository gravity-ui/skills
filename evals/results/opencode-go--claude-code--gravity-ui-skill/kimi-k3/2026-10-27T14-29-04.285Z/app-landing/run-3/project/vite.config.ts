import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // page-constructor's compiled CSS uses webpack-style tilde imports
      '~@diplodoc/transform': '@diplodoc/transform',
      '~@gravity-ui/uikit': '@gravity-ui/uikit',
      // page-constructor imports Node's `url` builtin in code paths unused here
      url: fileURLToPath(new URL('./src/url-shim.ts', import.meta.url)),
    },
  },
});
