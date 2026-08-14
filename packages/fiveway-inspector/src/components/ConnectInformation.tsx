import { dynamic, getRequestEvent } from "@solidjs/web";
import { For, Loading } from "solid-js";

import styles from "./ConnectInformation.module.css";

const CONNECTED_SITES = parseConnectedSites(import.meta.env.VITE_CONNECTED_SITES ?? "");

export const ConnectInformation =
	CONNECTED_SITES.length > 0 ? ConnectedSitesConnectInformation : RegularConnectInformation;

const getConnectSnippet = async () => {
	"use server";

	const event = getRequestEvent();
	if (event == null) {
		throw new Error("No request event");
	}

	const origin = new URL(event.request.url).origin;

	return () => {
		const src = `${origin}/connect.js`;

		return (
			<div class={styles.box}>
				<pre class={styles.pre}>
					<code class={styles.snippet}>
						<span class={styles.punct}>&lt;</span>
						<span class={styles.tag}>script</span>
						<span> </span>
						<span class={styles.attrName}>src</span>
						<span class={styles.punct}>=</span>
						<span class={styles.attrValue}>"{src}"</span>
						<span class={styles.punct}>&gt;&lt;/</span>
						<span class={styles.tag}>script</span>
						<span class={styles.punct}>&gt;</span>
					</code>
				</pre>
			</div>
		);
	};
};

function RegularConnectInformation() {
	const ConnectSnippet = dynamic(() => getConnectSnippet());

	return (
		<section class={styles.connect} aria-label="Connect a client">
			<p class={styles.text}>To connect a client, add this script to your app:</p>
			<Loading>
				<ConnectSnippet />
			</Loading>
		</section>
	);
}

function ConnectedSitesConnectInformation() {
	const ConnectSnippet = dynamic(() => getConnectSnippet());

	return (
		<section class={styles.connect} aria-label="Connect a client">
			<p class={styles.text}>
				There are interactive examples configured to automatically connect to this inspector
				instance:
			</p>
			<p class={styles.text}>
				<For each={CONNECTED_SITES}>
					{(site) => (
						<a class={styles.link} href={site.url} target="_blank" rel="noreferrer">
							{site.label}
						</a>
					)}
				</For>
			</p>
			<p class={styles.text}>or you can connect your own client using this script:</p>
			<Loading>
				<ConnectSnippet />
			</Loading>
			<p class={styles.warning}>
				Warning: this inspector instance is publicly accessible. Anyone can inspect your connected
				client.
			</p>
		</section>
	);
}

function parseConnectedSites(value: string) {
	const sites: { label: string; url: string }[] = [];

	for (const rawEntry of value.split(";")) {
		const entry = rawEntry.trim();
		if (entry.length === 0) {
			continue;
		}

		const separator = entry.indexOf(":");
		const label = entry.slice(0, separator).trim();
		const url = entry.slice(separator + 1).trim();

		if (label.length === 0 || !URL.canParse(url)) {
			continue;
		}

		sites.push({ label, url });
	}

	return sites;
}
