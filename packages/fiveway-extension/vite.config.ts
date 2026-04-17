import solid from "vite-plugin-solid";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { defineConfig } from "vite-plus";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

export default defineConfig({
  plugins: [
    solid(),
    webExtension({
      additionalInputs: ["src/panel.html", "src/hook.ts"],
      manifest: generateManifest,
    }),
  ],
});
