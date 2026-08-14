(() => {
	const RETRY_INTERVAL = 5000;
	const remoteUrl = new URL("/api/ws/client", document.currentScript.src);

	if (window.location.protocol === "https:") {
		remoteUrl.protocol = "wss:";
	} else {
		remoteUrl.protocol = remoteUrl.protocol.replace("http", "ws");
	}

	let ws;

	const connect = () => {
		const clientId = window.sessionStorage.getItem("fiveway:clientId");
		if (clientId != null) {
			remoteUrl.searchParams.set("id", clientId);
		}

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
	};

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
			message.type.startsWith("fiveway:")
		) {
			if (message.type === "fiveway:command") {
				return;
			}

			if (message.type === "fiveway:assignId") {
				window.sessionStorage.setItem("fiveway:clientId", message.id);
				return;
			}

			ws.send(JSON.stringify(message));
		}
	});
})();
