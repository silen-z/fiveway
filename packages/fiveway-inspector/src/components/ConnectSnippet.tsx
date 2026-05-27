import { query } from "@solidjs/router";
import { getRequestURL } from "@solidjs/start/http";
import { type JSX } from "solid-js";

import styles from "./ConnectSnippet.module.css";

export const getInspectorOrigin = query(async () => {
	"use server";

	return getRequestURL().origin;
}, "inspectorOrigin");

export function ConnectSnippet(props: { origin: string; children: JSX.Element }) {
	const src = `${props.origin}/connect`;

	return (
		<section class={styles.connect} aria-label="Connect a client">
			<p class={styles.connectLead}>{props.children}</p>
			<div class={styles.connectBox}>
				<pre class={styles.connectPre}>
					<code class={styles.snippet}>
						<span class={styles.punct}>&lt;</span>
						<span class={styles.tag}>script</span>
						<span> </span>
						<span class={styles.attrName}>crossorigin</span>
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
		</section>
	);
}
