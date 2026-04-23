import { type InspectorCommand, type InspectorMessage } from "@fiveway/core";
import { Link } from "@solidjs/meta";
import { useParams } from "@solidjs/router";

import inspectorStyle from "@fiveway/inspector/style.css?url";

export default function InspectorPage() {
	const { id } = useParams();
	const handle = createInspectorConnection(id!);

	return (
		<>
			<Link rel="stylesheet" href={inspectorStyle}></Link>
			<main>
				<div
					ref={(el) =>
						import("@fiveway/inspector").then(({ createInspector }) => createInspector(el, handle))
					}
				></div>
			</main>
		</>
	);
}

function createInspectorConnection(id: string) {
	let ws: WebSocket;

	const queue: string[] = [];

	return {
		subscribe: (callback: (message: InspectorMessage) => void) => {
			ws = new WebSocket(`/inspect?client=${id}`);

			ws.addEventListener("open", () => {
				for (const message of queue) {
					ws.send(message);
				}
				queue.length = 0;
			});

			ws.addEventListener("message", (event) => {
				callback(JSON.parse(event.data));
			});

			return () => {
				ws.close();
			};
		},
		sendCommand: (command: InspectorCommand) => {
			const message = JSON.stringify({ type: "fiveway:command", command });

			if (ws == null || ws.readyState !== WebSocket.OPEN) {
				queue.push(message);
				return;
			}

			ws.send(message);
		},
	};
}
