import {
	type NodeId,
	type FocusNodeOptions,
	type ActivateNodeOptions,
	activateNode,
	joinId,
	focusNode,
	isFocused,
	registerFocusListener,
} from "@fiveway/core";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	onSettled,
	refresh,
} from "solid-js";

import { useNavigationContext } from "./context";

/**
 * Solid primitive that returns the focused node ID for a given scope.
 *
 * @example
 * ```ts
 * const nav = createNavnode("container", containerHandler);
 * const focusedId = useFocusedId(nav);
 * ```
 *
 * @see {@link NodeId}
 */
export function useFocusedId(scope: NodeId): Accessor<NodeId | null> {
	const { tree, parentNode } = useNavigationContext();
	scope = joinId(parentNode(), scope);

	const [focusedId, setFocusedId] = createSignal(isFocused(tree, scope) ? tree.focus : null);

	onSettled(() => {
		return registerFocusListener(tree, scope, () => {
			const id = isFocused(tree, scope) ? tree.focus : null;
			setFocusedId(id);
		});
	});

	return focusedId;
}

/**
 * Solid primitive that returns whether a given node ID is focused.
 *
 * @example
 * ```ts
 * const nav = createNavnode("layout", containerHandler);
 * const isContentFocused = useIsFocused(`${nav()}/content`);
 * ```
 */
export function useIsFocused(id: NodeId | Accessor<NodeId>): Accessor<boolean> {
	const { tree, parentNode } = useNavigationContext();

	const subscribedId = createMemo(
		() => {
			const watchedId = joinId(parentNode(), typeof id === "function" ? id() : id);

			createEffect(
				() => watchedId,
				(id) => {
					const cleanup = registerFocusListener(tree, id, () => {
						refresh(isNodeFocused);
					});

					return cleanup;
				},
			);

			return watchedId;
		},
		{ lazy: true },
	);

	const isNodeFocused = createMemo(() => isFocused(tree, subscribedId()), {
		lazy: true,
	});

	return isNodeFocused;
}

/**
 * Solid primitive that calls a function when the focus inside a given node ID changes.
 *
 * When the focus moves outside the given node ID, the function is called with `null`.
 *
 * @example
 * ```ts
 * const nav = createNavnode("layout", containerHandler);
 * useOnFocusChange(nav, (id) => {
 * 	console.log(id);
 * });
 * ```
 */
export function useOnFocusChange(
	nodeId: NodeId | Accessor<NodeId>,
	handler: (id: NodeId | null) => void,
): void {
	const { tree, parentNode } = useNavigationContext();
	const id = () => joinId(parentNode(), typeof nodeId === "function" ? nodeId() : nodeId);

	createEffect(id, (id) => {
		handler(isFocused(tree, id) ? tree.focus : null);

		if (tree.focusLock === "free") {
			handler(isFocused(tree, id) ? tree.focus : null);
		}

		return registerFocusListener(tree, id, () => {
			const focusedId = isFocused(tree, id) ? tree.focus : null;
			handler(focusedId);
		});
	});
}

/**
 * Solid primitive that calls a function when given node ID is focused.
 *
 * @example
 * ```ts
 * const nav = createNavnode("layout", containerHandler);
 * useOnFocus(nav, () => {
 * 	console.log("focus gained");
 * });
 * ```
 */
export function useOnFocus(nodeId: NodeId | Accessor<NodeId>, handler: () => void): void {
	let lastFocused = false;
	useOnFocusChange(nodeId, (id) => {
		const isFocused = id !== null;
		if (!lastFocused && isFocused) {
			handler();
		}

		lastFocused = isFocused;
	});
}

/**
 * Solid primitive that calls a function when given node ID loses focus.
 *
 * @example
 * ```ts
 * const nav = createNavnode("layout", containerHandler);
 * useOnBlur(nav, () => {
 * 	console.log("focus lost");
 * });
 * ```
 */
export function useOnBlur(nodeId: NodeId | Accessor<NodeId>, handler: () => void): void {
	let lastFocused = false;
	useOnFocusChange(nodeId, (id) => {
		const isFocused = id !== null;
		if (lastFocused && !isFocused) {
			handler();
		}

		lastFocused = isFocused;
	});
}

type FocusFn = (nodeId: NodeId, options?: FocusNodeOptions) => void;

/**
 * Solid primitive that returns a function for focusing nodes.
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
	scope ??= parentNode();

	return (nodeId: NodeId, options?: FocusNodeOptions) => {
		focusNode(tree, joinId(scope, nodeId), options);
	};
}

type ActivateFn = (nodeId: NodeId, options?: ActivateNodeOptions) => void;

/**
 * Solid primitive that returns a function for activating nodes.
 * By default the function will activate nodes relative to the current parent node.
 *
 * @example
 * ```tsx
 * const activate = useActivate();
 *
 * <button onClick={() => activate("content")}>Activate content</button>
 * ```
 */
export function useActivate(scope?: NodeId): ActivateFn {
	const { tree, parentNode } = useNavigationContext();
	scope ??= parentNode();

	return (nodeId: NodeId, options?: ActivateNodeOptions) => {
		activateNode(tree, joinId(scope, nodeId), options);
	};
}
