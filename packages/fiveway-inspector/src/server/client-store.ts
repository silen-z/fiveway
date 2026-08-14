import { useStorage } from "nitro/storage";

import { type Client } from "./clients.ts";

const clientStorage = useStorage<Client>("clients");

export async function registerClient(client: Client) {
	await clientStorage.setItem(client.id, client);
}

export async function unregisterClient(id: string) {
	await clientStorage.removeItem(id);
}

export async function listAllClients() {
	const keys = await clientStorage.getKeys();
	const items = await clientStorage.getItems(keys);
	return items.map((c) => c.value);
}

export function subscribeToClientChanges(callback: () => void) {
	return clientStorage.watch(callback);
}
