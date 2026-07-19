import { query, revalidate } from "@solidjs/router";
import { createEffect, For, onCleanup, type JSX } from "solid-js";

import { getActiveClients, type Client } from "../server/bridge.ts";

import styles from "./ClientTable.module.css";

export const getClients = query(async () => {
	"use server";

	return getActiveClients();
}, "clients");

export function useClientsRefresh() {
	createEffect(() => {
		const eventSource = new EventSource("/sse/notify");
		eventSource.addEventListener("message", async (event) => {
			if (event.data === "notify") {
				await revalidate(getClients.key);
			}
		});

		onCleanup(() => {
			eventSource.close();
		});
	});
}

export function ClientListSection(props: { children: JSX.Element }) {
	return <div class={styles.listSection}>{props.children}</div>;
}

export function ClientTable(props: { clients: Client[] }) {
	return (
		<table class={styles.table}>
			<thead>
				<tr>
					<th>Title</th>
					<th>URL</th>
					<th>IP</th>
					<th>User Agent</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<For each={props.clients}>{(client) => <ClientRow client={client} />}</For>
			</tbody>
		</table>
	);
}

function ClientRow(props: { client: Client }) {
	return (
		<tr>
			<td>{props.client.title}</td>
			<td>
				{props.client.url ? (
					<a target="_blank" rel="noopener" href={props.client.url}>
						{props.client.url}
					</a>
				) : (
					<span>N/A</span>
				)}
			</td>
			<td>{props.client.ip}</td>
			<td>{props.client.userAgent}</td>
			<td>
				<a target="_blank" href={`/inspect/${props.client.id}`}>
					Inspect
				</a>
			</td>
		</tr>
	);
}
