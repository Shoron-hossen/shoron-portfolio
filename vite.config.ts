import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API requests to live Cloudflare D1 database & R2 upload
      '/api': {
        target: 'https://shoron-portfolio.pages.dev',
        changeOrigin: true,
        secure: false,
      },
      // Proxy media requests to live Cloudflare R2 storage
      '/media': {
        target: 'https://shoron-portfolio.pages.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
