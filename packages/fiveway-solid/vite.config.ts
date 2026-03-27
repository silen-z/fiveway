import solid from "vite-plugin-solid";
import { defineProject } from "vite-plus";

export default defineProject({
  pack: {
    platform: "neutral",
    entry: ["src/index.tsx"],
    unbundle: true,
    plugins: [solid()],
  },
});
