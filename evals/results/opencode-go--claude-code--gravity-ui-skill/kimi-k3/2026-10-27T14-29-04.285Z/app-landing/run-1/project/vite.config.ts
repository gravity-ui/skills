import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @gravity-ui/page-constructor's styles use webpack-style "~pkg/..." imports
      {
        find: /^~/,
        replacement: fileURLToPath(new URL('./node_modules/', import.meta.url)),
      },
      // @gravity-ui/page-constructor imports Node's "url" builtin in client code;
      // route it to the browser polyfill
      {
        find: /^url$/,
        replacement: fileURLToPath(new URL('./node_modules/url/url.js', import.meta.url)),
      },
    ],
  },
});
