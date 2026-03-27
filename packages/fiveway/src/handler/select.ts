import { describeHandler } from "../meta/introspection.ts";
import type { NodeId } from "../tree/id.ts";
import { type NavigationTree, focusNode } from "../tree/tree.ts";
import { type NavigationHandler, runHandler } from "./handler.ts";

/**
 * @category Handler
 */
function createSelectHandler(onSelect: () => void): NavigationHandler {
  const selectHandler: NavigationHandler = (_, action, next) => {
    if (import.meta.env.DEV) {
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

export function selectNode(tree: NavigationTree, nodeId: NodeId, focus: boolean = true): void {
  if (focus) {
    focusNode(tree, nodeId);
  }

  runHandler(tree, nodeId, { kind: "select" });
}

export { createSelectHandler as selectHandler };
