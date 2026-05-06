import { type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, isParent } from "../tree/id.ts";
import { type NavtreeNode } from "../tree/node.ts";
import { type NavigationHandler } from "./handler.ts";
import { type DataHandler, dataHandler } from "./metadata.ts";

/**
 * Direction in which node children are considered for focus.
 */
export type FocusDirection = "forwards" | "backwards";

/**
 * Options for {@link createFocusHandler}
 */
export type FocusHandlerOptions = {
	/**
	 * Whether the node is focusable when it has no children.
	 * By default it is focusable.
	 */
	focusWhenEmpty?: boolean;

	/**
	 * A function that returns the focus direction based on the `move` action direction.
	 */
	direction?: (dir: NavigationDirection | "initial" | null) => FocusDirection | null;
};

/**
 * Handler factory that creates a primitive focusHandler that resolves `focus` actions by walking children.
 * It can be configured by passing options.
 * 
 * This handler is the most important handler that makes focus work and is used by all core composed handlers.
 */
function createFocusHandler(options: FocusHandlerOptions = {}): NavigationHandler {
	const focusWhenEmpty = options.focusWhenEmpty ?? true;

	const focusHandler: NavigationHandler = (node, action, next) => {
		if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
			describeHandler(action, {
				name: "core:focus",
				focusWhenEmpty,
				direction: options.direction != null ? "custom" : "default",
			});
		}

		if (action.kind !== "focus") {
			return next();
		}

		if (!node.children.some((c) => c.active)) {
			if (focusWhenEmpty) {
				return node.id;
			}

			return null;
		}

		const focusDirection = options.direction?.(action.direction) ?? null;
		if (focusDirection === null) {
			const initialChild = findInitialChild(node);
			if (initialChild !== null) {
				const childId = next(initialChild);
				if (childId !== null) {
					return childId;
				}
			}
		}

		if (focusDirection === "backwards") {
			for (let i = node.children.length - 1; i >= 0; i--) {
				const child = node.children[i]!;
				if (!child.active) {
					continue;
				}

				const nextId = next(child.id);
				if (nextId !== null) {
					return nextId;
				}
			}

			return null;
		}

		for (let i = 0; i < node.children.length; i++) {
			const child = node.children[i]!;
			if (!child.active) {
				continue;
			}

			const nextId = next(child.id);
			if (nextId !== null) {
				return nextId;
			}
		}

		return null;
	};

	return focusHandler;
}

export { createFocusHandler as focusHandler };

/**
 * Data handler that provides id for the preferred first child for initial focus.
 * 
 * Requires subsequent handler such as `focusHandler` to use the provided initial child id.
 * 
 * ```ts
 * import { initialHandler, verticalHandler } from "@fiveway/core";
 *
 * const handler = verticalHandler.compose(initialHandler('item2'));
 * ```
 */
export const initialHandler: DataHandler<string> = dataHandler("core:initial");

/**
 * Primitive handler that ensures the focus stays under the current node.
 *
 * This is a primitive handler and as such is meant to be used as part of a composed handler.
 *
 * ```ts
 * import { verticalHandler, captureHandler } from "@fiveway/core";
 *
 * const handler = verticalHandler.compose(captureHandler);
 * ```
 *
 * There are multiple ways to escape capture like explicit `focusNode()` or extending further with a custom handler.
 */
export const captureHandler: NavigationHandler = (node, action, next) => {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "core:capture" });
	}

	const id = next();
	if (id === null || !isParent(node.id, id)) {
		return null;
	}

	return id;
};

function findInitialChild(node: NavtreeNode): NodeId | null {
	const initialItem = initialHandler.query(node.tree, node.id);
	if (initialItem === null) {
		return null;
	}

	const initialId = `${node.id}/${initialItem}`;
	const child = node.children.find((c) => c.active && c.id === initialId);
	if (child == null) {
		return null;
	}

	return child.id;
}
