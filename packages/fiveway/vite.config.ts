import { defineProject } from "vite-plus";

export default defineProject({
  pack: {
    platform: "neutral",
    entry: ["src/index.ts", "src/dom.ts"],
    exports: true,
    format: ["esm"],
    unbundle: true,
    define: {
      // tsdown does not handle this by default
      "import.meta.vitest": "false",
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    includeSource: ["src/**/*.ts"],
    env: {
      FIVEWAY_INSPECTOR: "true",
    },
  },
});
