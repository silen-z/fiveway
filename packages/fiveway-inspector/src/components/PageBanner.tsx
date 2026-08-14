import { type JSX } from "@solidjs/web";

import styles from "./PageBanner.module.css";

export function PageBanner(props: { title: string; children: JSX.Element }) {
	return (
		<div class={styles.banner}>
			<h2 class={styles.title}>{props.title}</h2>
			<p class={styles.body}>{props.children}</p>
		</div>
	);
}

export function ClientId(props: { children: JSX.Element }) {
	return <code class={styles.clientId}>{props.children}</code>;
}
