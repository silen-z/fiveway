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

function safeClientUrl(url: string | null): string | null {
	if (url == null) {
		return null;
	}

	try {
		const parsed = new URL(url);
		if (parsed.protocol === "http:" || parsed.protocol === "https:") {
			return parsed.href;
		}
	} catch {
		// invalid URL
	}

	return null;
}

function ClientRow(props: { client: Client }) {
	const url = () => safeClientUrl(props.client.url);

	return (
		<tr>
			<td>{props.client.title}</td>
			<td>
				{url() ? (
					<a target="_blank" rel="noopener noreferrer" href={url()!}>
						{url()}
					</a>
				) : (
					<span>{props.client.url ?? "N/A"}</span>
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
