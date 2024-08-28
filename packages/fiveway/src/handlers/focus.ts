import type {
  NavigationAction,
  NavigationDirection,
  NavigationHandler,
} from "../navigation.js";
import { isParent } from "../id.js";
import { describeHandler } from "../introspection.js";

export type FocusDirection = "front" | "back";

export type FocusHandlerConfig = {
  skipEmpty?: boolean;
  direction?: (
    d: NavigationDirection | "initial" | null
  ) => FocusDirection | undefined;
};

/**
 * @category Handler
 * @param config
 * @returns
 */
function createFocusHandler(config: FocusHandlerConfig = {}) {
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

    if (
      action.direction === "initial" &&
      node.parent !== null &&
      isParent(node.parent, node.tree.focusedId)
    ) {
      return null;
    }

    if (!node.children.some((c) => c.active)) {
      if (skipEmpty) {
        return null;
      }

      return node.id;
    }

    const direction = config.direction?.(action.direction) ?? "front";

    if (direction === "back") {
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

const regularFocus: NavigationAction = { kind: "focus", direction: null };

function createInitialHandler(id: string) {
  const initialHandler: NavigationHandler = (node, action, next) => {
    if (import.meta.env.DEV) {
      describeHandler(action, { name: "core:initial", initial: id });
    }

    if (action.kind !== "focus") {
      return next();
    }

    if (action.direction === "initial" || action.direction === null) {
      if (!node.children.some((c) => c.active)) {
        return next();
      }

      const initialId = `${node.id}/${id}`;
      const child = node.children.find((c) => c.active && c.id === initialId);
      if (child != null) {
        const childId = next(child.id, regularFocus);
        if (childId !== null) {
          return childId;
        }
      }

      return next(node.id, regularFocus);
    }

    return next();
  };

  return initialHandler;
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

export {
  createFocusHandler as focusHandler,
  createInitialHandler as initialHandler,
};
