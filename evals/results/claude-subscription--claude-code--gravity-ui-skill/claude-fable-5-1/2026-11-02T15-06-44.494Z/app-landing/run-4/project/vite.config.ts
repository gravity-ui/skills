import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @gravity-ui/page-constructor styles use webpack-style "~@scope/pkg" imports
      { find: /^~(?=@)/, replacement: '' },
      // @gravity-ui/page-constructor imports Node's "url" module; point it at the browser polyfill
      { find: /^url$/, replacement: 'url/' },
    ],
  },
});
