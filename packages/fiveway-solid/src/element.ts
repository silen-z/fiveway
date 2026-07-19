import {
	type NodeId,
	composeHandlers,
	registerFocusListener,
	spatialItemHandler,
	type ComposedHandler,
} from "@fiveway/core";
import { elementHandler } from "@fiveway/core/dom";
import { createSignal, onSettled, useContext } from "solid-js";

import { NavigationContext } from "./context.tsx";

/**
 * Data handler used for associating navigation nodes with DOM elements.
 * It does not handle focus or movement actions and is meant to be composed with other handlers.
 *
 * @example
 * ```ts
 * const elementHandler = createElementHandler();
 * const nav = createNavnode("my-node", [elementHandler, itemHandler()]);
 * ```
 *
 * @see {@link createElementHandler}
 */
export interface ElementHandler extends ComposedHandler {
	register: (e: HTMLElement | null) => void;
}

/**
 * Factory for creating {@link ElementHandler}.
 */
export function createElementHandler(): ElementHandler {
	const [element, setElement] = createSignal<HTMLElement | null>(null);
	const position = () => {
		const rect = element()?.getBoundingClientRect();
		if (rect == null) {
			return null;
		}
		return {
			x: rect.left + rect.width * 0.5,
			y: rect.top + rect.height * 0.5,
		};
	};

	// handlers don't need to be reactive
	const handler = composeHandlers([
		// eslint-disable-next-line solid/reactivity
		elementHandler(element),
		// eslint-disable-next-line solid/reactivity
		spatialItemHandler(position),
	]) as ElementHandler;

	handler.register = setElement;

	return handler;
}

/**
 * Primitive that synchronizes native browser focus with focused node based on {@link elementHandler}.
 */
export function useFocusSync(): void {
	const { tree } = useContext(NavigationContext);

	onSettled(() => {
		let lastFocus: NodeId | null = null;

		const el = elementHandler.query(tree, tree.focus);
		if (el != null) {
			lastFocus = tree.focus;
			el.focus();
		}

		const cleanup = registerFocusListener(tree, "#", () => {
			const el = elementHandler.query(tree, tree.focus);
			if (el != null) {
				lastFocus = tree.focus;
				el.focus();
				return;
			}

			if (lastFocus === null || !(document.activeElement instanceof HTMLElement)) {
				return;
			}

			const lastEl = elementHandler.query(tree, lastFocus);
			if (lastEl !== null && lastEl === document.activeElement) {
				document.activeElement.blur();
				lastFocus = null;
			}
		});

		return cleanup;
	});
}
