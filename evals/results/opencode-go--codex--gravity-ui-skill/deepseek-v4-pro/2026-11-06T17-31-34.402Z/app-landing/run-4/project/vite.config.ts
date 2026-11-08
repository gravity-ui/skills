import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImport from 'vite-plugin-dynamic-import';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sassTildeImporter(url: string) {
  if (url.startsWith('~')) {
    const resolved = path.resolve(__dirname, 'node_modules', url.slice(1));
    return { file: resolved };
  }
  return null;
}

export default defineConfig({
  plugins: [react(), dynamicImport()],
  resolve: {
    alias: {
      url: path.resolve(__dirname, 'src/shims/url.ts'),
      '~@diplodoc': path.resolve('node_modules/@diplodoc'),
      '~@gravity-ui': path.resolve('node_modules/@gravity-ui'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        importers: [sassTildeImporter],
      },
    },
  },
});
