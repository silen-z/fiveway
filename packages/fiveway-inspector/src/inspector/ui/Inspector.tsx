import { Show } from "solid-js";

import {
	type InspetorInit,
	type InspectedTree,
	createDevtoolsContext,
	devtoolsContext,
	useDevtoolsContext,
} from "../context.ts";
import { InspectedNode } from "./InspectedNode.tsx";
import { InspectorHeader } from "./InspectorHeader.tsx";
import { TreeNode } from "./TreeNode.tsx";

import "../../tokens.css";
import styles from "./Inspector.module.css";

export function Inspector(props: { handle: InspetorInit }) {
	const devtools = createDevtoolsContext(props.handle);

	return (
		<devtoolsContext.Provider value={devtools}>
			<div class={styles.panel}>
				<Show when={devtools.inspectedTree()} keyed>
					{(tree) => <InspectedTree tree={tree} />}
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

function InspectedTree(props: { tree: InspectedTree }) {
	const devtools = useDevtoolsContext();

	return (
		<div class={styles.inspector}>
			<InspectorHeader tree={props.tree} />

			<div class={styles.split}>
				<div class={styles.treePane}>
					<div class={styles.tree}>
						<TreeNode tree={props.tree} node="#" />
					</div>
				</div>

				<Show when={devtools.inspectedNode()}>
					{(node) => (
						<div class={styles.inspectedPane}>
							<InspectedNode
								node={node()}
								onClose={props.tree.inspected != null ? () => devtools.inspectNode(null) : null}
							/>
						</div>
					)}
				</Show>
			</div>
		</div>
	);
}
