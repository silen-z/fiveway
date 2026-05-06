import { type NavigationAction, type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, childLocalId } from "../tree/id.ts";
import { type NavtreeNode } from "../tree/node.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type HandlerNext, parentHandler } from "./handler.ts";

/**
 * Primitive handler that only handles `move` actions in up and down directions
 * by focusing the previous or next child respectively.
 *
 * This is a primitive handler and as such is meant to be used as part of a composed handler.
 *
 * @see {@link verticalHandler} for a composed handler that uses `verticalMovementHandler`.
 */
export function verticalMovementHandler(
	node: NavtreeNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "core:vertical-movement" });
	}

	if (action.kind !== "move") {
		return next();
	}

	if (action.direction === "up") {
		const previousId = findPreviousChild(node, (id) =>
			next(id, { kind: "focus", direction: "up" }),
		);

		return previousId ?? next();
	}

	if (action.direction === "down") {
		const nextId = findNextChild(node, (id) => next(id, { kind: "focus", direction: "down" }));

		return nextId ?? next();
	}

	return next();
}

function verticalFocusDirection(dir: NavigationDirection | "initial" | null) {
	switch (dir) {
		case "up":
			return "backwards";
		case "down":
			return "forwards";
		default:
			return null;
	}
}

/**
 * Composed handler that handles `move` actions in up and down directions by focusing the previous or next child respectively.
 *
 * It respects direction of incoming focus and can't be focused by itself when it it has no children.
 */
export const verticalHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false, direction: verticalFocusDirection }),
	verticalMovementHandler,
	parentHandler,
]);

/**
 * Primitive handler that only handles `move` actions in left and right directions
 * by focusing the previous or next child respectively.
 *
 * This is a primitive handler and as such is meant to be used as part of a composed handler.
 *
 * @see {@link horizontalHandler} for a composed handler that uses `horizontalMovementHandler`.
 */
export function horizontalMovementHandler(
	node: NavtreeNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "core:horizontal-movement" });
	}

	if (action.kind !== "move") {
		return next();
	}

	if (action.direction === "left") {
		const previousId = findPreviousChild(node, (id) =>
			next(id, { kind: "focus", direction: "left" }),
		);

		return previousId ?? next();
	}

	if (action.direction === "right") {
		const nextId = findNextChild(node, (id) => next(id, { kind: "focus", direction: "right" }));

		return nextId ?? next();
	}

	return next();
}

function horizontalFocusDirection(dir: NavigationDirection | "initial" | null) {
	switch (dir) {
		case "left":
			return "backwards";
		case "right":
			return "forwards";
		default:
			return null;
	}
}

/**
 * Composed handler that handles `move` actions in left and right directions by focusing the previous or next child respectively.
 *
 * It respects direction of incoming focus and can't be focused by itself when it it has no children.
 */
export const horizontalHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false, direction: horizontalFocusDirection }),
	horizontalMovementHandler,
	parentHandler,
]);

function findNextChild(node: NavtreeNode, check: (id: NodeId) => NodeId | null) {
	const currentChildId = childLocalId(node.id, node.tree.focus);
	if (currentChildId === null) {
		return null;
	}

	const currentIndex = node.children.findIndex((c) => c.id === currentChildId);

	for (let i = currentIndex + 1; i < node.children.length; i++) {
		const child = node.children[i]!;
		if (!child.active) {
			continue;
		}

		const nextId = check(child.id);
		if (nextId !== null) {
			return nextId;
		}
	}

	return null;
}

function findPreviousChild(node: NavtreeNode, check: (id: NodeId) => NodeId | null) {
	const currentChildId = childLocalId(node.id, node.tree.focus);
	if (currentChildId === null) {
		return null;
	}

	const currentIndex = node.children.findIndex((c) => c.id === currentChildId);

	for (let i = currentIndex - 1; i >= 0; i--) {
		const child = node.children[i]!;
		if (!child.active) {
			continue;
		}

		const nextId = check(child.id);
		if (nextId !== null) {
			return nextId;
		}
	}

	return null;
}
