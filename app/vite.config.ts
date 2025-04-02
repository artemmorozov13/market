import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dotenv from 'dotenv'
import mkcert from'vite-plugin-mkcert'

dotenv.config() 

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: '/app/',
    plugins: [react(), mkcert()],
    define: {
      'process.env': env
    },
    server: {
      host: "127.0.0.1",
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@features': path.resolve(__dirname, './src/features'),
        '@widgets': path.resolve(__dirname, './src/widgets'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@shared': path.resolve(__dirname, './src/shared'),
      }
    }
  }
})
