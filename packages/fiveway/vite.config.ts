import { defineProject } from "vite-plus";

export default defineProject({
  pack: {
    platform: "neutral",
    entry: ["src/index.ts", "src/dom.ts"],
    exports: true,
    format: ["esm"],
    unbundle: true,
  },
  test: {
    include: ["src/**/*.test.ts"],
    includeSource: ["src/**/*.ts"],
  },
});
