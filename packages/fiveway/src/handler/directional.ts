import { type NavigationAction, type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, childLocalId } from "../tree/id.ts";
import { type NavigationNode } from "../tree/node.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type HandlerNext, parentHandler } from "./handler.ts";
// oxlint reports types used in JSDoc as unused
// oxlint-disable-next-line
import { type NavigationHandler } from "./handler.ts";

/**
 * Building block for {@link verticalHandler}.
 * Handles `move` actions in up and down directions by focusing the previous or next child respectively.
 *
 * This is a primitive handler and as such is meant to be used as part of a composed handler.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#directional-movement-handlers}
 * @see {@link NavigationHandler}
 */
export function verticalMovementHandler(
	node: NavigationNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "vertical-movement" });
	}

	if (action.kind !== "move") {
		return next();
	}

	if (action.direction === "up" || action.direction === "backwards") {
		const previousId = findPreviousChild(node, (id) =>
			next(id, { kind: "focus", direction: "up" }),
		);

		return previousId ?? next();
	}

	if (action.direction === "down" || action.direction === "forwards") {
		const nextId = findNextChild(node, (id) => next(id, { kind: "focus", direction: "down" }));

		return nextId ?? next();
	}

	return next();
}

function verticalFocusDirection(dir: NavigationDirection | "initial" | null) {
	if (dir === "up" || dir === "backwards") {
		return "backwards";
	}

	if (dir === "down" || dir === "forwards") {
		return "forwards";
	}

	return null;
}

/**
 * Navigation handler that handles movement in up and down directions
 * by focusing the previous or next child respectively.
 *
 * @example
 *
 * ```ts
 * const nav = useNavnode("list", verticalHandler);
 * ```
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#vertical-handler}
 * @see {@link ComposedHandler}
 */
export const verticalHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false, direction: verticalFocusDirection }),
	verticalMovementHandler,
	parentHandler,
]);

/**
 * Building block for {@link horizontalHandler}.
 * Handles `move` actions in left and right directions by focusing the previous or next child respectively.
 *
 * This is a primitive handler and as such is meant to be used as part of a composed handler.
 *
 * @see {@link NavigationHandler}
 * @see {@link https://fiveway.dev/guide/built-in-handlers#directional-movement-handlers}
 */
export function horizontalMovementHandler(
	node: NavigationNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "horizontal-movement" });
	}

	if (action.kind !== "move") {
		return next();
	}

	if (action.direction === "left" || action.direction === "backwards") {
		const previousId = findPreviousChild(node, (id) =>
			next(id, { kind: "focus", direction: "left" }),
		);

		return previousId ?? next();
	}

	if (action.direction === "right" || action.direction === "forwards") {
		const nextId = findNextChild(node, (id) => next(id, { kind: "focus", direction: "right" }));

		return nextId ?? next();
	}

	return next();
}

function horizontalFocusDirection(dir: NavigationDirection | "initial" | null) {
	if (dir === "left" || dir === "backwards") {
		return "backwards";
	}

	if (dir === "right" || dir === "forwards") {
		return "forwards";
	}

	return null;
}

/**
 * Navigation handler that handles movement in left and right directions
 * by focusing the previous or next child respectively.
 *
 * @example
 *
 * ```ts
 * const nav = useNavnode("list", horizontalHandler);
 * ```
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#horizontal-handler}
 * @see {@link ComposedHandler}
 */
export const horizontalHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false, direction: horizontalFocusDirection }),
	horizontalMovementHandler,
	parentHandler,
]);

function findNextChild(node: NavigationNode, check: (id: NodeId) => NodeId | null) {
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

function findPreviousChild(node: NavigationNode, check: (id: NodeId) => NodeId | null) {
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
