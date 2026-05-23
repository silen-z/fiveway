import {
	type NodeId,
	type FocusNodeOptions,
	type SelectNodeOptions,
	selectNode,
	isFocused,
	registerListener,
	focusNode,
	joinId,
} from "@fiveway/core";
import { useCallback, useEffect, useSyncExternalStore, useRef } from "react";

import { useNavigationContext } from "./context.tsx";

/**
 * React hook that returns the focused node ID for a given scope.
 *
 * @example
 *
 * ```ts
 * const nav = useNavnode("container", containerHandler);
 * const focusedId = useFocusedId(nav.id);
 * ```
 */
export function useFocusedId(scope: NodeId): NodeId | null {
	const { tree, parentNode } = useNavigationContext();
	const globalId = joinId(parentNode, scope);

	const subscribe = useCallback(
		(handler: () => void) => registerListener(tree, globalId, handler),
		[tree, globalId],
	);

	return useSyncExternalStore(subscribe, () => (isFocused(tree, globalId) ? tree.focus : null));
}

/**
 * React hook that returns whether a given node ID is focused.
 *
 * @example
 * ```ts
 * const nav = useNavnode("layout", containerHandler);
 * const isContentFocused = useIsFocused(`${nav.id}/content`);
 * ```
 */

export function useIsFocused(nodeId: NodeId): boolean {
	return useFocusedId(nodeId) !== null;
}

/**
 * React hook that calls a function when the focus inside a given node ID changes.
 *
 * When the focus moves outside the given node ID, the function is called with `null`.
 *
 * @example
 * ```ts
 * const nav = useNavnode("layout", containerHandler);
 * useOnFocusChange(nav.id, (id) => {
 * 	console.log(id);
 * });
 * ```
 */
export function useOnFocusChange(nodeId: NodeId, handler: (id: NodeId | null) => void): void {
	const { tree, parentNode } = useNavigationContext();
	const globalId = joinId(parentNode, nodeId);

	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		handlerRef.current(isFocused(tree, globalId) ? tree.focus : null);

		return registerListener(tree, globalId, () => {
			const id = isFocused(tree, globalId) ? tree.focus : null;
			handlerRef.current(id);
		});
	}, [globalId, tree]);
}

/**
 * React hook that calls a function when given node ID is focused.
 *
 * @example
 * ```ts
 * const nav = useNavnode("layout", containerHandler);
 * useOnFocus(nav.id, () => {
 * 	console.log("focus gained");
 * });
 * ```
 */
export function useOnFocus(nodeId: NodeId, handler: () => void): void {
	const lastFocused = useRef(false);

	useOnFocusChange(nodeId, (id) => {
		const isFocused = id !== null;
		if (!lastFocused.current && isFocused) {
			handler();
		}

		lastFocused.current = isFocused;
	});
}

/**
 * React hook that calls a function when given node ID loses focus.
 *
 * @example
 * ```ts
 * const nav = useNavnode("layout", containerHandler);
 * useOnBlur(nav.id, () => {
 * 	console.log("focus lost");
 * });
 * ```
 */
export function useOnBlur(nodeId: NodeId, handler: () => void): void {
	const lastFocused = useRef(false);

	useOnFocusChange(nodeId, (id) => {
		const isFocused = id !== null;
		if (lastFocused.current && !isFocused) {
			handler();
		}

		lastFocused.current = isFocused;
	});
}

type FocusFn = (nodeId: NodeId, options?: FocusNodeOptions) => void;

/**
 * React hook that returns a function for focusing nodes.
 * By default the function will focus nodes relative to the current parent node.
 *
 * @example
 * ```tsx
 * const focus = useFocus();
 *
 * <button onClick={() => focus("content")}>Focus content</button>
 * ```
 */
export function useFocus(scope?: NodeId): FocusFn {
	const { tree, parentNode } = useNavigationContext();
	scope ??= parentNode;

	return useCallback(
		(nodeId: NodeId, options?: FocusNodeOptions) => {
			focusNode(tree, joinId(scope, nodeId), options);
		},
		[tree, scope],
	);
}

type SelectFn = (nodeId: NodeId, options?: SelectNodeOptions) => void;

/**
 * React hook that returns a function for selecting nodes.
 * By default the function will select nodes relative to the current parent node.
 *
 * @example
 * ```tsx
 * const select = useSelect();
 *
 * <button onClick={() => select("content")}>Select content</button>
 * ```
 */
export function useSelect(scope?: NodeId): SelectFn {
	const { tree, parentNode } = useNavigationContext();
	scope ??= parentNode;

	return useCallback(
		(nodeId: NodeId, options?: SelectNodeOptions) => {
			selectNode(tree, joinId(scope, nodeId), options);
		},
		[tree, scope],
	);
}
