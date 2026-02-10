import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/odoo-api': {
        target: 'https://jaago-foundation.odoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/odoo-api/, ''),
        secure: false, // Allow self-signed certs or proxy issues
        headers: {
          'Origin': 'https://jaago-foundation.odoo.com', // Spoof Origin to satisfy Odoo CSRF/CORS checks
        }
      }
    }
  }
})
