import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1500, // Increase the chunk size warning limit
    },
    define: {
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
    }
});