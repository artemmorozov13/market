import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      external: [
        'typeorm',
        'reflect-metadata',
        'bcryptjs',
        'js-cookie'
      ],
      output: {
        preserveModules: true,
        exports: 'named',
        globals: {
          'typeorm': 'typeorm',
          'reflect-metadata': 'reflectMetadata'
        }
      }
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['**/__tests__/**'],
      rollupTypes: true,
      compilerOptions: {
        composite: false
      }
    })
  ]
})