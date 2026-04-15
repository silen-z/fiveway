import type { InspectorMessage, InspectorCommand, InspectorNode } from "@fiveway/core";
import { createEffect, onCleanup } from "solid-js";
import { createStore, produce } from "solid-js/store";

export type InspetorInit = {
  subscribe(callback: (update: InspectorMessage) => void): () => void;
  sendCommand: (command: InspectorCommand) => void;
};

export type InspectedTree = {
  label: string;
  focus: string | null;
  nodes: Record<string, InspectorNode>;
};

export type InspectorState = {
  trees: Record<string, InspectedTree>;
};

export function createDevtoolsState(handle: InspetorInit) {
  const [state, setState] = createStore<InspectorState>({
    trees: {},
  });

  createEffect(() => {
    handle.sendCommand({ kind: "requestCompleteSnapshot", tree: "*" });

    const unsubscribe = handle.subscribe((message) => {
      if (!(message.tree in state.trees)) {
        setState("trees", message.tree, { label: message.tree, focus: null, nodes: {} });
        handle.sendCommand({ kind: "requestCompleteSnapshot", tree: message.tree });
      }

      setState(
        "trees",
        message.tree,
        produce((tree) => {
          if (message.focus != null) {
            tree.focus = message.focus;
          }

          if (message.nodes != null) {
            for (const node of message.nodes) {
              tree.nodes[node.id] = node;
            }
          }

          if (message.removedNodes != null) {
            for (const node of message.removedNodes) {
              delete tree.nodes[node];
            }
          }
        }),
      );
    });

    onCleanup(unsubscribe);
  });

  return state;
}
