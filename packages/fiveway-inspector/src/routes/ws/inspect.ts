import { defineWebSocketHandler } from "nitro";

import { getActiveClients } from "../../server/bridge";

export const GET = defineWebSocketHandler({
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

		if (!getActiveClients().find((c) => c.id === peer.namespace)) {
			peer.send(JSON.stringify({ type: "client-disconnected" }));
		}
	},

	message(peer, message) {
		peer.publish("commands", message.text());
	},
});
