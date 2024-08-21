import type { NavigationDirection } from "../navigation.js";
import { type NavigationHandler } from "../handler.js";
import { isParent } from "../id.js";

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
  const focusHandler: NavigationHandler = (node, action, next) => {
    if (action.kind !== "focus") {
      return next();
    }

    if (!node.children.some((c) => c.active)) {
      if (config.skipEmpty ?? false) {
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

export const captureHandler: NavigationHandler = (node, _, next) => {
  const id = next();
  if (id === null || !isParent(node.id, id)) {
    return null;
  }

  return id;
};

function createInitialHandler(id: string) {
  const initialHandler: NavigationHandler = (node, action, next) => {
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
        return next(child.id) ?? next();
      }
    }

    return next();
  };

  return initialHandler;
}

export {
  createFocusHandler as focusHandler,
  createInitialHandler as initialHandler,
};
