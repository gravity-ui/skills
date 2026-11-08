import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @diplodoc/transform (peer-зависимость @gravity-ui/markdown-editor) обращается к `process`
      // при загрузке модуля; в браузере подставляем лёгкий шим вместо Node-модуля.
      process: fileURLToPath(new URL('./src/shims/process.ts', import.meta.url)),
    },
  },
});
