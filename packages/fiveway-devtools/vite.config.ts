import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3003,
	},
	plugins: [
		solidStart({}),
		nitro({
			features: {
				websocket: true,
			},
		}),
		tailwindcss(),
	],
	resolve: {
		dedupe: ["@solidjs/start"],
	},
});
