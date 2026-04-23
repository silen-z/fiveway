import { query } from "@solidjs/router";

export type Client = {
	id: string;
	title: string | null;
	url: string | null;
	ip?: string;
	userAgent?: string | null;
};

const clients = new Map<string, Client>();

export function registerClient(client: Client) {
	clients.set(client.id, client);
}

export function unregisterClient(id: string) {
	clients.delete(id);
}

export const getClients = query(async () => {
	"use server";

	return Array.from(clients.values());
}, "activeClients");
