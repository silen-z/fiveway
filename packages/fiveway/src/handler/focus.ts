import { type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, isParent } from "../tree/id.ts";
import { type NavtreeNode } from "../tree/node.ts";
import { type NavigationHandler } from "./handler.ts";
import { type DataHandler, dataHandler } from "./metadata.ts";

export type FocusDirection = "front" | "back";

export type FocusHandlerOptions = {
	focusWhenEmpty?: boolean;
	direction?: (dir: NavigationDirection | "initial" | null) => FocusDirection | null;
};

export const initialHandler: DataHandler<string> = dataHandler<string>("core:initial");

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

		if (focusDirection === "back") {
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

export { createFocusHandler as focusHandler };
