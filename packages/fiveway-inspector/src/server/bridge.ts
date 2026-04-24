export type Client = {
	id: string;
	title: string | null;
	url: string | null;
	ip?: string;
	userAgent?: string | null;
};

const clients = new Map<string, Client>();
const clientNotifications = new EventTarget();

export function subscribeNotifications(callback: (event: Event) => void) {
	clientNotifications.addEventListener("change", callback);

	return () => {
		clientNotifications.removeEventListener("change", callback);
	};
}

export function registerClient(client: Client) {
	clients.set(client.id, client);

	clientNotifications.dispatchEvent(new Event("change"));
}

export function unregisterClient(id: string) {
	clients.delete(id);

	clientNotifications.dispatchEvent(new Event("change"));
}

export function getActiveClients() {
	return Array.from(clients.values());
}
