import { Title } from "@solidjs/meta";
import { createAsync, type RouteDefinition } from "@solidjs/router";

import {
	ClientListSection,
	ClientTable,
	useClientsRefresh,
	getClients,
} from "../components/ClientTable.tsx";
import { ConnectInformation, getInspectorOrigin } from "../components/ConnectInformation.tsx";
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
				<ClientListSection>
					<ClientTable clients={clients()!} />

					<ConnectInformation origin={origin()!} />
				</ClientListSection>
			</InspectorLayout>
		</>
	);
}
