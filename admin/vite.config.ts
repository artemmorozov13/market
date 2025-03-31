import path from "path"
import{ defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src', 'app'),
      '@features': path.resolve(__dirname, 'src', 'features'),
      '@entities': path.resolve(__dirname, 'src', 'entities'),
      '@shared': path.resolve(__dirname, 'src', 'shared'),
      '@pages': path.resolve(__dirname, 'src', 'pages'),
      '@widgets': path.resolve(__dirname, 'src', 'widgets'),
    },
  },
})
