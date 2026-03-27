import type { NavigationDirection } from "../action.ts";
import { describeHandler } from "../meta/introspection.ts";
import { type MetaHandler, metaHandler } from "../meta/metadata.ts";
import { type NodeId, isParent } from "../tree/id.ts";
import type { NavtreeNode } from "../tree/node.ts";
import type { NavigationHandler } from "./handler.ts";

export type FocusDirection = "front" | "back";

export type FocusHandlerConfig = {
  skipEmpty?: boolean;
  direction?: (dir: NavigationDirection | "initial" | null) => FocusDirection | null;
};

export const initialHandler: MetaHandler<string> = metaHandler<string>("core:initial");

function createFocusHandler(config: FocusHandlerConfig = {}): NavigationHandler {
  const skipEmpty = config.skipEmpty ?? false;

  const focusHandler: NavigationHandler = (node, action, next) => {
    if (import.meta.env.DEV) {
      describeHandler(action, {
        name: "core:focus",
        skipEmpty,
        direction: config.direction != null ? "custom" : "default",
      });
    }

    if (action.kind !== "focus") {
      return next();
    }

    if (!node.children.some((c) => c.active)) {
      if (skipEmpty) {
        return null;
      }

      return node.id;
    }

    const focusDirection = config.direction?.(action.direction) ?? null;
    if (focusDirection === null) {
      const initialChild = findInitialChild(node);
      if (initialChild !== null) {
        const childId = next(initialChild);
        if (childId !== null) {
          return childId;
        }
      }
    }

    if (focusDirection === "back") {
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i]!;
        if (!child.active) {
          continue;
        }

        const nextId = next(child.id);
        if (nextId !== null) {
          return nextId;
        }
      }

      return null;
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]!;
      if (!child.active) {
        continue;
      }

      const nextId = next(child.id);
      if (nextId !== null) {
        return nextId;
      }
    }

    return null;
  };

  return focusHandler;
}

function findInitialChild(node: NavtreeNode): NodeId | null {
  const initialItem = initialHandler.query(node.tree, node.id);
  if (initialItem === null) {
    return null;
  }

  const initialId = `${node.id}/${initialItem}`;
  const child = node.children.find((c) => c.active && c.id === initialId);
  if (child == null) {
    return null;
  }

  return child.id;
}

export const captureHandler: NavigationHandler = (node, action, next) => {
  if (import.meta.env.DEV) {
    describeHandler(action, { name: "core:capture" });
  }

  const id = next();
  if (id === null || !isParent(node.id, id)) {
    return null;
  }

  return id;
};

export { createFocusHandler as focusHandler };
