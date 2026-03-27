import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      netlify: {
        // On Netlify `vp build` fails with:
        // Failed to spawn process: failed to create IPC channel: Creating the shared memory failed, os error 2
        command: "vite build",
        dependsOn: ["@fiveway/core#build", "@fiveway/react#build", "@fiveway/devtools#build"],
      },
    },
  },
  build: { minify: false, sourcemap: true },
  plugins: [react()],
});
