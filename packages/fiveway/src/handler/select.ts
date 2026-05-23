import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree, focusNode } from "../tree/tree.ts";
import { type NavigationHandler, runHandler } from "./handler.ts";

/**
 * Callback function that is called when a select action is triggered on node with {@link selectHandler}.
 *
 * @param options - The options for the select action.
 */
export type SelectCallback = (options: { longpress: boolean }) => void;

/**
 * Navigation handler factory that creates a handler that invokes `onSelect` when a select action is triggered.
 */
export const selectHandler: (onSelect: SelectCallback) => NavigationHandler = createSelectHandler;

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

/**
 * Options for {@link selectNode}.
 */
export interface SelectNodeOptions {
	/**
	 * Whether to focus the node before selecting it.
	 * @default `true`
	 */
	focus?: boolean;
}

/**
 * Selects a node by invoking the `select` action on it.
 *
 * {@see {@link SelectNodeOptions}}
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
