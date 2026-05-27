import { onCleanup, onMount, type JSX } from "solid-js";

import styles from "./PageMessage.module.css";

export function PageMessage(props: { title: string; children: JSX.Element }) {
	let dialog: HTMLDialogElement | undefined;

	onMount(() => {
		queueMicrotask(() => {
			if (dialog && !dialog.open) {
				dialog.showModal();
			}
		});
	});

	onCleanup(() => {
		if (dialog?.open) {
			dialog.close();
		}
	});

	return (
		<dialog
			ref={(element) => {
				dialog = element;
			}}
			class={styles.dialog}
			onCancel={(event) => event.preventDefault()}
		>
			<h2 class={styles.title}>{props.title}</h2>
			<p class={styles.body}>{props.children}</p>
		</dialog>
	);
}
