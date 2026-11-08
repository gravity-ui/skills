/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        // Gravity UI импортирует CSS из ESM-сборки — пусть его обработает Vite, а не Node.
        server: { deps: { inline: [/@gravity-ui\//] } },
    },
});
