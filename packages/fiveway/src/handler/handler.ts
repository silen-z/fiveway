import { type NavigationAction } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavtreeNode } from "../tree/node.ts";
import { type NavigationTree } from "../tree/tree.ts";
import { composeHandlers, type ComposedHandler } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { selectHandler } from "./select.ts";

export type HandlerNext = (id?: NodeId, action?: NavigationAction) => NodeId | null;

export type NavigationHandler = (
	node: NavtreeNode,
	action: NavigationAction,
	next: HandlerNext,
) => NodeId | null;

export function runHandler(
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

		return runHandler(tree, id, newAction ?? action);
	};

	return node.handler(node, action, next);
}

export const parentHandler: NavigationHandler = (node, action, next) => {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "core:parent" });
	}

	if (action.kind === "query") {
		return null;
	}

	if (node.parent !== null) {
		return next(node.parent);
	}

	return next();
};

export const defaultHandler: ComposedHandler = composeHandlers([focusHandler(), parentHandler]);

export const containerHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false }),
	parentHandler,
]);

export const itemHandler = (onSelect?: () => void): ComposedHandler => {
	if (onSelect == null) {
		return defaultHandler;
	}

	return defaultHandler.compose(selectHandler(onSelect));
};
