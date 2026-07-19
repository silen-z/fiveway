import { Show } from "solid-js";

import { type InspetorInit, createDevtoolsContext, devtoolsContext } from "../context.ts";
import { TreeInspector } from "./TreeInspector.tsx";

import "../../tokens.css";
import styles from "./Inspector.module.css";

export function Inspector(props: { handle: InspetorInit }) {
	const devtools = createDevtoolsContext(props.handle);

	return (
		<devtoolsContext.Provider value={devtools}>
			<div class={styles.panel}>
				<Show when={devtools.inspectedTree()} keyed>
					{(tree) => <TreeInspector tree={tree} />}
				</Show>
				<Show when={Object.keys(devtools.trees).length === 0}>
					<div class={styles.noTreesDetected} role="status" aria-live="polite" aria-busy="true">
						<div class={styles.spinner} aria-hidden="true" />
						<p class={styles.noTreesDetectedText}>Detecting navigation trees…</p>
					</div>
				</Show>
			</div>
		</devtoolsContext.Provider>
	);
}
