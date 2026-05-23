import {
	type ComposedHandler,
	composeHandlers,
	registerListener,
	spatialItemHandler,
} from "@fiveway/core";
import { elementHandler } from "@fiveway/core/dom";
import { useRef, useMemo, useEffect } from "react";

import { useNavigationContext } from "./context.tsx";

export interface ElementHandler extends ComposedHandler {
	register: (e: HTMLElement | null) => void;
}

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

export function useFocusSync(): void {
	const { tree } = useNavigationContext();

	useEffect(() => {
		const handler = () => {
			const el = elementHandler.query(tree, tree.focus);
			if (el != null) {
				el.focus();
			} else if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		};

		return registerListener(tree, "#", handler);
	}, [tree]);
}
