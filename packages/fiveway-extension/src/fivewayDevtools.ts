import * as v from "valibot";
import browser from "webextension-polyfill";

import { FivewayMessage, TreeStateMessage } from "./protocol.ts";

let port = browser.runtime.connect({ name: "content-script" });

port.onMessage.addListener((message) => {
	const { success } = v.safeParse(FivewayMessage, message);
	if (success) {
		window.postMessage(message);
	}
});

port.onDisconnect.addListener(() => {
	port = browser.runtime.connect({ name: "content-script" });
});

window.addEventListener("message", (event) => {
	// Only accept messages from the same frame
	if (event.source !== window) {
		return;
	}

	// forward tree updates to devtools
	const { success } = v.safeParse(TreeStateMessage, event.data);
	if (success) {
		port.postMessage(event.data);
	}
});
