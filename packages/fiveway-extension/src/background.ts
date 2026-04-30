import * as v from "valibot";
import browser from "webextension-polyfill";

import { InitMessage, InspectorCommand } from "./protocol.ts";

const contentScriptPorts: Map<number, browser.Runtime.Port> = new Map();
const devtoolsPorts: Map<number, browser.Runtime.Port> = new Map();

browser.runtime.onConnect.addListener((port) => {
	if (port.name === "content-script") {
		contentScriptConnected(port);
	}

	if (port.name === "devtools") {
		devtoolsConnected(port);
	}
});

function contentScriptConnected(port: browser.Runtime.Port): void {
	const tabId = port.sender?.tab?.id;
	if (tabId == null) {
		throw new Error("content script does not have a tab id");
	}

	contentScriptPorts.set(tabId, port);

	port.onDisconnect.addListener(() => {
		contentScriptPorts.delete(tabId);
	});

	// forward messages from the content script to the devtools if they are connected
	port.onMessage.addListener((msg) => {
		const devtoolsPort = devtoolsPorts.get(tabId);
		devtoolsPort?.postMessage(msg);
	});
}

const AcceptedIncomingDevtoolsMessage = v.union([InitMessage, InspectorCommand]);

function devtoolsConnected(port: browser.Runtime.Port): void {
	// since devtools ports do not contain `tabId` of a tab inspected by the devtool panel
	// we have to send a custom `init` message from the devtool panel
	// and only when the `init` message is received we can register the port
	port.onMessage.addListener((message) => {
		const { success, output: msg } = v.safeParse(AcceptedIncomingDevtoolsMessage, message);
		if (!success) {
			console.error("unexpected message from devtools", message);
			return;
		}

		if (msg.type === "init") {
			devtoolsPorts.set(msg.tabId, port);

			port.onDisconnect.addListener(() => {
				devtoolsPorts.delete(msg.tabId);
			});
		}

		if (msg.type === "fiveway:command") {
			const contentScriptPort = contentScriptPorts.get(msg.tabId);
			if (contentScriptPort == null) {
				console.error("content script port not found for tab id", msg.tabId);
				return;
			}

			contentScriptPort.postMessage(message);
		}
	});
}

// contentScripts and background service worker can suspend after 30 seconds
// send ping every 15 seconds to keep them alive
setInterval(() => {
	for (const port of contentScriptPorts.values()) {
		port.postMessage({ type: "ping" });
	}
}, 15 * 1000);

// Main-frame navigations (reload, link, typed URL, …) replace the document; clear devtools state
// so stale trees are not shown until the new page sends snapshots. Does not use page unload hooks,
// so it does not affect the page’s back-forward cache eligibility.
browser.webNavigation.onCommitted.addListener((details) => {
	if (details.frameId !== 0) {
		return;
	}

	const devtoolsPort = devtoolsPorts.get(details.tabId);
	devtoolsPort?.postMessage({ type: "fiveway:reload" });
});
