import { type NavigationAction } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationNode } from "../tree/node.ts";
import { activationHandler, type ActivateCallback } from "./activate.ts";
import { composeHandlers, type ComposedHandler } from "./composed.ts";
import { focusHandler } from "./focus.ts";

/**
 * Navigation handler is a function that handles actions dispatched to navigation node
 * and usually returns `NodeId` of the next node to focus.
 *
 * @see {@link https://fiveway.dev/guide/handlers} for more information about handlers.
 * @see {@link NavigationAction} for available actions.
 * @see {@link NavigationHandlerContext} for context passed to the handler.
 * @see {@link HandlerNext} for passing actions to the next handler in the chain.
 */
export type NavigationHandler = (
	action: NavigationAction,
	ctx: NavigationHandlerContext,
) => NodeId | null;

/**
 * Context passed to {@link NavigationHandler}.
 *
 * @see {@link HandlerNext}
 */
export interface NavigationHandlerContext {
	/**
	 * The node on which the action was executed.
	 */
	node: NavigationNode;

	/**
	 * `next` function used to pass actions to other handlers / nodes
	 */
	next: HandlerNext;
}

/**
 * Function passed to navigation handler context that can be used to pass action to the next handler in the chain.
 * Can be also used to dispatch different action on arbitrary nodes.
 *
 * @param id - The ID of the next node to handle the action. When not provided, the action is passed to the current node.
 * @param action - The action to handle. When not provided, current action is used.
 *
 * @see {@link NavigationHandler} for more information about handlers.
 * @see {@link NavigationHandlerContext} for context passed to the handler.
 */
export type HandlerNext = (id?: NodeId, action?: NavigationAction) => NodeId | null;

/**
 * Runs `action` through the handler chain starting at `nodeId`.
 *
 * Call `next()` to stop at the current node, `next(parentId)` to delegate to another node
 * (optionally with a different action).
 */
export function executeHandler(node: NavigationNode, action: NavigationAction): NodeId | null {
	const next: HandlerNext = (id, newAction) => {
		if (id == null) {
			return null;
		}

		const nextNode = node.tree.nodes.get(id);
		if (nextNode == null || !nextNode.connected) {
			return null;
		}

		return executeHandler(nextNode, newAction ?? action);
	};

	return node.handler(action, { node, next });
}

/**
 * Primitive navigation handler that passes all actions to its parent node.
 * Query action is an exception and is not passed to parent nodes.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#parent-handler}
 * @see {@link NavigationHandler}
 */
export function parentHandler(
	action: NavigationAction,
	ctx: NavigationHandlerContext,
): NodeId | null {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "parent" });
	}

	if (action.kind === "query") {
		return null;
	}

	if (ctx.node.parent !== null) {
		return ctx.next(ctx.node.parent);
	}

	return ctx.next();
}

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
