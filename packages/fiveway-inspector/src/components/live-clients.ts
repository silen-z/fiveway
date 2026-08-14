import { GET, live } from "@solidjs/web/server-functions";

import { listAllClients, subscribeToClientChanges } from "../server/client-store.ts";

export const liveClientList = live(
	GET(async function* () {
		"use server";

		yield listAllClients();

		let waiter = Promise.withResolvers<void>();

		const unsubscribe = await subscribeToClientChanges(() => {
			waiter.resolve();
		});

		try {
			while (true) {
				await waiter.promise;
				waiter = Promise.withResolvers<void>();
				yield listAllClients();
			}
		} finally {
			await unsubscribe();
		}
	}),
);
