import {
	composeHandlers,
	registerListener,
	spatialItemHandler,
	type ComposedHandler,
	type NavigationTree,
} from "@fiveway/core";
import { elementHandler } from "@fiveway/core/dom";
import { createEffect, createSignal, onCleanup } from "solid-js";

export type ElementHandler = ComposedHandler & {
	register: (e: HTMLElement | null) => void;
};

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

	// handlers doen't need to be reactive
	const handler = composeHandlers([
		// eslint-disable-next-line solid/reactivity
		elementHandler(element),
		// eslint-disable-next-line solid/reactivity
		spatialItemHandler(position),
	]) as ElementHandler;

	handler.register = setElement;

	return handler;
}

export function useFocusSync(tree: NavigationTree): void {
	createEffect(() => {
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
