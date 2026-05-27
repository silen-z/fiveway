import { type InspectorNode } from "@fiveway/core/inspector";
import { Show } from "solid-js";

import { useDevtoolsContext } from "../context.ts";
import * as icon from "./icons.ts";
import { InspectedHandler } from "./InspectedHandler.tsx";

import styles from "./InspectedNode.module.css";

export function InspectedNode(props: { node: InspectorNode; onClose: (() => void) | null }) {
	const devtools = useDevtoolsContext();

	return (
		<section class={styles.root} aria-label="Inspected node details">
			<Show when={props.onClose != null}>
				<button
					type="button"
					class={styles.closeButton}
					title="Follow focused node"
					aria-label="Follow focused node"
					onClick={() => props.onClose?.()}
				>
					<icon.X size={14} />
				</button>
			</Show>

			<div class={styles.header}>
				<span class={styles.headerLabel}>
					{props.node.id === devtools.inspectedTree()?.focus ? "Focused" : "Inspecting"}
				</span>
				<span class={styles.headerValue}>{props.node.id}</span>
			</div>

			<Show when={props.node.handler}>{(handler) => <InspectedHandler handler={handler()} />}</Show>
		</section>
	);
}
