import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, ['DEV_TUNNEL_HOST', 'API_PROXY_TARGET'])

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': import.meta.dirname + '/src',
      },
    },
    server: {
      allowedHosts: env.DEV_TUNNEL_HOST ? [env.DEV_TUNNEL_HOST] : [],
      proxy: {
        '^/api(?:/|$)': {
          target: env.API_PROXY_TARGET || 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
