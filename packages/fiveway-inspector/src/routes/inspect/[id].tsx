import { type InspectorCommand, type InspectorMessage } from "@fiveway/core/inspector";
import { Title } from "@solidjs/meta";
import { createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";

import {
	ClientListSection,
	ClientTable,
	useClientsRefresh,
	getClients,
} from "../../components/ClientTable.tsx";
import { ConnectSnippet, getInspectorOrigin } from "../../components/ConnectSnippet.tsx";
import { InspectorLayout } from "../../components/InspectorLayout.tsx";
import { ClientId, PageBanner } from "../../components/PageBanner.tsx";
import { PageMessage } from "../../components/PageMessage.tsx";
import { Inspector } from "../../inspector/ui/Inspector.tsx";
import { type Client } from "../../server/bridge.ts";

import styles from "./[id].module.css";

export const route = {
	preload: () => Promise.all([getClients(), getInspectorOrigin()]),
} satisfies RouteDefinition;

export default function InspectorPage() {
	const params = useParams<{ id: string }>();
	const clients = createAsync(() => getClients(), { initialValue: [] });

	useClientsRefresh();

	const client = createMemo<Client | null>(
		(prev) => prev ?? clients().find((c) => c.id === params.id) ?? null,
	);

	return (
		<>
			<Title>fiveway / inspector · {client()?.url ?? params.id}</Title>
			<Show
				when={client()}
				fallback={<ClientUnavailable clientId={params.id} clients={clients()} />}
			>
				{(activeClient) => <ConnectedInspector client={activeClient()} />}
			</Show>
		</>
	);
}

function ConnectedInspector(props: { client: Client }) {
	const handle = createInspectorConnection(props.client.id);

	return (
		<>
			<main class={styles.inspectorMain}>
				<Inspector handle={handle} />

				<Show when={handle.status() === "disconnected"}>
					<PageMessage title="Client disconnected">
						The client with ID <ClientId>{props.client.id}</ClientId> has disconnected.
					</PageMessage>
				</Show>
			</main>
		</>
	);
}

function createInspectorConnection(id: string) {
	let ws: WebSocket;
	const queue: string[] = [];

	const [status, setStatus] = createSignal<"connecting" | "connected" | "disconnected">(
		"connecting",
	);

	return {
		subscribe: (callback: (message: InspectorMessage) => void) => {
			ws = new WebSocket(`/ws/inspect?client=${id}`);

			ws.addEventListener("open", () => {
				setStatus("connected");
				for (const message of queue) {
					ws.send(message);
				}
				queue.length = 0;
			});

			ws.addEventListener("message", (event) => {
				const message = JSON.parse(event.data);

				if (message.type === "client:disconnected") {
					setStatus("disconnected");
					return;
				}

				if (status() === "disconnected") {
					setStatus("connected");
				}

				callback(message);
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
		status,
	};
}

function ClientUnavailable(props: { clientId: string; clients: Client[] }) {
	const origin = createAsync(() => getInspectorOrigin());

	return (
		<>
			<InspectorLayout>
				<PageBanner title="Client not connected">
					No client with ID <ClientId>{props.clientId}</ClientId> is connected.
				</PageBanner>

				<Show when={props.clients.length === 0}>
					<ConnectSnippet origin={origin() ?? ""}>
						No clients are connected. To connect, add this script to your app:
					</ConnectSnippet>
				</Show>

				<Show when={props.clients.length > 0}>
					<ClientListSection>
						<ClientTable clients={props.clients} />

						<ConnectSnippet origin={origin() ?? ""}>
							To connect another client, add this script to your app:
						</ConnectSnippet>
					</ClientListSection>
				</Show>
			</InspectorLayout>
		</>
	);
}
