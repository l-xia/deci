import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ingest': {
        target: 'https://us.i.posthog.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ingest/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
        },
      },
    },
  },
})
