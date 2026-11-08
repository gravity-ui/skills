import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~@gravity-ui/uikit/styles/styles.css': resolve(
        'node_modules/@gravity-ui/uikit/styles/styles.css',
      ),
      url: resolve('src/shims/url.ts'),
      '~@diplodoc/transform/dist/css/yfm.css': resolve(
        'node_modules/@diplodoc/transform/dist/css/yfm.css',
      ),
    },
  },
});
