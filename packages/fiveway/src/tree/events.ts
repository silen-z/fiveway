import { swapRemove } from "../lib/array.ts";
import { type NodeId } from "./id.ts";
import { type NavigationTree } from "./tree.ts";

/**
 * Callback function that is called when a focus transition affects a node.
 *
 * @see {@link registerListener} to register a listener
 */
export type FocusListener = () => void;

/**
 * Registers a focus listener for `id`. The listener runs when a focus of given ID or any of its descendants changes.
 *
 * Listeners can be registered for node IDs of nodes that are not inserted in the tree.
 * They are also not automatically removed when the node is removed from the tree.
 *
 * @return an unsubscribe function.
 *
 * @see {@link FocusListener}
 */
export function registerListener(
	tree: NavigationTree,
	id: NodeId,
	listener: FocusListener,
): () => void {
	const listeners = tree.listeners.get(id);
	if (listeners != null) {
		listeners.push(listener);
	} else {
		tree.listeners.set(id, [listener]);
	}

	return () => {
		const listeners = tree.listeners.get(id);
		if (listeners == null) {
			return;
		}

		const index = listeners.findIndex((l) => l === listener);
		if (index === -1) {
			return;
		}

		if (listeners.length === 1) {
			tree.listeners.delete(id);
		} else {
			swapRemove(listeners, index);
		}
	};
}

export function notifyListeners(tree: NavigationTree, nodeId: NodeId): void {
	const listeners = tree.listeners.get(nodeId);
	if (listeners == null) {
		return;
	}

	for (const listener of listeners) {
		listener();
	}
}
