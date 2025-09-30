// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ 정확히 '/act_program_mvp/' 로!
export default defineConfig({
  plugins: [react()],
  base: '/act_program_mvp/',
})