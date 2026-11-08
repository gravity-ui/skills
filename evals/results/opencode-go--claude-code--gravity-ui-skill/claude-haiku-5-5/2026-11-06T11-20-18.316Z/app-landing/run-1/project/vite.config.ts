import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @gravity-ui/page-constructor styles use webpack-style `~pkg` imports, which Vite does not resolve.
      { find: /^~/, replacement: '' },
      // @gravity-ui/page-constructor imports Node's `url` (parse/format); give the browser a polyfill instead.
      { find: /^url$/, replacement: 'url/url.js' },
    ],
  },
});
