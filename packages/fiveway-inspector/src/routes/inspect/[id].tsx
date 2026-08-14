import { type InspectorCommand, type InspectorMessage } from "@fiveway/core/inspector";
import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";

import { ClientListSection, ClientTable } from "../../components/ClientTable.tsx";
import { ConnectInformation } from "../../components/ConnectInformation.tsx";
import { InspectorLayout } from "../../components/InspectorLayout.tsx";
import { liveClientList } from "../../components/live-clients.ts";
import { ClientId, PageBanner } from "../../components/PageBanner.tsx";
import { PageMessage } from "../../components/PageMessage.tsx";
import { Inspector } from "../../inspector/ui/Inspector.tsx";
import { type Client } from "../../server/clients.ts";

import styles from "./[id].module.css";

export default function InspectorPage() {
	const params = useParams<{ id: string }>();
	const clients = createMemo(() => liveClientList());

	const client = createMemo<Client | null>((prev) => {
		return prev ?? clients().find((c) => c.id === params.id) ?? null;
	});

	return (
		<Show when={client()} fallback={<ClientUnavailable clientId={params.id} clients={clients()} />}>
			{(activeClient) => <ConnectedInspector client={activeClient()} />}
		</Show>
	);
}

function ConnectedInspector(props: { client: Client }) {
	const handle = createInspectorConnection(props.client.id);

	return (
		<main class={styles.inspectorMain}>
			<Title>fiveway / inspector · {props.client.url ?? props.client.id}</Title>

			<Inspector handle={handle} />

			<Show when={handle.status() === "disconnected"}>
				<PageMessage title="Client disconnected">
					The client with ID <ClientId>{props.client.id}</ClientId> has disconnected.
				</PageMessage>
			</Show>
		</main>
	);
}

function createInspectorConnection(id: string) {
	let ws: WebSocket;
	const queue: string[] = [];

	const [status, setStatus] = createSignal<"connecting" | "connected" | "disconnected">(
		"connecting",
	);

	return {
		status,
		subscribe: (callback: (message: InspectorMessage) => void) => {
			ws = new WebSocket(`/api/ws/inspect?client=${id}`);

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
	};
}

function ClientUnavailable(props: { clientId: string; clients: Client[] }) {
	return (
		<>
			<InspectorLayout>
				<PageBanner title="Client not connected">
					No client with ID <ClientId>{props.clientId}</ClientId> is connected.
				</PageBanner>

				<ClientListSection>
					<ClientTable clients={props.clients} />

					<ConnectInformation />
				</ClientListSection>
			</InspectorLayout>
		</>
	);
}
