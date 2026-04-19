import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/ui/inspector.tsx"],
    platform: "browser",
    dts: true,
    exports: { packageJson: false, inlinedDependencies: false },
    plugins: [solid({ hot: false })],
    deps: {
      onlyBundle: ["solid-js", "lucide-solid", "clsx"],
    },
  },
});
