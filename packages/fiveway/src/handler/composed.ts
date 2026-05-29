import { type NavigationAction } from "../action.ts";
import { describeHandler, INSPECT_QUERY_KEY, type HandlerDescription } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationHandler, type NavigationHandlerContext } from "./handler.ts";

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
export function composeHandlers(
	handlers: (NavigationHandler | ComposedHandler | undefined)[],
): ComposedHandler {
	let chain = null;

	let end = handlers.length - 1;

	// reuse chain from last handler if it's a composed handler
	const last = handlers[end];
	if (last != null && "chain" in last) {
		chain = last.chain;
		end -= 1;
	}

	for (let i = end; i >= 0; i--) {
		const handler = handlers[i];
		if (handler == null) {
			continue;
		}

		chain = { handler, next: chain };
	}

	return createHandlerFromChain(chain);
}

function createHandlerFromChain(chain: HandlerChainLink | null): ComposedHandler {
	const composedHandler: ComposedHandler = (action, ctx) => {
		const executeLink = (
			link: HandlerChainLink | null,
			nextNode?: NodeId,
			nextAction?: NavigationAction,
		): NodeId | null => {
			if (nextNode != null && nextNode !== ctx.node.id) {
				return ctx.next(nextNode, nextAction ?? action);
			}

			if (link == null) {
				return ctx.next();
			}

			if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
				describeLinkHandler(link.handler, action, ctx);
			}

			return link.handler(nextAction ?? action, {
				node: ctx.node,
				next: executeLink.bind(null, link.next),
			});
		};

		return executeLink(chain);
	};

	composedHandler.compose = (handler) => createHandlerFromChain({ handler, next: chain });
	composedHandler.chain = chain;

	return composedHandler;
}

function describeLinkHandler(
	handler: NavigationHandler,
	action: NavigationAction,
	ctx: NavigationHandlerContext,
): void {
	if (action.kind === "query" && action.key === INSPECT_QUERY_KEY) {
		const value: Array<HandlerDescription> = [];
		handler({ kind: "query", key: INSPECT_QUERY_KEY, value }, { node: ctx.node, next: () => null });
		if (value.length === 0) {
			describeHandler(action, { name: handler.name });
		}
	}
}
