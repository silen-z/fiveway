const remoteUrl = new URL("/ws/client", document.currentScript.src);
remoteUrl.protocol = "ws:";
remoteUrl.searchParams.set("title", document.title);
remoteUrl.searchParams.set("url", window.location.href);

const ws = new WebSocket(remoteUrl);

ws.addEventListener("message", (event) => {
	const data = JSON.parse(event.data);
	window.postMessage(data);
});

window.addEventListener("message", (event) => {
	if (ws.readyState !== WebSocket.OPEN) {
		return;
	}

	const message = event.data;

	if (
		typeof message === "object" &&
		message != null &&
		"type" in message &&
		message.type.startsWith("fiveway:") &&
		message.type !== "fiveway:command"
	) {
		ws.send(JSON.stringify(message));
	}
});
