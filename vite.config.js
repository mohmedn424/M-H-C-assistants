import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Add fast refresh options for better development experience
      fastRefresh: true,
    }),
    VitePWA({
      registerType: 'prompt', // Change to prompt for better control
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
      ],
      manifest: {
        // Manifest configuration remains the same
      },
      workbox: {
        // Enable these for immediate updates
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          // Runtime caching configuration remains the same
        ],
      },
    }),
    // Compression plugins remain the same
    mode === 'analyze' &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  build: {
    // Build configuration remains the same
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    open: true,
  },
  // Define the missing token to fix the error
  define: {
    __WS_TOKEN__: JSON.stringify('development-ws-token'),
  },
}));
