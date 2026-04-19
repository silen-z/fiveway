import {
  type NodeId,
  type FocusOptions,
  type SelectOptions,
  selectNode,
  joinId,
  focusNode,
  isFocused,
  registerListener,
} from "@fiveway/core";
import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { useNavigationContext } from "./context.tsx";

export function useFocusedId(scope: NodeId): Accessor<NodeId | null> {
  const { tree, parentNode } = useNavigationContext();
  const globalId = joinId(parentNode(), scope);
  const [focusedId, setFocusedId] = createSignal(isFocused(tree, globalId) ? tree.focus : null);

  createEffect(() => {
    const cleanup = registerListener(tree, globalId, "focuschange", () => {
      const id = isFocused(tree, globalId) ? tree.focus : null;
      setFocusedId(id);
    });

    onCleanup(cleanup);
  });

  return focusedId;
}

export function useIsFocused(id: NodeId | Accessor<NodeId>): Accessor<boolean> {
  const { tree, parentNode } = useNavigationContext();

  const watchedId = createMemo(() => joinId(parentNode(), typeof id === "function" ? id() : id));

  const [isSubscribed, setSubscribed] = createSignal<boolean>(false);
  const [isNodeFocused, setFocused] = createSignal<boolean>(isFocused(tree, watchedId()));

  createEffect(() => {
    if (!isSubscribed()) {
      return;
    }

    const id = watchedId();

    const cleanup = registerListener(tree, id, "focuschange", () => {
      setFocused(isFocused(tree, id));
    });

    onCleanup(cleanup);
  });

  const accessor = () => {
    setSubscribed(true);

    return isNodeFocused();
  };

  return accessor;
}

export function useOnFocusChange(
  nodeId: NodeId | Accessor<NodeId>,
  handler: (id: NodeId | null) => void,
): void {
  const { tree, parentNode } = useNavigationContext();
  const id = () => joinId(parentNode(), typeof nodeId === "function" ? nodeId() : nodeId);

  createEffect(() => {
    const subscribedId = id();

    handler(isFocused(tree, subscribedId) ? tree.focus : null);

    const cleanup = registerListener(tree, subscribedId, "focuschange", () => {
      const focusedId = isFocused(tree, subscribedId) ? tree.focus : null;
      handler(focusedId);
    });

    onCleanup(cleanup);
  });
}

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

type FocusFn = (nodeId: NodeId, options?: FocusOptions) => boolean;

export function useFocus(scope?: NodeId): FocusFn {
  const { tree, parentNode } = useNavigationContext();
  scope ??= parentNode();

  return (nodeId: NodeId, options?: FocusOptions) => {
    return focusNode(tree, joinId(scope, nodeId), options);
  };
}

type SelectFn = (nodeId: NodeId, options?: SelectOptions) => void;

export function useSelect(scope?: NodeId): SelectFn {
  const { tree, parentNode } = useNavigationContext();
  scope ??= parentNode();

  return (nodeId: NodeId, options?: SelectOptions) => {
    selectNode(tree, joinId(scope, nodeId), options);
  };
}
