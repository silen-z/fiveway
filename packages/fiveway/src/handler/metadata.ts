import { type QueryAction } from "../action.ts";
import { runHandler, type NavigationHandler } from "../handler/handler.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationTree } from "../tree/tree.ts";

/**
 * Data handler factory that given a value produces a navigation handler that responds to query actions with the given value.
 * It alsostores its key and exposes a `.query(tree, id)` method that resolves the value for given node id.
 *
 * @see {@link createDataHandler} for usage example
 */
export interface DataHandler<T> {
	/**
	 * Key associated with this data handler factory
	 */
	key: string;

	/** Data handler factory function */
	(v: T | (() => T | null) | null): NavigationHandler;

	/**
	 * Function that resolves the data value for given node id.
	 * Returns value for given node ID or null if no value is stored or node does not exist.
	 */
	query: (tree: NavigationTree, id: NodeId) => T | null;
}

/**
 * Variant of {@link DataHandler} that has a default value specified.
 *
 * @see {@link createDataHandler} for usage example
 */
export interface DataHandlerWithDefault<T> {
	key: string;
	(v?: T | (() => T | null) | null): NavigationHandler;
	query: (tree: NavigationTree, id: NodeId) => T | null;
}

/**
 * Defines a {@link DataHandler}. Data handlers are used to store metadata on nodes.
 *
 * @param key - Unique key used for querying the data
 * @param defaultValue - Default value that is used when creating defined data handler with no value
 * @return Data handler factory that given a value produces a navigation handler that responds to query actions for given key
 *
 * **Unprefixed keys (like `initial`, `element`) are reserved for `@fiveway/core`** . Third-party libraries and apps should use a
 * namespace prefix in the key (e.g. `my-library:carousel-index`) to avoid collisions.
 *
 * @example
 * ```ts
 * const carouselItemHandler = createDataHandler<{index: number}>("app:carouselItem");
 * useNavnode("item1", [carouselItemHandler({index: 1}), itemHandler]);
 *
 * carouselItemHandler.query(tree, "item1"); // {index: 1}
 * ```
 *
 * @see {@link DataHandler}
 * @see {@link DataHandlerWithDefault}
 * @see {@link QueryAction}
 */
export function createDataHandler<T>(key: string): DataHandler<T>;
export function createDataHandler<T>(key: string, defaultValue: T): DataHandlerWithDefault<T>;
export function createDataHandler<T>(key: string, defaultValue?: T) {
	const dataHandlerFactory = (value: unknown = defaultValue) => {
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

	dataHandlerFactory.key = key;
	dataHandlerFactory.query = (tree: NavigationTree, id: NodeId) => {
		const query: QueryAction = { kind: "query", key, value: null };
		runHandler(tree, id, query);
		return query.value as T | null;
	};

	return dataHandlerFactory;
}
