import { type NavigationAction } from "../action.ts";
import { runHandler, type NavigationHandler } from "../handler/handler.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree } from "../tree/tree.ts";

export type DataHandler<T> = {
	key: string;
	(v: T | (() => T | null) | null): NavigationHandler;
	query: (tree: NavigationTree, id: NodeId) => T | null;
};

/**
 * Factory for data handlers.
 *
 * Calling `createDataHandler(key)` returns a factory: given a value (or a function that returns a value),
 * it produces a handler that answers `query` actions for that key. The `.query(tree, id)` helper runs
 * the query and returns the stored value.
 *
 * **Unprefixed keys are reserved for `@fiveway/core`** (`element`, `initial`, `position`,
 * `grid`, and others added by the library). Third-party libraries and apps should use a
 * namespace prefix in the key (e.g. `my-library:carousel-index`) to avoid collisions.
 */
export function createDataHandler<T>(key: string): DataHandler<T> {
	const handler = (value: unknown) => {
		const dataHandler: NavigationHandler = (_, action, next) => {
			if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
				describeHandler(action, { name: "data", key });
			}

			if (action.kind === "query" && action.key === key) {
				action.value = typeof value === "function" ? value() : value;
				return null;
			}

			return next();
		};

		return dataHandler;
	};

	handler.key = key;
	handler.query = (tree: NavigationTree, id: NodeId) => {
		const query: NavigationAction = { kind: "query", key, value: null };
		runHandler(tree, id, query);
		return query.value as T | null;
	};

	return handler;
}
