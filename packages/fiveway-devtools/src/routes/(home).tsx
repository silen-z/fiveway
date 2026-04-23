import { createAsync } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { For, Show } from "solid-js";

import { getClients, type Client } from "../bridge.ts";

const ScriptTag = clientOnly(() => import("../components/scriptTag.tsx"));

export default function Home() {
	const clients = createAsync(() => getClients());

	const hasClients = () => (clients()?.length ?? 0) > 0;

	return (
		<>
			<header class="border-b border-base-200 bg-base-100 px-4 py-2 sm:px-6 sm:py-3">
				<div class="container mx-auto flex max-w-7xl flex-col gap-1 sm:gap-2">
					<div class="flex flex-col gap-2 min-[600px]:flex-row min-[600px]:items-center min-[600px]:justify-between min-[600px]:gap-3">
						<h1 class="shrink-0 text-2xl font-normal">
							<strong class="font-bold text-primary">fiveway</strong> / inspector
						</h1>

						<Show when={hasClients()}>
							<div class="flex min-w-0 flex-col gap-1.5 min-[600px]:min-h-9 min-[600px]:flex-row min-[600px]:items-center min-[600px]:gap-3">
								<div class="shrink-0 min-[600px]:max-w-[min(20rem,40%)] min-[600px]:self-center">
									Connect a client:
								</div>
								<pre>
									<ScriptTag />
								</pre>
							</div>
						</Show>

						<div class="shrink-0 self-end min-[600px]:self-center">
							<div class="flex flex-col items-end gap-0.5 text-right text-sm sm:text-base">
								<a class="link link-primary" href="https://fiveway.io">
									Documentation
								</a>
								<a
									class="link link-primary"
									href="https://github.com/silen-z/fiveway"
									target="_blank"
									rel="noreferrer"
								>
									GitHub
								</a>
							</div>
						</div>
					</div>
				</div>
			</header>
			<main class="container mx-auto px-4 py-6 sm:px-6">
				<table class="table">
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
						<Show when={hasClients()} fallback={<NoClientsConnected />}>
							<For each={clients()}>{(client) => <ClientRow client={client} />}</For>
						</Show>
					</tbody>
				</table>
			</main>
		</>
	);
}

function ClientRow(props: { client: Client }) {
	return (
		<tr>
			<td>{props.client.title}</td>
			<td>
				{props.client.url ? (
					<a target="_blank" href={props.client.url}>
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

function NoClientsConnected() {
	return (
		<tr>
			<td class="min-h-48 px-4 py-20 align-top text-balance text-base-content/60" colSpan={4}>
				<div class="mx-auto max-w-2xl space-y-4 text-center text-sm text-base-content/60">
					<div class="text-balance text-base-content/80">
						No clients are connected yet.
						<div class="mx-auto w-full max-w-2xl text-center text-sm">
							<pre>
								<ScriptTag fallback="..." />
							</pre>
						</div>
					</div>
				</div>
			</td>
		</tr>
	);
}
