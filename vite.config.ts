import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Voxel-Toy-Studio/', // GitHub Pages仓库名称
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
