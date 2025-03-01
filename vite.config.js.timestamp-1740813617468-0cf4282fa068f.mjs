// vite.config.js
import { defineConfig } from "file:///E:/GIT/REACT/doctors/M-H-C%20Assistant/node_modules/vite/dist/node/index.js";
import react from "file:///E:/GIT/REACT/doctors/M-H-C%20Assistant/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///E:/GIT/REACT/doctors/M-H-C%20Assistant/node_modules/vite-plugin-pwa/dist/index.js";
import { compression } from "file:///E:/GIT/REACT/doctors/M-H-C%20Assistant/node_modules/vite-plugin-compression2/dist/index.mjs";
import { visualizer } from "file:///E:/GIT/REACT/doctors/M-H-C%20Assistant/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Add fast refresh options for better development experience
      fastRefresh: true
    }),
    VitePWA({
      registerType: "prompt",
      // Change to prompt for better control
      devOptions: {
        enabled: true,
        type: "module"
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg"
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
        ]
      }
    }),
    // Compression plugins remain the same
    mode === "analyze" && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  build: {
    // Build configuration remains the same
  },
  server: {
    port: 3e3,
    strictPort: true,
    open: true,
    hmr: {
      protocol: "ws",
      host: "localhost"
    }
  },
  preview: {
    port: 4173,
    strictPort: true,
    open: true
  },
  // Define the missing token to fix the error
  define: {
    __WS_TOKEN__: JSON.stringify("development-ws-token")
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHSVRcXFxcUkVBQ1RcXFxcZG9jdG9yc1xcXFxNLUgtQyBBc3Npc3RhbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdJVFxcXFxSRUFDVFxcXFxkb2N0b3JzXFxcXE0tSC1DIEFzc2lzdGFudFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR0lUL1JFQUNUL2RvY3RvcnMvTS1ILUMlMjBBc3Npc3RhbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcbmltcG9ydCB7IGNvbXByZXNzaW9uIH0gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24yJztcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KHtcclxuICAgICAgLy8gQWRkIGZhc3QgcmVmcmVzaCBvcHRpb25zIGZvciBiZXR0ZXIgZGV2ZWxvcG1lbnQgZXhwZXJpZW5jZVxyXG4gICAgICBmYXN0UmVmcmVzaDogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ3Byb21wdCcsIC8vIENoYW5nZSB0byBwcm9tcHQgZm9yIGJldHRlciBjb250cm9sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgIHR5cGU6ICdtb2R1bGUnLFxyXG4gICAgICB9LFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbXHJcbiAgICAgICAgJ2Zhdmljb24uaWNvJyxcclxuICAgICAgICAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnLFxyXG4gICAgICAgICdtYXNrZWQtaWNvbi5zdmcnLFxyXG4gICAgICBdLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIC8vIE1hbmlmZXN0IGNvbmZpZ3VyYXRpb24gcmVtYWlucyB0aGUgc2FtZVxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgLy8gRW5hYmxlIHRoZXNlIGZvciBpbW1lZGlhdGUgdXBkYXRlc1xyXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcclxuICAgICAgICBza2lwV2FpdGluZzogdHJ1ZSxcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAgLy8gUnVudGltZSBjYWNoaW5nIGNvbmZpZ3VyYXRpb24gcmVtYWlucyB0aGUgc2FtZVxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIC8vIENvbXByZXNzaW9uIHBsdWdpbnMgcmVtYWluIHRoZSBzYW1lXHJcbiAgICBtb2RlID09PSAnYW5hbHl6ZScgJiZcclxuICAgICAgdmlzdWFsaXplcih7XHJcbiAgICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgICBicm90bGlTaXplOiB0cnVlLFxyXG4gICAgICB9KSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gQnVpbGQgY29uZmlndXJhdGlvbiByZW1haW5zIHRoZSBzYW1lXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxyXG4gICAgb3BlbjogdHJ1ZSxcclxuICAgIGhtcjoge1xyXG4gICAgICBwcm90b2NvbDogJ3dzJyxcclxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcHJldmlldzoge1xyXG4gICAgcG9ydDogNDE3MyxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBvcGVuOiB0cnVlLFxyXG4gIH0sXHJcbiAgLy8gRGVmaW5lIHRoZSBtaXNzaW5nIHRva2VuIHRvIGZpeCB0aGUgZXJyb3JcclxuICBkZWZpbmU6IHtcclxuICAgIF9fV1NfVE9LRU5fXzogSlNPTi5zdHJpbmdpZnkoJ2RldmVsb3BtZW50LXdzLXRva2VuJyksXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBTLFNBQVMsb0JBQW9CO0FBQ3ZVLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxtQkFBbUI7QUFDNUIsU0FBUyxrQkFBa0I7QUFHM0IsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxNQUVKLGFBQWE7QUFBQSxJQUNmLENBQUM7QUFBQSxJQUNELFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQTtBQUFBLE1BQ2QsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLFFBQ1QsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBLGVBQWU7QUFBQSxRQUNiO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFVO0FBQUE7QUFBQSxNQUVWO0FBQUEsTUFDQSxTQUFTO0FBQUE7QUFBQSxRQUVQLGNBQWM7QUFBQSxRQUNkLGFBQWE7QUFBQSxRQUNiLGdCQUFnQjtBQUFBO0FBQUEsUUFFaEI7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUVELFNBQVMsYUFDUCxXQUFXO0FBQUEsTUFDVCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDTCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLE9BQU87QUFBQTtBQUFBLEVBRVA7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLEVBQ1I7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sY0FBYyxLQUFLLFVBQVUsc0JBQXNCO0FBQUEsRUFDckQ7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
