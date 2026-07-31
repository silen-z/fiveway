import { query } from "@solidjs/router";
import { getRequestURL } from "@solidjs/start/http";
import { For } from "solid-js";

import styles from "./ConnectInformation.module.css";

export const getInspectorOrigin = query(async () => {
	"use server";

	return getRequestURL().origin;
}, "inspectorOrigin");

const CONNECTED_SITES = parseConnectedSites(import.meta.env.VITE_CONNECTED_SITES ?? "");

export const ConnectInformation =
	CONNECTED_SITES.length > 0 ? ConnectedSitesConnectInformation : RegularConnectInformation;

function RegularConnectInformation(props: { origin: string }) {
	return (
		<section class={styles.connect} aria-label="Connect a client">
			<p class={styles.text}>To connect a client, add this script to your app:</p>
			<ScriptTag origin={props.origin} />
		</section>
	);
}

function ConnectedSitesConnectInformation(props: { origin: string }) {
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
			<ScriptTag origin={props.origin} />
			<p class={styles.warning}>
				Warning: this inspector instance is publicly accessible. Anyone can inspect your connected
				client.
			</p>
		</section>
	);
}

function ScriptTag(props: { origin: string }) {
	const src = `${props.origin}/connect.js`;

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
