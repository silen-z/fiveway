import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
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
			screenshotFailures: false,
		},
	},
});
