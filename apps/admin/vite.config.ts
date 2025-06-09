import path from "path"
import{ defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    watch: {
      ignored: ['!../../shared/**']
    }
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src', 'app'),
      '@features': path.resolve(__dirname, 'src', 'features'),
      '@entities': path.resolve(__dirname, 'src', 'entities'),
      '@shared': path.resolve(__dirname, 'src', 'shared'),
      '@pages': path.resolve(__dirname, 'src', 'pages'),
      '@widgets': path.resolve(__dirname, 'src', 'widgets'),
      '@core': path.resolve(__dirname, '../../shared/src'),
    },
  },
})
