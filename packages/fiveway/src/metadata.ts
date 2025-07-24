import {
  type NavigationHandler,
  type NavigationAction,
  runHandler,
} from "./navigation.js";
import type { NodeId } from "./id.js";
import { describeHandler } from "./introspection.js";
import type { NavigationTree } from "./tree.js";

export type MetaHandler<T> = {
  key: string;
  (v: T | (() => T | null) | null): NavigationHandler;
  query: (tree: NavigationTree, id: NodeId) => T | null;
};

export function metaHandler<T>(key: string): MetaHandler<T> {
  const handler = (value: unknown) => {
    const metaHandler: NavigationHandler = (_, action, next) => {
      if (import.meta.env.DEV) {
        describeHandler(action, { name: "core:metadata-provider", key });
      }

      if (action.kind === "query" && action.key === key) {
        action.value = typeof value === "function" ? value() : value;
        return null;
      }

      return next();
    };

    return metaHandler;
  };

  handler.key = key;
  handler.query = (tree: NavigationTree, id: NodeId) => {
    const query: NavigationAction = { kind: "query", key, value: null };
    runHandler(tree, id, query);
    return query.value as T | null;
  };

  return handler;
}
