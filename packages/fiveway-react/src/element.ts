import {
	type ComposedHandler,
	composeHandlers,
	registerFocusListener,
	spatialItemHandler,
} from "@fiveway/core";
import { elementHandler } from "@fiveway/core/dom";
import { useRef, useMemo, useEffect } from "react";

import { useNavigationContext } from "./context.tsx";

/**
 * Data handler used for associating navigation nodes with DOM elements.
 * It does not handle focus or movement actions and is meant to be composed with other handlers.
 *
 * @example
 * ```ts
 * const elementHandler = useElementHandler();
 * const nav = useNavnode("my-node", [elementHandler, itemHandler()]);
 * ```
 *
 * @see {@link useElementHandler}
 */
export interface ElementHandler extends ComposedHandler {
	register: (e: HTMLElement | null) => void;
}

/**
 * Factory for creating {@link ElementHandler}.
 */
export function useElementHandler(): ElementHandler {
	const elementRef = useRef<HTMLElement | null>(null);

	return useMemo(() => {
		const handler = composeHandlers([
			elementHandler(() => elementRef.current),
			spatialItemHandler(() => {
				const rect = elementRef.current?.getBoundingClientRect();
				if (rect == null) {
					return null;
				}
				return {
					x: rect.left + rect.width * 0.5,
					y: rect.top + rect.height * 0.5,
				};
			}),
		]) as ElementHandler;

		handler.register = (element) => {
			elementRef.current = element;
		};

		return handler;
	}, []);
}

/**
 * Hook that synchronizes native browser focus with focused node based on {@link elementHandler}.
 */
export function useFocusSync(): void {
	const { tree } = useNavigationContext();

	useEffect(() => {
		const el = elementHandler.query(tree, tree.focus);
		if (el != null) {
			el.focus();
		}

		const handler = () => {
			const el = elementHandler.query(tree, tree.focus);
			if (el != null) {
				el.focus();
			} else if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		};

		return registerFocusListener(tree, "#", handler);
	}, [tree]);
}
