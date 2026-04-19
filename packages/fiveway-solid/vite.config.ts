import solid from "vite-plugin-solid";
import { defineProject } from "vite-plus";

export default defineProject({
  pack: {
    platform: "neutral",
    entry: ["src/index.tsx"],
    format: ["esm"],
    dts: true,
    unbundle: true,
    exports: { packageJson: false },
    plugins: [solid()],
  },
});
