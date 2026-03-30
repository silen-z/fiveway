import type { NavigationAction, NavigationDirection } from "../action.ts";
import { describeHandler } from "../meta/introspection.ts";
import { type NodeId, childLocalId } from "../tree/id.ts";
import type { NavtreeNode } from "../tree/node.ts";
import { type ChainedHandler, chainedHandler } from "./chained.ts";
import { focusHandler } from "./focus.ts";
import { type HandlerNext, parentHandler } from "./handler.ts";

/**
 * @category Handler
 */
export function verticalMovementHandler(
  node: NavtreeNode,
  action: NavigationAction,
  next: HandlerNext,
): NodeId | null {
  if (import.meta.env.DEV) {
    describeHandler(action, { name: "core:vertical-movement" });
  }

  if (action.kind !== "move") {
    return next();
  }

  if (action.direction === "up") {
    const previousId = findPreviousChild(node, (id) =>
      next(id, { kind: "focus", direction: "up" }),
    );

    return previousId ?? next();
  }

  if (action.direction === "down") {
    const nextId = findNextChild(node, (id) => next(id, { kind: "focus", direction: "down" }));

    return nextId ?? next();
  }

  return next();
}

function verticalFocusDirection(dir: NavigationDirection | "initial" | null) {
  switch (dir) {
    case "up":
      return "back";
    case "down":
      return "front";
    default:
      return null;
  }
}

/**
 * @category Handler
 */
export const verticalHandler: ChainedHandler = chainedHandler([
  focusHandler({ skipEmpty: true, direction: verticalFocusDirection }),
  verticalMovementHandler,
  parentHandler,
]);

/**
 * @category Handler
 */
export function horizontalMovementHandler(
  node: NavtreeNode,
  action: NavigationAction,
  next: HandlerNext,
): NodeId | null {
  if (import.meta.env.DEV) {
    describeHandler(action, { name: "core:horizontal-movement" });
  }

  if (action.kind !== "move") {
    return next();
  }

  if (action.direction === "left") {
    const previousId = findPreviousChild(node, (id) =>
      next(id, { kind: "focus", direction: "left" }),
    );

    return previousId ?? next();
  }

  if (action.direction === "right") {
    const nextId = findNextChild(node, (id) => next(id, { kind: "focus", direction: "right" }));

    return nextId ?? next();
  }

  return next();
}

function horizontalFocusDirection(dir: NavigationDirection | "initial" | null) {
  switch (dir) {
    case "left":
      return "back";
    case "right":
      return "front";
    default:
      return null;
  }
}

/**
 * @category Handler
 */
export const horizontalHandler: ChainedHandler = chainedHandler([
  focusHandler({ skipEmpty: true, direction: horizontalFocusDirection }),
  horizontalMovementHandler,
  parentHandler,
]);

function findNextChild(node: NavtreeNode, check: (id: NodeId) => NodeId | null) {
  const currentChildId = childLocalId(node.id, node.tree.focus);
  if (currentChildId === null) {
    return null;
  }

  const currentIndex = node.children.findIndex((c) => c.id === currentChildId);

  for (let i = currentIndex + 1; i < node.children.length; i++) {
    const child = node.children[i]!;
    if (!child.active) {
      continue;
    }

    const nextId = check(child.id);
    if (nextId !== null) {
      return nextId;
    }
  }

  return null;
}

function findPreviousChild(node: NavtreeNode, check: (id: NodeId) => NodeId | null) {
  const currentChildId = childLocalId(node.id, node.tree.focus);
  if (currentChildId === null) {
    return null;
  }

  const currentIndex = node.children.findIndex((c) => c.id === currentChildId);

  for (let i = currentIndex - 1; i >= 0; i--) {
    const child = node.children[i]!;
    if (!child.active) {
      continue;
    }

    const nextId = check(child.id);
    if (nextId !== null) {
      return nextId;
    }
  }

  return null;
}
