import { type NavigationTree, type NodeId, registerListener, isFocused } from "@fiveway/core";
import { useState, useCallback, useSyncExternalStore } from "react";

function noopSubscribe() {
  return () => {};
}

export function useLazyIsFocused(tree: NavigationTree, nodeId: NodeId): () => boolean {
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = useCallback(
    (cb: () => void) => registerListener(tree, nodeId, "focuschange", cb),
    [tree, nodeId],
  );

  const subscribedValue = useSyncExternalStore(subscribed ? subscribe : noopSubscribe, () =>
    isFocused(tree, nodeId),
  );

  return () => {
    if (!subscribed) {
      setSubscribed(true);
    }

    return subscribedValue;
  };
}
