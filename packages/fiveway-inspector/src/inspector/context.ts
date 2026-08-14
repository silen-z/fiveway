import {
	type InspectorMessage,
	type InspectorCommand,
	type InspectorNode,
} from "@fiveway/core/inspector";
import { createContext, useContext, createMemo, createStore, onSettled } from "solid-js";

export type ReloadMessage = { type: "fiveway:reload" };

export type InspetorInit = {
	subscribe(callback: (update: InspectorMessage | ReloadMessage) => void): () => void;
	sendCommand: (command: InspectorCommand) => void;
};

export type InspectedTree = {
	label: string;
	focus: string | null;
	nodes: Record<string, InspectorNode>;
	expanded: boolean;
	/** Explicitly selected node; `null` follows {@link InspectedTree.focus}. */
	inspected: string | null;
};

export type InspectorState = {
	selected: string | null;
	trees: Record<string, InspectedTree>;
};

export type InspectorContext = {
	trees: Record<string, InspectedTree>;
	inspectedTree: () => InspectedTree | null;
	inspectedNode: () => InspectorNode | null;
	sendCommand: (command: InspectorCommand) => void;
	toggleExpand: () => void;
	selectTree: (label: string) => void;
	inspectNode: (nodeId: string | null) => void;
};

export const DevtoolsContext = createContext<InspectorContext>();

export function createDevtoolsContext(handle: InspetorInit): InspectorContext {
	const [state, setState] = createStore<InspectorState>({
		selected: null,
		trees: {},
	});

	onSettled(() => {
		handle.sendCommand({ kind: "requestCompleteSnapshot", tree: "*" });

		const unsubscribe = handle.subscribe((message) => {
			if (message.type === "fiveway:reload") {
				setState((state) => {
					state.trees = {};
				});
				handle.sendCommand({ kind: "requestCompleteSnapshot", tree: "*" });
				return;
			}

			const treeLabel = message.tree;
			const existed = state.trees[treeLabel] != null;

			setState((state) => {
				if (state.trees[treeLabel] == null) {
					state.trees[treeLabel] = {
						label: treeLabel,
						focus: null,
						nodes: {},
						expanded: false,
						inspected: null,
					};
				}
			});

			if (!existed && !message.complete) {
				handle.sendCommand({
					kind: "requestCompleteSnapshot",
					tree: treeLabel,
				});
				return;
			}

			setState((state) => {
				const tree = state.trees[treeLabel];
				if (tree == null) {
					return;
				}

				if (message.focus != null && message.focus !== tree.focus) {
					tree.focus = message.focus;
					tree.inspected = null;
					handle.sendCommand({
						kind: "inspectHandler",
						tree: tree.label,
						node: message.focus,
					});
				}

				if (message.nodes != null) {
					for (const node of message.nodes) {
						tree.nodes[node.id] = node;
					}
				}

				if (message.removedNodes != null) {
					for (const node of message.removedNodes) {
						delete tree.nodes[node];
					}
				}
			});
		});

		return unsubscribe;
	});

	const inspectedTree = createMemo(() => {
		const label = state.selected;
		if (label == null) {
			return Object.values(state.trees)[0] ?? null;
		}

		return state.trees[label] ?? Object.values(state.trees)[0] ?? null;
	});

	const selectTree = (label: string) => {
		setState((state) => {
			state.selected = label;
		});
	};

	const toggleExpand = () => {
		const tree = inspectedTree();
		if (tree == null) {
			return;
		}

		setState((state) => {
			const target = state.trees[tree.label];
			if (target == null) {
				return;
			}

			target.expanded = !target.expanded;
		});
	};

	const inspectNode = (nodeId: string | null) => {
		const tree = inspectedTree();
		if (tree == null) {
			return;
		}

		if (nodeId !== null) {
			handle.sendCommand({
				kind: "inspectHandler",
				tree: tree.label,
				node: nodeId,
			});
		}
		setState((state) => {
			const target = state.trees[tree.label];
			if (target == null) {
				return;
			}

			target.inspected = nodeId;
		});
	};

	const inspectedNode = createMemo(() => {
		const tree = inspectedTree();
		if (tree == null) {
			return null;
		}

		const id = tree.inspected ?? tree.focus ?? "#";
		return tree.nodes[id] ?? null;
	});

	return {
		get trees() {
			return state.trees;
		},
		inspectedTree,
		inspectedNode,
		sendCommand: handle.sendCommand,
		toggleExpand,
		selectTree,
		inspectNode,
	};
}

export function useDevtoolsContext() {
	return useContext(DevtoolsContext);
}
