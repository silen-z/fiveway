import { defineHandler } from "nitro";

import clientScript from "../../../assets/connect.js?raw";

export const GET = defineHandler(() => {
	return new Response(clientScript, {
		headers: {
			"Content-Type": "application/javascript",
			"Access-Control-Allow-Origin": "*",
		},
	});
});
