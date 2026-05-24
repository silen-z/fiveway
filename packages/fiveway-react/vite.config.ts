import react from "@vitejs/plugin-react";
import { defineProject } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineProject({
	plugins: [react()],
	pack: {
		platform: "neutral",
		entry: ["src/index.ts"],
		format: ["esm"],
		dts: true,
		unbundle: true,
		exports: { packageJson: false },
	},
	test: {
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
		},
	},
});
