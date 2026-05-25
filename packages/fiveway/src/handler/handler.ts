import { type NavigationAction } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationNode } from "../tree/node.ts";
import { type NavigationTree } from "../tree/tree.ts";
import { activationHandler, type ActivateCallback } from "./activate.ts";
import { composeHandlers, type ComposedHandler } from "./composed.ts";
import { focusHandler } from "./focus.ts";

/**
 * Function passed to navigation handlers that can be used to pass action to the next handler in the chain.
 * Can be also used to dispatch different action on arbitrary nodes.
 *
 * @param id - The ID of the next node to handle the action. When not provided, the action is passed to the current node.
 * @param action - The action to handle. When not provided, current action is used.
 *
 * @see {@link NavigationHandler} for more information about handlers.
 */
export type HandlerNext = (id?: NodeId, action?: NavigationAction) => NodeId | null;

/**
 * Handler invoked on nodes when dispatching actions.
 *
 * Composite behavior is built with `composeHandlers` and specialized handlers.
 *
 * @see {@link NavigationAction} for available actions.
 * @see {@link HandlerNext} for passing actions to the next handler in the chain.
 */
export type NavigationHandler = (
	node: NavigationNode,
	action: NavigationAction,
	next: HandlerNext,
) => NodeId | null;

/**
 * Runs `action` through the handler chain starting at `nodeId`.
 *
 * Call `next()` to stop at the current node, `next(parentId)` to delegate to another node
 * (optionally with a different action).
 */
export function executeHandler(
	tree: NavigationTree,
	nodeId: NodeId,
	action: NavigationAction,
): NodeId | null {
	const node = tree.nodes.get(nodeId);
	if (node == null || !node.connected) {
		return null;
	}

	const next: HandlerNext = (id, newAction) => {
		if (id == null) {
			return null;
		}

		return executeHandler(tree, id, newAction ?? action);
	};

	return node.handler(node, action, next);
}

/**
 * Primitive navigation handler that passes all actions to its parent node.
 * Query action is an exception and is not passed to parent nodes.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#parent-handler}
 * @see {@link NavigationHandler}
 */
export const parentHandler: NavigationHandler = (node, action, next) => {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "parent" });
	}

	if (action.kind === "query") {
		return null;
	}

	if (node.parent !== null) {
		return next(node.parent);
	}

	return next();
};

/**
 * Basic composed navigation handler for nodes that can be focused. When not extended tt doesn't respond to any actions and passes them to parent.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#default-handler}
 * @see {@link ComposedHandler}
 */
export const defaultHandler: ComposedHandler = composeHandlers([focusHandler(), parentHandler]);

/**
 * Basic composed navigation handler similar to {@link defaultHandler}. It differs in that only allows node children to be focused but not the node itself.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#container-handler}
 * @see {@link ComposedHandler}
 */
export const containerHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false }),
	parentHandler,
]);

/**
 * If `onActivate` is provided, composes `activationHandler(onActivate)` onto `defaultHandler`;
 * otherwise returns `defaultHandler`.
 *
 * @see {@link ActivateCallback} for callback function that is called when node receives activate action.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#item-handler}
 * @see {@link ComposedHandler}
 */
export const itemHandler = (onActivate?: ActivateCallback): ComposedHandler => {
	if (onActivate == null) {
		return defaultHandler;
	}

	return defaultHandler.compose(activationHandler(onActivate));
};
