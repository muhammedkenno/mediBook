import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

// The real project path contains "&" and spaces, which breaks Vite's file://
// URL module loader. We run tests via the junction C:\medibook-frontend;
// preserveSymlinks keeps that clean path instead of resolving back to the real
// one, and the alias is based on cwd (the junction) for the same reason.
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: { "@": path.resolve(process.cwd(), "src") },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
})
