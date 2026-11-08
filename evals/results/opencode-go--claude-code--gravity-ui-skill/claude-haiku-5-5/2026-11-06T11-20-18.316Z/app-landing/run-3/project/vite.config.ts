import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @gravity-ui/page-constructor styles use legacy webpack-style `~pkg` imports, which Vite does not resolve.
      { find: /^~(?=@)/, replacement: '' },
      // page-constructor imports Node's `url` (used only by its Share block); use the browser polyfill instead.
      { find: /^url$/, replacement: path.resolve(__dirname, 'node_modules/url/url.js') },
    ],
  },
});
