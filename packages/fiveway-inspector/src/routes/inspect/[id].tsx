import { type InspectorCommand, type InspectorMessage } from "@fiveway/core";
import { useParams } from "@solidjs/router";

import { devtoolsContext, createDevtoolsContext } from "../../inspector/context.ts";
import { InspectorPanel } from "../../inspector/ui/InspectorPanel.tsx";

export default function InspectorPage() {
	const { id } = useParams();

	const connection = createInspectorConnection(id!);
	const context = createDevtoolsContext(connection);

	return (
		<>
			<main>
				<devtoolsContext.Provider value={context}>
					<InspectorPanel />
				</devtoolsContext.Provider>
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
