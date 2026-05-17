import { swapRemove } from "../lib/array.ts";
import { type NodeId } from "./id.ts";
import { type NavigationTree } from "./tree.ts";

export type FocusListener = () => void;

/**
 * Registers `listener` on `id`.
 *
 * The listener runs when a focus transition affects that node (along the converging path
 * between old and new focus).
 *
 * Returns an unsubscribe function.
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
