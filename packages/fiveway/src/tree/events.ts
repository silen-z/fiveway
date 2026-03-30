import { swapRemove } from "../lib/array.ts";
import type { NodeId } from "./id.ts";
import type { NavigationTree } from "./tree.ts";

interface EventMap {
  focuschange: FocusChangeEvent;
  structurechange: StructureChangeEvent;
}

export type FocusChangeEvent = {
  type: "focuschange";
  focused: NodeId;
  previous: NodeId;
};
export type StructureChangeEvent = {
  type: "structurechange";
  operation: "insert" | "removal";
  id: NodeId;
};

export type NavtreeEvent = StructureChangeEvent | FocusChangeEvent;

export type NavtreeListener = {
  type: NavtreeEvent["type"];
  fn: (event: NavtreeEvent) => void;
};

export function registerListener<T extends keyof EventMap>(
  tree: NavigationTree,
  id: NodeId,
  type: T,
  fn: <E extends EventMap[T]>(event: E) => void,
): () => void {
  const listener = { type, fn } as NavtreeListener;

  if (!tree.listeners.has(id)) {
    tree.listeners.set(id, []);
  }

  const listeners = tree.listeners.get(id)!;
  listeners.push(listener);

  return () => {
    const listeners = tree.listeners.get(id);
    if (listeners == null) {
      return;
    }

    const index = listeners.findIndex((l) => l === listener);
    if (index === -1) {
      return;
    }

    if (listeners.length === 1) {
      tree.listeners.delete(id);
    } else {
      swapRemove(listeners, index);
    }
  };
}

export function callListeners(tree: NavigationTree, nodeId: NodeId, event: NavtreeEvent): void {
  const listeners = tree.listeners.get(nodeId);
  if (listeners == null) {
    return;
  }

  for (const listener of listeners) {
    if (listener.type === event.type) {
      listener.fn(event);
    }
  }
}
