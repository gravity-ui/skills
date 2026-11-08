import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  resolve: {
    alias: {
      url: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/node-url-shim.ts'),
      '~@gravity-ui': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'node_modules/@gravity-ui'),
      '~@diplodoc': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'node_modules/@diplodoc'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        importer: [
          (url: string) =>
            url.startsWith('~')
              ? { file: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'node_modules', url.slice(1)) }
              : null,
        ],
      },
    },
  },
  plugins: [react(), dynamicImport()],
});
