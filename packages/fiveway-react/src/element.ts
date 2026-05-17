import {
	type NavigationTree,
	type NavigationAction,
	type ComposedHandler,
	dispatchAction,
	composeHandlers,
	registerListener,
	spatialItemHandler,
} from "@fiveway/core";
import { defaultEventMapping, elementHandler } from "@fiveway/core/dom";
import { useRef, useMemo, useEffect } from "react";

export type ElementHandler = ComposedHandler & {
	register: (e: HTMLElement | null) => void;
};

export function useElementHandler(): ElementHandler {
	const elementRef = useRef<HTMLElement | null>(null);

	return useMemo(() => {
		const handler = composeHandlers([
			elementHandler(() => elementRef.current),
			spatialItemHandler(() => {
				return elementRef.current?.getBoundingClientRect() ?? null;
			}),
		]) as ElementHandler;

		handler.register = (element) => {
			elementRef.current = element;
		};

		return handler;
	}, []);
}

export type DispatchOnEventOptions = {
	target?: EventTarget;
	event?: string;
	eventToAction?: (e: Event) => NavigationAction | null;
};

export function useDispatchOnEvent(
	tree: NavigationTree,
	options: DispatchOnEventOptions = {},
): void {
	const target = options.target ?? window;
	const eventType = options.event ?? "keydown";
	const mapper = options.eventToAction ?? defaultEventMapping;

	const handlerRef = useRef<(e: Event) => void>(() => {});
	handlerRef.current = (e: Event) => {
		const action = mapper(e);
		if (action !== null) {
			e.preventDefault();
			dispatchAction(tree, action);
		}
	};

	useEffect(() => {
		const handler = (e: Event) => {
			handlerRef.current(e);
		};

		target.addEventListener(eventType, handler);

		return () => {
			target.removeEventListener(eventType, handler);
		};
	}, [tree, target, eventType]);
}

export function useFocusSync(tree: NavigationTree): void {
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
