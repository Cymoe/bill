import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({  
  server: {
    port: 3000,
    strictPort: true, // Force port 3000, fail if not available
    proxy: {
      '/blog': {
        target: 'http://127.0.0.1:4321',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxy for HMR
        // Don't rewrite the path since Astro expects /blog
      }
    }
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
});
