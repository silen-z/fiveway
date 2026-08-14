import { defineWebSocketHandler } from "nitro";
import { v4 as uuidv4 } from "uuid";

import { registerClient, unregisterClient } from "../../../server/client-store.ts";

export default defineWebSocketHandler({
	upgrade(request) {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		if (id == null) {
			return { namespace: uuidv4() };
		}

		return { namespace: id, context: { reconnect: true } };
	},
	async open(peer) {
		await registerClient({
			id: peer.namespace,
			ip: peer.remoteAddress,
			...getClientInfoFromRequest(peer.request),
		});

		peer.subscribe("commands");

		if (peer.context.reconnect) {
			peer.publish("updates", JSON.stringify({ type: "fiveway:reload" }));
		} else {
			peer.send(JSON.stringify({ type: "client:id", id: peer.namespace }));
		}
	},

	message(peer, message) {
		peer.publish("updates", message.text());
	},

	async close(peer) {
		peer.publish("updates", JSON.stringify({ type: "client:disconnected" }));
		await unregisterClient(peer.namespace);
	},
});

type ClientInfoFromRequest = {
	url: string | null;
	title: string | null;
	userAgent: string | null;
};

function getClientInfoFromRequest(request: Request): ClientInfoFromRequest {
	const requestUrl = new URL(request.url);

	const info: ClientInfoFromRequest = {
		url: null,
		title: requestUrl.searchParams.get("title"),
		userAgent: request.headers.get("user-agent"),
	};

	let urlParam = requestUrl.searchParams.get("url");
	if (urlParam == null) {
		return info;
	}

	const origin = request.headers.get("origin");
	if (origin == null) {
		return info;
	}

	let clientUrl;

	try {
		clientUrl = new URL(urlParam);
	} catch {
		return info;
	}

	if (clientUrl.protocol !== "http:" && clientUrl.protocol !== "https:") {
		return info;
	}

	if (clientUrl.origin !== origin) {
		return info;
	}

	info.url = clientUrl.href;

	return info;
}
