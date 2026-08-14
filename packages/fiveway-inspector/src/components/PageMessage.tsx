import { type JSX } from "@solidjs/web";
import { onSettled } from "solid-js";

import styles from "./PageMessage.module.css";

export function PageMessage(props: { title: string; children: JSX.Element }) {
	return (
		<dialog
			ref={(element) => {
				onSettled(() => {
					element.showModal();
				});
			}}
			class={styles.dialog}
			onCancel={(event) => event.preventDefault()}
		>
			<h2 class={styles.title}>{props.title}</h2>
			<p class={styles.body}>{props.children}</p>
		</dialog>
	);
}
