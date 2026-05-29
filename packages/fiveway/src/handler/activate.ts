import { type ActivateAction } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree, dispatchAction, focusNode } from "../tree/tree.ts";
import { type NavigationHandler } from "./handler.ts";

/**
 * Callback function that is called when an activate action is triggered on a node with {@link activationHandler}.
 *
 * @param options - The options for the activate action.
 * @param options.longpress - Whether the activate action was triggered by a long press.
 */
export type ActivateCallback = (options: { longpress?: boolean }) => void;

/**
 * Navigation handler factory that creates a {@link NavigationHandler} that invokes callback when an activate action is received.
 *
 * @param onActivate - function that is called when node receives `activate` action
 *
 * @see {@link ActivateCallback}
 * @see {@link https://fiveway.dev/guide/built-in-handlers#activation-handler}
 * @see {@link NavigationHandler}
 */
export const activationHandler: (onActivate: ActivateCallback) => NavigationHandler =
	createActivationHandler;

function createActivationHandler(onActivate: ActivateCallback): NavigationHandler {
	const activationHandler: NavigationHandler = (action, { next }) => {
		if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
			describeHandler(action, { name: "activate" });
		}

		if (action.kind === "activate") {
			onActivate({ longpress: action.longpress });
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
	 * Whether to focus the node before activating it. Default: `true`.
	 */
	focus?: boolean;

	/**
	 * Whether the activate action was triggered by a long press. Default: `false`.
	 */
	longpress?: boolean;
}

/**
 * Activates a node by invoking the `activate` action on it.
 *
 * @see {@link ActivateNodeOptions} for options
 * @see {@link ActivateAction}
 */
export function activateNode(
	tree: NavigationTree,
	nodeId: NodeId,
	options?: ActivateNodeOptions,
): void {
	if (options?.focus ?? true) {
		focusNode(tree, nodeId);
	}

	const action: ActivateAction = {
		kind: "activate",
		longpress: options?.longpress,
	};

	dispatchAction(tree, action, nodeId);
}
