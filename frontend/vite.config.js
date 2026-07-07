import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
 build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
    },
  },
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
          return 'vendor';
        }
        if (id.includes('node_modules/recharts')) {
          return 'charts';
        }
      },
    },
  },
},
  server: {
    port: 3000,
    headers: {
      // SEO-friendly headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})