import { defineProject } from "vite-plus";

export default defineProject({
  pack: {
    platform: "neutral",
    entry: ["src/index.tsx"],
    exports: true,
    format: ["esm"],
    unbundle: true,
  },
});
