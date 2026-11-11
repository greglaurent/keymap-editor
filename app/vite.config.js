import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API serves the production build from build/ and redirects to this dev
// server (see api/routes/application.js), so keep both fixed.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'build' },
  server: { port: 3000, strictPort: true }
})
