import {
	type NodeId,
	type FocusNodeOptions,
	type ActivateNodeOptions,
	activateNode,
	joinId,
	focusNode,
	isFocused,
	registerListener,
} from "@fiveway/core";
import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { useNavigationContext } from "./context.tsx";

/**
 * Solid primitive that returns the focused node ID for a given scope.
 *
 * @example
 * ```ts
 * const nav = createNavnode("container", containerHandler);
 * const focusedId = useFocusedId(nav);
 * ```
 */
export function useFocusedId(scope: NodeId): Accessor<NodeId | null> {
	const { tree, parentNode } = useNavigationContext();
	const globalId = joinId(parentNode(), scope);
	const [focusedId, setFocusedId] = createSignal(isFocused(tree, globalId) ? tree.focus : null);

	createEffect(() => {
		const cleanup = registerListener(tree, globalId, () => {
			const id = isFocused(tree, globalId) ? tree.focus : null;
			setFocusedId(id);
		});

		onCleanup(cleanup);
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

	const watchedId = createMemo(() => joinId(parentNode(), typeof id === "function" ? id() : id));

	const [isSubscribed, setSubscribed] = createSignal<boolean>(false);
	const [isNodeFocused, setFocused] = createSignal<boolean>(isFocused(tree, watchedId()));

	createEffect(() => {
		if (!isSubscribed()) {
			return;
		}

		const nodeId = watchedId();

		const cleanup = registerListener(tree, nodeId, () => {
			setFocused(isFocused(tree, nodeId));
		});

		onCleanup(cleanup);
	});

	const accessor = () => {
		setSubscribed(true);

		return isNodeFocused();
	};

	return accessor;
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

	createEffect(() => {
		const subscribedId = id();

		handler(isFocused(tree, subscribedId) ? tree.focus : null);

		const cleanup = registerListener(tree, subscribedId, () => {
			const focusedId = isFocused(tree, subscribedId) ? tree.focus : null;
			handler(focusedId);
		});

		onCleanup(cleanup);
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
