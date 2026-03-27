import type { NavigationAction } from "../action.ts";
import { describeHandler } from "../meta/introspection.ts";
import type { NodeId } from "../tree/id.ts";
import type { NavtreeNode } from "../tree/node.ts";
import type { NavigationTree } from "../tree/tree.ts";
import { chainedHandler, type ChainedHandler } from "./chained.ts";
import { focusHandler } from "./focus.ts";
import { selectHandler } from "./select.ts";

export type HandlerNext = (id?: NodeId, action?: NavigationAction) => NodeId | null;

export type NavigationHandler = (
  node: NavtreeNode,
  action: NavigationAction,
  next: HandlerNext,
) => NodeId | null;

export function runHandler(
  tree: NavigationTree,
  nodeId: NodeId,
  action: NavigationAction,
): NodeId | null {
  const node = tree.nodes.get(nodeId);
  if (node == null || !node.connected) {
    return null;
  }

  const next: HandlerNext = (id, newAction) => {
    if (id == null) {
      return null;
    }

    return runHandler(tree, id, newAction ?? action);
  };

  return node.handler(node, action, next);
}

/**
 * @category Handler
 */
export const parentHandler: NavigationHandler = (node, action, next) => {
  if (import.meta.env.DEV) {
    describeHandler(action, { name: "core:parent" });
  }

  if (action.kind === "query") {
    return null;
  }

  if (node.parent !== null) {
    return next(node.parent);
  }

  return next();
};

export const defaultHandler: ChainedHandler = chainedHandler([focusHandler(), parentHandler]);

export const containerHandler: ChainedHandler = chainedHandler([
  focusHandler({ skipEmpty: true }),
  parentHandler,
]);

export const itemHandler = (onSelect?: () => void): ChainedHandler => {
  if (onSelect == null) {
    return defaultHandler;
  }

  return defaultHandler.prepend(selectHandler(onSelect));
};
