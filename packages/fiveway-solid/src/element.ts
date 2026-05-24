import {
	composeHandlers,
	registerListener,
	spatialItemHandler,
	type ComposedHandler,
} from "@fiveway/core";
import { elementHandler } from "@fiveway/core/dom";
import { createEffect, createSignal, onCleanup } from "solid-js";

import { useNavigationContext } from "./context.tsx";

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
	const { tree } = useNavigationContext();

	createEffect(() => {
		const el = elementHandler.query(tree, tree.focus);
		if (el != null) {
			el.focus();
		}

		const cleanup = registerListener(tree, "#", () => {
			const el = elementHandler.query(tree, tree.focus);
			if (el !== null) {
				el.focus();
			} else if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		});

		onCleanup(cleanup);
	});
}
