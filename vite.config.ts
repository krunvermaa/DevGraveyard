import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        sourcemap: false,
        chunkSizeWarningLimit: 800,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('three')) {
                  return 'three-vendor';
                }
                if (id.includes('firebase')) {
                  return 'firebase-vendor';
                }
                if (id.includes('motion') || id.includes('framer-motion')) {
                  return 'motion-vendor';
                }
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'react-vendor';
                }
              }
            }
          }
        }
      }
    };
});

