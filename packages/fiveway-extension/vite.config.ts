import solid from "vite-plugin-solid";
import webExtension from "vite-plugin-web-extension";
import { defineConfig } from "vite-plus";

import pkg from "./package.json" with { type: "json" };
import manifest from "./src/manifest.json" with { type: "json" };

export default defineConfig({
	plugins: [
		solid(),
		webExtension({
			additionalInputs: ["src/devtools/panel.html"],
			manifest: generateManifest,
			webExtConfig: {
				target: ["chromium"],
				startUrl: ["http://localhost:3000"],
			},
		}),
	],
});

function generateManifest() {
	return {
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
		...manifest,
	};
}
