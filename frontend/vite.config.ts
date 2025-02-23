import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
// import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // tailwindcss(),
    react(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})
