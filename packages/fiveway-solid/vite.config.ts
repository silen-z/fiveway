import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
	plugins: [solid()],
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
			plugins: [solid()],
		},
	],
	test: {
		projects: [
			{
				test: {
					name: "node",
					environment: "node", // not actually node, used to prevent JSDOM prompt when running tests
					include: ["src/**/*.test.ts"],
				},
			},
			{
				test: {
					name: "browser",
					environment: "node", // not actually node, used to prevent JSDOM prompt when running tests
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
