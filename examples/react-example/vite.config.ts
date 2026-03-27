import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

// https://vitejs.dev/config/
export default defineConfig({
  // build: { minify: false },
  plugins: [react()],
});
