import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: { solid: "src/solid/solid.ts", react: "src/react/react.ts" },
    platform: "neutral",
    dts: true,
    minify: true,
    exports: true,
    plugins: [solid({ hot: false })],
    css: {
      minify: true,
    },
    deps: {
      onlyBundle: false,
    },
  },
});
