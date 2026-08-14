import { type JSX } from "@solidjs/web";
import { For } from "solid-js";

import { type Client } from "../server/clients.ts";

import styles from "./ClientTable.module.css";

export function ClientListSection(props: { children: JSX.Element }) {
	return <div class={styles.listSection}>{props.children}</div>;
}

export function ClientTable(props: { clients: Client[] }) {
	return (
		<>
			{props.clients.length === 0 && <p class={styles.noClients}>No clients are connected.</p>}
			{props.clients.length > 0 && (
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
			)}
		</>
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
