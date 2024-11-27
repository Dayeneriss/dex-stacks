import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [react()]
})
=======
plugins: [react()],
root: '.',
publicDir: 'public',
server: {
  port: 5174,
  open: true
},
build: {
  outDir: 'dist',
  assetsDir: 'assets'
}
})
>>>>>>> origin/main
