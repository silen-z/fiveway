import { Title } from "@solidjs/meta";
import { createAsync, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";

import {
	ClientListSection,
	ClientTable,
	useClientsRefresh,
	getClients,
} from "../components/ClientTable.tsx";
import { ConnectSnippet, getInspectorOrigin } from "../components/ConnectSnippet.tsx";
import { InspectorLayout } from "../components/InspectorLayout.tsx";

export const route = {
	preload: () => Promise.all([getClients(), getInspectorOrigin()]),
} satisfies RouteDefinition;

export default function HomePage() {
	const clients = createAsync(() => getClients(), { initialValue: [] });
	const origin = createAsync(() => getInspectorOrigin());

	useClientsRefresh();

	return (
		<>
			<Title>fiveway / inspector</Title>
			<InspectorLayout>
				<Show when={clients().length === 0}>
					<ConnectSnippet origin={origin()!}>
						No clients are connected. To connect, add this script to your app:
					</ConnectSnippet>
				</Show>

				<Show when={clients().length > 0}>
					<ClientListSection>
						<ClientTable clients={clients()!} />

						<ConnectSnippet origin={origin()!}>
							To connect another client, add this script to your app:
						</ConnectSnippet>
					</ClientListSection>
				</Show>
			</InspectorLayout>
		</>
	);
}
