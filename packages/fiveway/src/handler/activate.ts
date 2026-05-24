import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree, focusNode } from "../tree/tree.ts";
import { type NavigationHandler, runHandler } from "./handler.ts";

/**
 * Callback function that is called when an activate action is triggered on a node with {@link activationHandler}.
 *
 * @param options - The options for the activate action.
 * @param options.longpress - Whether the activate action was triggered by a long press.
 */
export type ActivateCallback = (options: { longpress: boolean }) => void;

/**
 * Navigation handler factory that creates a handler that invokes `onActivate` when an activate action is triggered.
 */
export const activationHandler: (onActivate: ActivateCallback) => NavigationHandler =
	createActivationHandler;

function createActivationHandler(onActivate: ActivateCallback): NavigationHandler {
	const activationHandler: NavigationHandler = (_, action, next) => {
		if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
			describeHandler(action, { name: "activate" });
		}

		if (action.kind === "activate") {
			onActivate({ longpress: action.longpress === true });
			return null;
		}

		return next();
	};

	return activationHandler;
}

/**
 * Options for {@link activateNode}.
 */
export interface ActivateNodeOptions {
	/**
	 * Whether to focus the node before activating it.
	 * @default `true`
	 */
	focus?: boolean;
}

/**
 * Activates a node by invoking the `activate` action on it.
 *
 * @see {@link ActivateNodeOptions}
 */
export function activateNode(
	tree: NavigationTree,
	nodeId: NodeId,
	options?: ActivateNodeOptions,
): void {
	if (options?.focus ?? true) {
		focusNode(tree, nodeId);
	}

	runHandler(tree, nodeId, { kind: "activate" });
}
