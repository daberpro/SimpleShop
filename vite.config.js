import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        watch: {
            usePolling: true
        },
        allowedHosts: [
            '9c65-36-75-106-247.ngrok-free.app'
        ]
    }
});
