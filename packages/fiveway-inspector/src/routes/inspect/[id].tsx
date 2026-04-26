import { type InspectorCommand, type InspectorMessage } from "@fiveway/core";
import { useParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";

import { devtoolsContext, createDevtoolsContext } from "../../inspector/context.ts";
import { InspectorPanel } from "../../inspector/ui/InspectorPanel.tsx";

export default function InspectorPage() {
	const { id } = useParams();
	const [isDisconnected, setDisconnected] = createSignal(false);

	const connection = createInspectorConnection(id!, () => setDisconnected(true));
	const context = createDevtoolsContext(connection);

	return (
		<>
			<main>
				<Show when={isDisconnected()}>
					<div class="absolute inset-0 flex flex-col items-center justify-center h-full">
						<h1 class="text-2xl font-bold">Client disconnected</h1>
						<p class="text-gray-500">The client has disconnected from the inspector.</p>
					</div>
				</Show>
				<devtoolsContext.Provider value={context}>
					<InspectorPanel />
				</devtoolsContext.Provider>
			</main>
		</>
	);
}

function createInspectorConnection(id: string, onDisconnect: () => void) {
	let ws: WebSocket;

	const queue: string[] = [];

	return {
		subscribe: (callback: (message: InspectorMessage) => void) => {
			ws = new WebSocket(`/ws/inspect?client=${id}`);

			ws.addEventListener("open", () => {
				for (const message of queue) {
					ws.send(message);
				}
				queue.length = 0;
			});

			ws.addEventListener("message", (event) => {
				if (event.data === JSON.stringify({ type: "client-disconnected" })) {
					onDisconnect();
					return;
				}

				callback(JSON.parse(event.data));
			});

			ws.addEventListener("close", () => {
				onDisconnect();
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
