import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'main.js'),
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].js'
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname)
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'preload.js'),
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].js'
        }
      }
    }
  },
  renderer: {
    root: 'src',
    plugins: [react()],
    base: './',
    build: {
      outDir: '../dist/renderer',
      emptyOutDir: true
    },
    server: {
      port: 5173,
      open: true
    }
  }
})
