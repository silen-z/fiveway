import solid from "vite-plugin-solid";
import { defineProject } from "vite-plus";

export default defineProject({
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
});
