(() => {
	const RETRY_INTERVAL = 5000;
	const remoteUrl = new URL("/ws/client", document.currentScript.src);
	remoteUrl.protocol = "ws:";

	let ws;

	function connect() {
		remoteUrl.searchParams.set("title", document.title);
		remoteUrl.searchParams.set("url", window.location.href);

		try {
			ws = new WebSocket(remoteUrl);
		} catch {
			setTimeout(() => {
				ws = null;
				connect();
			}, RETRY_INTERVAL);
		}

		ws.addEventListener("message", (event) => {
			const data = JSON.parse(event.data);
			window.postMessage(data);
		});

		ws.addEventListener("close", () => {
			ws = null;
			setTimeout(() => {
				connect();
			}, RETRY_INTERVAL);
		});
	}

	connect();

	window.addEventListener("message", (event) => {
		if (ws == null || ws.readyState !== WebSocket.OPEN) {
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
})();
