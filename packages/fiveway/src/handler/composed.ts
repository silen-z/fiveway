import { type NavigationAction } from "../action.ts";
import { describeHandler, INSPECT_QUERY_KEY, type HandlerDescription } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationNode } from "../tree/node.ts";
import { type NavigationHandler } from "./handler.ts";

/**
 * A navigation handler composed from multiple other handlers.
 *
 * It can be further extended further via its `compose` method.
 *
 * @see {@link NavigationHandler}
 */
export interface ComposedHandler extends NavigationHandler {
	/**
	 * Creates a new composed handler with the given handler added to the front of the chain.
	 */
	compose(handler: NavigationHandler): ComposedHandler;

	chain: HandlerChainLink | null;
}

type HandlerChainLink = {
	handler: NavigationHandler;
	next: HandlerChainLink | null;
};

/**
 * Composes multiple navigation handlers into a single {@link ComposedHandler}.
 * Composed handlers pass actions from one handler to the next.
 *
 * ```ts
 * const handler = composeHandlers([
 *   focusHandler(),
 *   movementHandler(),
 *   parentHandler(),
 * ]);
 * ```
 *
 * @see {@link https://fiveway.dev/guide/handlers#composing-handlers} for more information about composing handlers.
 */
export function composeHandlers(handlers: (NavigationHandler | undefined)[]): ComposedHandler {
	let chain = null;
	for (let i = handlers.length - 1; i >= 0; i--) {
		const handler = handlers[i];
		if (handler == null) {
			continue;
		}
		chain = { handler, next: chain };
	}

	return createHandlerFromChain(chain);
}

function createHandlerFromChain(chain: HandlerChainLink | null): ComposedHandler {
	const composedHandler: ComposedHandler = (node, action, next) => {
		const runLink = (
			link: HandlerChainLink | null,
			id?: NodeId,
			newAction?: NavigationAction,
		): NodeId | null => {
			if (id != null && id !== node.id) {
				return next(id, newAction ?? action);
			}

			if (link == null) {
				return next();
			}

			if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
				describeLinkHandler(link.handler, node, action);
			}

			return link.handler(node, newAction ?? action, runLink.bind(null, link.next));
		};

		return runLink(chain);
	};

	composedHandler.compose = (handler) => createHandlerFromChain({ handler, next: chain });
	composedHandler.chain = chain;

	return composedHandler;
}

function describeLinkHandler(
	handler: NavigationHandler,
	node: NavigationNode,
	action: NavigationAction,
): void {
	if (action.kind === "query" && action.key === INSPECT_QUERY_KEY) {
		const value: Array<HandlerDescription> = [];
		handler(node, { kind: "query", key: INSPECT_QUERY_KEY, value }, () => null);
		if (value.length === 0) {
			describeHandler(action, { name: handler.name });
		}
	}
}
