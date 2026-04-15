import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/inspector.tsx"],
    platform: "browser",
    dts: true,
    minify: true,
    plugins: [solid({ hot: false })],
    // exports: true,
  },
});
