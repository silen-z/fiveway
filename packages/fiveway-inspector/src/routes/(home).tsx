import { Title } from "@solidjs/meta";
import { createMemo } from "solid-js";

import { ClientListSection, ClientTable } from "../components/ClientTable.tsx";
import { ConnectInformation } from "../components/ConnectInformation.tsx";
import { InspectorLayout } from "../components/InspectorLayout.tsx";
import { liveClientList } from "../components/live-clients.ts";

export default function HomePage() {
	const clients = createMemo(() => liveClientList());

	return (
		<InspectorLayout>
			<Title>fiveway / inspector</Title>

			<ClientListSection>
				<ClientTable clients={clients()} />

				<ConnectInformation />
			</ClientListSection>
		</InspectorLayout>
	);
}
