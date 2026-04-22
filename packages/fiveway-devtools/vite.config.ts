import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin } from "@solidjs/vite-plugin-nitro-2";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [solidStart(), nitroV2Plugin()],
	resolve: {
		dedupe: ["@solidjs/start"],
	},
});
