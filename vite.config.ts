import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 4140
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Ensure service worker is copied to build output
    rollupOptions: {
      input: {
        main: './index.html',
        'service-worker': './public/service-worker.js'
      }
    }
  },
  publicDir: 'public'
});