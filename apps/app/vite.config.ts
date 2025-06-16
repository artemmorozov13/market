import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config() 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: '/app/',
    plugins: [react()],
    define: {
      'process.env': env
    },
    server: {
      host: "0.0.0.0",
      port: 3002,
      watch: {
        ignored: ['!../../shared/**']
      }
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
        '@core': path.resolve(__dirname, '../../shared/src'),
      }
    }
  }
})
