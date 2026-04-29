import { createInspector } from "@fiveway/inspector";

import "@fiveway/inspector/style.css";
import * as v from "valibot";
import browser from "webextension-polyfill";

import { TreeStateMessage, ReloadMessage } from "../protocol.ts";

const port = browser.runtime.connect({ name: "devtools" });

port.postMessage({ type: "init", tabId: browser.devtools.inspectedWindow.tabId });

const root = document.getElementById("app");
if (root === null) {
	throw new Error("root element not found");
}

export const AcceptedIncomingMessage = v.union([TreeStateMessage, ReloadMessage]);

createInspector(root, {
	subscribe: (callback) => {
		const handler = (message: unknown) => {
			const { success, output } = v.safeParse(AcceptedIncomingMessage, message);
			if (success) {
				callback(output);
			}
		};

		port.onMessage.addListener(handler);
		return () => {
			port.onMessage.removeListener(handler);
		};
	},
	sendCommand: (command) => {
		port.postMessage({
			type: "fiveway:command",
			tabId: browser.devtools.inspectedWindow.tabId,
			command,
		});
	},
});
