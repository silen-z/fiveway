import { query } from "@solidjs/router";
import { getRequestURL } from "@solidjs/start/http";

import styles from "./ConnectInformation.module.css";

export const getInspectorOrigin = query(async () => {
	"use server";

	return getRequestURL().origin;
}, "inspectorOrigin");

export const ConnectInformation =
	import.meta.env.VITE_DEMO_INSTANCE === "true"
		? DemoConnectInformation
		: RegularConnectInformation;

function RegularConnectInformation(props: { origin: string }) {
	return (
		<section class={styles.connect} aria-label="Connect a client">
			<p class={styles.text}>To connect a client, add this script to your app:</p>
			<ScriptTag origin={props.origin} />
		</section>
	);
}

function DemoConnectInformation(props: { origin: string }) {
	return (
		<section class={styles.connect} aria-label="Connect a client">
			<p class={styles.text}>
				There are interactive examples configured to automatically connect to this inspector
				instance:
			</p>
			<p class={styles.text}>
				<a class={styles.link} href="https://react.fiveway.dev" target="_blank" rel="noreferrer">
					React
				</a>
				<a class={styles.link} href="https://solid.fiveway.dev" target="_blank" rel="noreferrer">
					Solid
				</a>
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
