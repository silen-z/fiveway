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
		projects: [
			{
				test: {
					name: "node",
					include: ["src/**/*.test.ts"],
				},
			},
			{
				test: {
					name: "browser",
					include: ["src/**/*.test.browser.tsx"],
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [{ browser: "chromium" }],
						screenshotFailures: false,
					},
				},
			},
		],
	},
});
