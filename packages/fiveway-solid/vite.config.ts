import solid from "vite-plugin-solid";
import { defineProject, type Plugin, type UserProjectConfigExport } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineProject({
	plugins: [solid() as Plugin],
	pack: [
		// build with JSX preserved
		{
			platform: "neutral",
			entry: ["src/index.ts"],
			format: ["esm"],
			outDir: "dist/solid",
			dts: true,
			unbundle: true,
			outExtensions: () => ({ js: ".jsx" }),
		},

		// build with JSX transpiled
		{
			platform: "neutral",
			entry: ["src/index.ts"],
			format: ["esm"],
			outDir: "dist/esm",
			dts: true,
			unbundle: true,
			plugins: [solid() as Plugin],
		},
	],
	test: {
		environment: "node", // not actually node, used to prevent JSDOM prompt when running tests
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
			screenshotFailures: false,
		},
	},
} as UserProjectConfigExport);
