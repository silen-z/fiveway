import {
	type NodeId,
	type FocusOptions,
	type SelectOptions,
	selectNode,
	isFocused,
	registerListener,
	focusNode,
	joinId,
} from "@fiveway/core";
import { useCallback, useEffect, useSyncExternalStore, useRef } from "react";

import { useNavigationContext } from "./context.tsx";

export function useFocusedId(scope: NodeId): NodeId | null {
	const { tree, parentNode } = useNavigationContext();
	const globalId = joinId(parentNode, scope);

	const subscribe = useCallback(
		(handler: () => void) => registerListener(tree, globalId, handler),
		[tree, globalId],
	);

	return useSyncExternalStore(subscribe, () => (isFocused(tree, globalId) ? tree.focus : null));
}

export function useIsFocused(nodeId: NodeId): boolean {
	return useFocusedId(nodeId) !== null;
}

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

export function useOnFocus(nodeId: NodeId, handler: () => void): void {
	let lastFocused = false;
	useOnFocusChange(nodeId, (id) => {
		const isFocused = id !== null;
		if (!lastFocused && isFocused) {
			handler();
		}

		lastFocused = isFocused;
	});
}

export function useOnBlur(nodeId: NodeId, handler: () => void): void {
	let lastFocused = false;
	useOnFocusChange(nodeId, (id) => {
		const isFocused = id !== null;
		if (lastFocused && !isFocused) {
			handler();
		}

		lastFocused = isFocused;
	});
}

type FocusFn = (nodeId: NodeId, options?: FocusOptions) => boolean;

export function useFocus(scope?: NodeId): FocusFn {
	const { tree, parentNode } = useNavigationContext();
	scope ??= parentNode;

	return useCallback(
		(nodeId: NodeId, options?: FocusOptions) => {
			return focusNode(tree, joinId(scope, nodeId), options);
		},
		[tree, scope],
	);
}

type SelectFn = (nodeId: NodeId, options?: SelectOptions) => void;

export function useSelect(scope?: NodeId): SelectFn {
	const { tree, parentNode } = useNavigationContext();
	scope ??= parentNode;

	return useCallback(
		(nodeId: NodeId, options?: SelectOptions) => {
			selectNode(tree, joinId(scope, nodeId), options);
		},
		[tree, scope],
	);
}
