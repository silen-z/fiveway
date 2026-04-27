import { defineWebSocketHandler } from "nitro";
import { v4 as uuidv4 } from "uuid";

import { registerClient, unregisterClient } from "../../server/bridge.ts";

export const GET = defineWebSocketHandler({
	upgrade(request) {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		if (id == null) {
			return { namespace: uuidv4() };
		}

		return { namespace: id, context: { reconnect: true } };
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

		if (peer.context.reconnect) {
			peer.publish("updates", JSON.stringify({ type: "fiveway:reload" }));
		} else {
			peer.send(JSON.stringify({ type: "fiveway:assignId", id: peer.namespace }));
		}
	},

	message(peer, message) {
		peer.publish("updates", message.text());
	},

	close(peer) {
		peer.publish("updates", JSON.stringify({ type: "client-disconnected" }));
		unregisterClient(peer.namespace);
	},
});
