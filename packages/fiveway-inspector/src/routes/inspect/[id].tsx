import { type InspectorCommand, type InspectorMessage } from "@fiveway/core/inspector";
import { useParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";

import { devtoolsContext, createDevtoolsContext } from "../../inspector/context.ts";
import { InspectorPanel } from "../../inspector/ui/InspectorPanel.tsx";

export default function InspectorPage() {
	const params = useParams<{ id: string }>();
	const handle = createInspectorConnection(params.id);
	const context = createDevtoolsContext(handle);

	return (
		<>
			<main>
				<Show when={handle.isClientConnected() === false}>
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

function createInspectorConnection(id: string) {
	let ws: WebSocket;
	const [isClientConnected, setClientConnected] = createSignal<boolean | null>(null);

	const queue: string[] = [];

	const handle = {
		subscribe: (callback: (message: InspectorMessage) => void) => {
			ws = new WebSocket(`/ws/inspect?client=${id}`);

			ws.addEventListener("open", () => {
				for (const message of queue) {
					ws.send(message);
				}
				queue.length = 0;
			});

			ws.addEventListener("message", (event) => {
				const message = JSON.parse(event.data);
				if (message.type === "client-disconnected") {
					setClientConnected(false);
					return;
				}

				setClientConnected(true);
				callback(message);
			});

			ws.addEventListener("close", () => {
				setClientConnected(false);
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
		isClientConnected,
	};

	return handle;
}
