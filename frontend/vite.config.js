import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
const { VITE_BACKEND_URL, ENVIRONMENT } = process.env;
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: ENVIRONMENT === 'development' ? 'http://localhost:5000' : VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
