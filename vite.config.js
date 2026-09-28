import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dramaApiPlugin } from './src/plugins/dramaApiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dramaApiPlugin()],
})

