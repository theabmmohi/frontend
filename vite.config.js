import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      input: "index.html"
    }
  },
  server: {
    port: 5000
  },
  resolve: {
    alias: {
      "@": path.resolve(new URL("./src", import.meta.url).pathname),
      "@page": path.resolve(new URL("./src/assets/pages", import.meta.url).pathname),
      "@error": path.resolve(new URL("./src/assets/pages/errors", import.meta.url).pathname)
    }
  }
})