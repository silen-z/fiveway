import {
  type NodeId,
  type FocusOptions,
  selectNode,
  isFocused,
  registerListener,
  focusNode,
  joinId,
} from "@fiveway/core";
import { useCallback, useEffect, useSyncExternalStore, useRef } from "react";

import { useNavigationContext } from "./context.tsx";

export function useIsFocused(nodeId: NodeId): boolean {
  const { tree, parentNode } = useNavigationContext();
  const globalId = joinId(parentNode, nodeId);

  const subscribe = useCallback(
    (cb: () => void) => registerListener(tree, globalId, "focuschange", cb),
    [tree, globalId],
  );

  return useSyncExternalStore(subscribe, () => isFocused(tree, globalId));
}

export function useOnFocus(nodeId: NodeId, handler: (id: NodeId | null) => void): void {
  const { tree, parentNode } = useNavigationContext();
  const globalId = joinId(parentNode, nodeId);

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return registerListener(tree, globalId, "focuschange", (e) => {
      const id = isFocused(tree, globalId) ? e.focused : null;
      handlerRef.current(id);
    });
  }, [globalId, tree]);
}

export function useFocusedId(scope: NodeId): NodeId | null {
  const { tree, parentNode } = useNavigationContext();
  const globalId = joinId(parentNode, scope);

  const subscribe = useCallback(
    (cb: () => void) => registerListener(tree, globalId, "focuschange", cb),
    [tree, globalId],
  );

  return useSyncExternalStore(subscribe, () => (isFocused(tree, globalId) ? tree.focus : null));
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

type SelectFn = (nodeId: NodeId, focus?: boolean) => void;

export function useSelect(scope?: NodeId): SelectFn {
  const { tree, parentNode } = useNavigationContext();
  scope ??= parentNode;

  return useCallback(
    (nodeId: NodeId, focus?: boolean) => {
      selectNode(tree, joinId(scope, nodeId), focus);
    },
    [tree, scope],
  );
}
