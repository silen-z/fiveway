import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/devtools.tsx"],
    platform: "neutral",
    dts: true,
    minify: true,
    plugins: [solid({ hot: false })],
  },
});
