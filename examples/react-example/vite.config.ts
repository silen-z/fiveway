import { env } from "node:process";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
	build: { minify: false, sourcemap: true },
	plugins: [react()],
	server: { port: 3000 },
	define: {
		"import.meta.env.FIVEWAY_INSPECTOR": "true",
		"import.meta.env.FIVEWAY_INSPECTOR_URL": JSON.stringify(
			env.FIVEWAY_INSPECTOR_URL ?? "http://localhost:3030",
		),
	},
	lint: {
		plugins: ["react"],
	},
});
