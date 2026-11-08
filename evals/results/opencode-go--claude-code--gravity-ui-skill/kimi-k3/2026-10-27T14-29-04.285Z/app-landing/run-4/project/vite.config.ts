import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // page-constructor's prebuilt styles.css uses webpack-style "~pkg" imports
      {find: '~@gravity-ui/uikit', replacement: '@gravity-ui/uikit'},
      {find: '~@diplodoc/transform', replacement: '@diplodoc/transform'},
      // its ESM build imports Node's `url` module — point it at a browser shim
      {find: /^url$/, replacement: fileURLToPath(new URL('./src/url-shim.ts', import.meta.url))},
    ],
  },
});
