import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Point static files to `/static` route
  base: "/static",
  appType: "custom",
  server: { middlewareMode: true },
  css: {
    transformer: "postcss",
  },
});
