import { isFocused } from "@fiveway/core";
import { clsx } from "clsx";
import { createMemo, createSignal, For, Show } from "solid-js";

import { type InspectedTree, useDevtoolsContext } from "../context.ts";
import * as icon from "./icons.ts";

import styles from "./TreeNode.module.css";

export function TreeNode(props: { tree: InspectedTree; node: string }) {
	const devtools = useDevtoolsContext();

	const isRoot = () => props.node === "#";

	const node = createMemo(() => props.tree.nodes[props.node]);

	const [isNodeExpanded, setExpanded] = createSignal(false);

	const isNodeFocused = createMemo(
		() => props.tree.focus != null && isFocused(props.tree.focus, props.node),
	);

	const isExpanded = createMemo(() => props.tree.expanded || isNodeExpanded() || isNodeFocused());

	const isInspected = createMemo(() => props.tree.inspected === props.node);

	const childCount = createMemo(() => node()?.children.length ?? 0);

	const focusNode = () => {
		devtools.sendCommand({
			kind: "dispatchAction",
			tree: props.tree.label,
			node: props.node,
			action: { kind: "focus", direction: null },
		});
	};

	return (
		<div>
			<div
				class={styles.node}
				data-root={isRoot() ? "true" : "false"}
				data-focused={isNodeFocused() ? "true" : "false"}
				data-inspected={isInspected() ? "true" : "false"}
				data-children={childCount() > 0 ? "true" : "false"}
			>
				<span
					class={styles.nodeLabel}
					title={props.node}
					onClick={(e) => {
						if (e.ctrlKey) {
							focusNode();
							return;
						}

						devtools.inspectNode(props.node);
						if (childCount() > 0) {
							setExpanded((o) => !o);
						}
					}}
				>
					<Show
						when={childCount() > 0}
						fallback={
							<div class={styles.nodeKindIcon} aria-hidden="true">
								<icon.CircleDot size={14} />
							</div>
						}
					>
						<span class={styles.nodeChevron} aria-hidden="true">
							{isExpanded() ? <icon.ChevronDown size={14} /> : <icon.ChevronRight size={14} />}
						</span>
					</Show>

					<span class={styles.nodeLabelText}>{isRoot() ? "# (root)" : localId(props.node)}</span>
				</span>

				<div class={styles.nodeActions}>
					<Show when={isRoot()}>
						<ExpandButton expanded={props.tree.expanded} onToggle={devtools.toggleExpand} />
					</Show>
					<Show when={!isNodeFocused() && childCount() > 0}>
						<ExpandButton expanded={isExpanded()} onToggle={() => setExpanded((o) => !o)} />
					</Show>
					<Show when={!isNodeFocused()}>
						<button
							type="button"
							class={clsx(styles.nodeActionButton, styles.nodeActionButtonRevealOnHover)}
							title="Focus this node in the app"
							aria-label="Focus in app"
							onClick={() => focusNode()}
						>
							<icon.Focus size={14} />
						</button>
					</Show>
					<Show when={props.tree.focus === props.node}>
						<span
							class={styles.nodeFocusIndicator}
							title="Focused in app"
							role="img"
							aria-label="Focused in app"
						>
							<icon.Focus size={14} />
						</span>
					</Show>
				</div>
			</div>

			<Show when={childCount() > 0}>
				<div class={styles.nodeContainer} data-open={isExpanded() ? "true" : "false"}>
					<For each={props.tree.nodes[props.node]?.children ?? []}>
						{(nodeId) => <TreeNode tree={props.tree} node={nodeId} />}
					</For>
				</div>
			</Show>
		</div>
	);
}

function ExpandButton(props: { expanded: boolean; onToggle: () => void }) {
	const label = () => (props.expanded ? "Collapse" : "Expand");

	return (
		<button
			type="button"
			class={clsx(styles.nodeActionButton, styles.nodeActionButtonRevealOnHover)}
			title={label()}
			aria-pressed={props.expanded}
			aria-label={label()}
			onClick={() => props.onToggle()}
		>
			{props.expanded ? <icon.FoldVertical size={14} /> : <icon.UnfoldVertical size={14} />}
		</button>
	);
}

function localId(nodeId: string) {
	return nodeId.split("/").pop() ?? nodeId;
}
