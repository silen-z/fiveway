import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
	upgrade(request) {
		const url = new URL(request.url);
		const client = url.searchParams.get("client");
		if (client == null) {
			return new Response("client ID is required", { status: 400 });
		}

		return { namespace: client };
	},
	open(peer) {
		peer.subscribe("updates");
	},

	message(peer, message) {
		peer.publish("commands", message.text());
	},
});
