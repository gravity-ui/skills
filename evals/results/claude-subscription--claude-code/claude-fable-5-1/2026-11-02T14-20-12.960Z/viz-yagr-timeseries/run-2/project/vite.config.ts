import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        // uikit и yagr поставляются как ESM с импортами .css — пусть их обрабатывает Vite, а не Node.
        server: {deps: {inline: ['@gravity-ui/uikit', '@gravity-ui/yagr']}},
        css: false,
    },
});
