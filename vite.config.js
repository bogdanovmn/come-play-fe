import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        define: {
            'import.meta.env.BACKEND_VERSION': JSON.stringify(process.env.BACKEND_VERSION || env.VITE_BACKEND_VERSION || 'dev'),
            'import.meta.env.FRONTEND_VERSION': JSON.stringify(process.env.FRONTEND_VERSION || env.VITE_FRONTEND_VERSION || 'dev')
        },
        base: '/comeplay/'
    };
});
