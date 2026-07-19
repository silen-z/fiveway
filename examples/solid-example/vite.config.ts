import { env } from "node:process";

import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

console.log(env.FIVEWAY_INSPECTOR_URL);

export default defineConfig({
	build: { minify: false, target: "esnext" },
	plugins: [solid()],
	server: { port: 3001 },
	define: {
		"import.meta.env.FIVEWAY_INSPECTOR": "true",
		"import.meta.env.FIVEWAY_INSPECTOR_URL": JSON.stringify(
			env.FIVEWAY_INSPECTOR_URL ?? "http://localhost:3030",
		),
	},
});
