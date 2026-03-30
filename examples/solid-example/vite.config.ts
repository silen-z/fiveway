import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";
// import solidDevtools from 'solid-devtools/vite';

export default defineConfig({
  build: { minify: false, target: "esnext" },
  plugins: [
    solid(),
    // solidDevtools(),
  ],
  server: {
    port: 3001,
  },
});
