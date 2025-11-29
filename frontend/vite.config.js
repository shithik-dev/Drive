import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // Load environment variables based on current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT), // Use .env value
      host: true, // Allow external access
      proxy: {
        '/api': {
          target: env.VITE_API_URL, // Use .env value
          changeOrigin: true
        }
      }
    }
  })
}
