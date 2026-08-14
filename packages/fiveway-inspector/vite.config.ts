import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
	server: {
		port: 3003,
	},

	plugins: !process.env.VITEST
		? [
				solid({
					start: true,
					ssr: true,
					serverFunctions: { components: true },
				}),
				fileRoutes(),
				nitro({
					serverDir: "./src/routes",
					features: { websocket: true },
					serverEntry: false,
				}),
			]
		: [],
	build: {
		outDir: ".output/public",
	},
	pack: {
		entry: ["src/inspector/inspector.ts"],
		platform: "browser",
		dts: true,
		exports: { packageJson: false, inlinedDependencies: false },
		plugins: [solid({ hot: false })],
		deps: {
			alwaysBundle: ["solid-js", "@solidjs/web", "@solidjs/signals"],
			onlyBundle: ["solid-js", "@solidjs/web", "@solidjs/signals"],
		},
	},
});
