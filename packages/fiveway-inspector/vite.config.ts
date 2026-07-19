import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
	server: {
		port: 3003,
	},
	plugins: !process.env.VITEST
		? [
				solidStart(),
				nitro({
					routeRules: {
						"/connect": { cors: true },
					},
					features: {
						websocket: true,
					},
				}),
			]
		: [],
	resolve: {
		dedupe: ["@solidjs/start"],
	},
	build: {
		outDir: "dist/standalone",
	},
	pack: {
		entry: ["src/inspector/inspector.ts"],
		platform: "browser",
		dts: true,
		exports: { packageJson: false, inlinedDependencies: false },
		plugins: [solid({ hot: false })],
		deps: {
			alwaysBundle: ["solid-js", "solid-js/web", "solid-js/store"],
			onlyBundle: ["solid-js", "lucide-solid"],
		},
	},
});
