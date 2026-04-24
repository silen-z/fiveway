import { defineWebSocketHandler } from "nitro";
import { v4 as uuidv4 } from "uuid";

import { registerClient, unregisterClient } from "../../server/bridge.ts";

export const GET = defineWebSocketHandler({
	upgrade() {
		const id = uuidv4();
		return { namespace: id };
	},
	open(peer) {
		const url = new URL(peer.request.url);

		registerClient({
			id: peer.namespace,
			title: url.searchParams.get("title"),
			url: url.searchParams.get("url"),
			ip: peer.remoteAddress,
			userAgent: peer.request.headers.get("user-agent"),
		});

		peer.subscribe("commands");
	},

	message(peer, message) {
		peer.publish("updates", message.text());
	},

	close(peer) {
		unregisterClient(peer.namespace);
	},
});
