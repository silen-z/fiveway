import { type NavigationAction } from "../action.ts";
import type { NodeId } from "../tree/id.ts";
import { describeHandler } from "./introspection.ts";
import type { NavigationTree } from "../tree/tree.ts";
import { runHandler, type NavigationHandler } from "../handler/handler.ts";

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
