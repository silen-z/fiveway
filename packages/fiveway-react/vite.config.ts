import { defineProject } from "vite-plus";

export default defineProject({
  pack: {
    platform: "neutral",
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    unbundle: true,
    exports: { packageJson: false },
  },
});
