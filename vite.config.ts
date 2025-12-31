import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', 
    strictPort: true,
    allowedHosts: ['.ngrok-free.dev'],
    hmr: {
      protocol: 'wss', 
      host: 'unstreamed-unnutritive-wesley.ngrok-free.dev',
      // 🛑 REMOVED 'port: 443' to prevent local binding errors
      // ✅ KEPT 'clientPort: 443' so the phone browser knows to use HTTPS
      clientPort: 443 
    },
  },
})