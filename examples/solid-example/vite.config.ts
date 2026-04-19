import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  build: { minify: false, target: "esnext" },
  plugins: [solid()],
  server: { port: 3001 },
  define: {
    "import.meta.env.FIVEWAY_INSPECTOR": "true",
  },
});
