import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite-конфиг для структуры, где:
// - вход: src/main.tsx
// - основной React-код: ui/App.tsx и остальные компоненты в ui/
// - стили и утилиты — в src/ (src/lib и т.п.)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  build: {
    outDir: "dist"
  }
});
