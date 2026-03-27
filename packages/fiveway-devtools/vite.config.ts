import { resolve } from "path";

import { analyzer } from "vite-bundle-analyzer";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: resolve(__dirname, "src/devtools.tsx"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["@fiveway/core"],
    },
  },

  plugins: [
    solid({ hot: false }),
    cssInjectedByJsPlugin(),
    dts({ rollupTypes: true }),
    analyzer({
      analyzerMode: "static",
    }),
  ],
});
