import { type InspectorMessage, type InspectorCommand, type InspectorNode } from "@fiveway/core";
import { createContext, useContext, createEffect, createMemo, onCleanup } from "solid-js";
import {} from "solid-js";
import { createStore, produce } from "solid-js/store";

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
	inspected: string;
};

export type InspectorState = {
	selected: string | null;
	trees: Record<string, InspectedTree>;
};

export type InspectorContext = {
	trees: Record<string, InspectedTree>;
	selectedTree: () => InspectedTree | null;
	sendCommand: (command: InspectorCommand) => void;
	toggleExpand: () => void;
	selectTree: (label: string) => void;
	inspectNode: (nodeId: string) => void;
};

export const devtoolsContext = createContext<InspectorContext>();

export function createDevtoolsContext(handle: InspetorInit): InspectorContext {
	const [state, setState] = createStore<InspectorState>({
		selected: null,
		trees: {},
	});

	createEffect(() => {
		handle.sendCommand({ kind: "requestCompleteSnapshot", tree: "*" });

		const unsubscribe = handle.subscribe((message) => {
			if (message.type === "fiveway:reload") {
				setState({ trees: {} });
				handle.sendCommand({ kind: "requestCompleteSnapshot", tree: "*" });
				return;
			}

			if (!(message.tree in state.trees)) {
				setState("trees", message.tree, {
					label: message.tree,
					focus: null,
					nodes: {},
					expanded: false,
					inspected: "#",
				});
				handle.sendCommand({ kind: "requestCompleteSnapshot", tree: message.tree });
			}

			setState(
				"trees",
				message.tree,
				produce((tree) => {
					if (message.focus != null) {
						tree.focus = message.focus;
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
				}),
			);
		});

		onCleanup(unsubscribe);
	});

	const selectedTree = createMemo(() => {
		const label = state.selected;
		if (label == null) {
			return Object.values(state.trees)[0] ?? null;
		}

		return state.trees[label] ?? Object.values(state.trees)[0] ?? null;
	});

	const selectTree = (label: string) => {
		setState("selected", label);
	};

	const toggleExpand = () => {
		const tree = selectedTree();
		if (tree == null) {
			return;
		}

		setState("trees", tree.label, "expanded", (prev) => !prev);
	};

	const inspectNode = (nodeId: string) => {
		const tree = selectedTree();
		if (tree == null) {
			return;
		}

		handle.sendCommand({ kind: "inspectHandler", tree: tree.label, node: nodeId });
		setState("trees", tree.label, "inspected", nodeId);
	};

	return {
		trees: state.trees,
		selectedTree: selectedTree,
		sendCommand: handle.sendCommand,
		toggleExpand,
		selectTree,
		inspectNode,
	};
}

export function useDevtoolsContext() {
	const context = useContext(devtoolsContext);
	if (context == null) {
		throw new Error("devtoolsContext not provided");
	}
	return context;
}
