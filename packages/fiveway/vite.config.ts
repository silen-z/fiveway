import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
	pack: {
		platform: "neutral",
		entry: ["src/index.ts", "src/dom.ts", "src/inspector.ts"],
		format: ["esm"],
		dts: true,
		unbundle: true,
		exports: { packageJson: false },
		define: {
			"import.meta.vitest": "undefined",
		},
	},

	test: {
		env: { FIVEWAY_INSPECTOR: "true" },
		projects: [
			{
				test: {
					name: "node",
					include: ["src/**/*.test.ts"],
					exclude: ["src/**/*.test.browser.ts"],
					includeSource: ["src/**/*.ts"],
				},
			},
			{
				test: {
					name: "browser",
					include: ["src/**/*.test.browser.ts"],
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
