import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree, focusNode } from "../tree/tree.ts";
import { type NavigationHandler, runHandler } from "./handler.ts";

function createSelectHandler(onSelect: () => void): NavigationHandler {
  const selectHandler: NavigationHandler = (_, action, next) => {
    if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
      describeHandler(action, { name: "core:select" });
    }

    if (action.kind === "select") {
      onSelect();
      return null;
    }

    return next();
  };

  return selectHandler;
}

export type SelectOptions = {
  focus?: boolean;
};

export function selectNode(tree: NavigationTree, nodeId: NodeId, options?: SelectOptions): void {
  if (options?.focus ?? true) {
    focusNode(tree, nodeId);
  }

  runHandler(tree, nodeId, { kind: "select" });
}

export { createSelectHandler as selectHandler };
