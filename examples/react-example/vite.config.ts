import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: "vp build",
        dependsOn: ["@fiveway/core#build", "@fiveway/react#build", "@fiveway/devtools#build"],
      },
    },
  },
  build: { minify: false, sourcemap: true },
  plugins: [react()],
});
