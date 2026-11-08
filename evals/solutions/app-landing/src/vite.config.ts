import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// @gravity-ui/page-constructor dist CSS uses webpack-style `~package/...` imports
// (e.g. `@import '~@diplodoc/transform/dist/css/yfm.css'`); Vite needs the `~`
// prefix stripped to resolve them from node_modules.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^~/, replacement: '' }],
  },
});
