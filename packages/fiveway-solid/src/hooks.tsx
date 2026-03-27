import {
  type NodeId,
  type FocusOptions,
  selectNode,
  scopedId,
  focusNode,
  isFocused,
  registerListener,
} from "@fiveway/core";
import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { useNavigationContext } from "./context.jsx";

export function useIsFocused(id: NodeId | Accessor<NodeId>): Accessor<boolean> {
  const { tree, parentNode } = useNavigationContext();

  const watchedId = createMemo(() => scopedId(parentNode(), typeof id === "function" ? id() : id));

  const [isNodeFocused, setFocused] = createSignal<boolean>(false);

  let subscription: (() => void) | null = null;
  const subscribe = (id: NodeId) => {
    if (subscription !== null) {
      subscription();
    }

    setFocused(isFocused(tree, id));
    subscription = registerListener(tree, id, "focuschange", () => {
      setFocused(isFocused(tree, id));
    });
  };

  createEffect(() => {
    const id = watchedId();
    if (subscription !== null) {
      subscribe(id);
    }
  });

  onCleanup(() => {
    subscription?.();
  });

  const getter = () => {
    if (subscription === null) {
      subscribe(watchedId());
    }
    return isNodeFocused();
  };

  return getter;
}

export function useOnFocus(nodeId: NodeId | Accessor<NodeId>, handler: () => void) {
  const { tree, parentNode } = useNavigationContext();
  const id = () => scopedId(parentNode(), typeof nodeId === "function" ? nodeId() : nodeId);

  createEffect(() => {
    const subscribedId = id();
    let focused = isFocused(tree, subscribedId);
    const cleanup = registerListener(tree, subscribedId, "focuschange", () => {
      const lastFocused = focused;
      focused = isFocused(tree, subscribedId);
      if (!lastFocused && focused) {
        handler();
      }
    });

    onCleanup(cleanup);
  });
}

export function useOnFocusChange(
  nodeId: NodeId | Accessor<NodeId>,
  handler: (id: NodeId | null) => void,
) {
  const { tree, parentNode } = useNavigationContext();
  const id = () => scopedId(parentNode(), typeof nodeId === "function" ? nodeId() : nodeId);

  createEffect(() => {
    const subscribedId = id();
    const cleanup = registerListener(tree, subscribedId, "focuschange", () => {
      const focusedId = isFocused(tree, subscribedId) ? tree.focusedId : null;
      handler(focusedId);
    });

    onCleanup(cleanup);
  });
}

export function useFocusedId(scope: NodeId) {
  const { tree, parentNode } = useNavigationContext();
  const globalId = scopedId(parentNode(), scope);
  const [focusedId, setFocusedId] = createSignal(isFocused(tree, globalId) ? tree.focusedId : null);

  createEffect(() => {
    const cleanup = registerListener(tree, globalId, "focuschange", () => {
      const id = isFocused(tree, globalId) ? tree.focusedId : null;
      setFocusedId(id);
    });

    onCleanup(cleanup);
  });

  return focusedId;
}

export function useFocus(scope?: NodeId) {
  const { tree, parentNode } = useNavigationContext();
  scope ??= parentNode();

  return (nodeId: NodeId, options?: FocusOptions) => {
    return focusNode(tree, scopedId(scope, nodeId), options);
  };
}

export function useSelect(scope?: NodeId) {
  const { tree, parentNode } = useNavigationContext();
  scope ??= parentNode();

  return (nodeId: NodeId, focus?: boolean) => {
    selectNode(tree, scopedId(scope, nodeId), focus);
  };
}
