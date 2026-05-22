import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree, focusNode } from "../tree/tree.ts";
import { type NavigationHandler, runHandler } from "./handler.ts";

export type SelectCallback = (options: { longpress: boolean }) => void;

function createSelectHandler(onSelect: SelectCallback): NavigationHandler {
	const selectHandler: NavigationHandler = (_, action, next) => {
		if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
			describeHandler(action, { name: "select" });
		}

		if (action.kind === "select") {
			onSelect({ longpress: action.longpress === true });
			return null;
		}

		return next();
	};

	return selectHandler;
}

export type SelectNodeOptions = {
	focus?: boolean;
};

/**
 * By default focuses `nodeId` first (`focus` defaults to `true`), then runs the `select`
 * action through that node’s handler.
 */
export function selectNode(
	tree: NavigationTree,
	nodeId: NodeId,
	options?: SelectNodeOptions,
): void {
	if (options?.focus ?? true) {
		focusNode(tree, nodeId);
	}

	runHandler(tree, nodeId, { kind: "select" });
}

/**
 * Invokes `onSelect` when the action is `select`.
 *
 * Used inside `itemHandler`.
 */
export { createSelectHandler as selectHandler };
