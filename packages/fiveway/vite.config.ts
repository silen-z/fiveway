import { defineProject, type UserProjectConfigExport } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineProject({
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
		include: ["src/**/*.test.ts"],
		includeSource: ["src/**/*.ts"],
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
			screenshotFailures: false,
		},
		env: { FIVEWAY_INSPECTOR: "true" },
	},
} as UserProjectConfigExport);
