import { type NavigationAction } from "../action.ts";
import { describeHandler, INSPECT_QUERY_KEY, type HandlerDescription } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavigationNode } from "../tree/node.ts";
import { type NavigationHandler } from "./handler.ts";

/**
 * A navigation handler composed from multiple other handlers.
 *
 * It can be further extended further via its `compose` method.
 */
export interface ComposedHandler extends NavigationHandler {
	/**
	 * Creates a new composed handler with the given handler added to the front of the chain.
	 *
	 * @param handler - The handler to add to the front of the chain.
	 * @returns A new composed handler.
	 */
	compose(handler: NavigationHandler | ComposedHandler): ComposedHandler;

	/** @internal */
	chain: HandlerChainLink | null;
}

type HandlerChainLink = {
	handler: NavigationHandler;
	next: HandlerChainLink | null;
};

/**
 * Composes multiple navigation handlers so they run in a sequence.
 *
 * Also adds `.compose()` method to allow further composition.
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

	composedHandler.chain = chain;

	composedHandler.compose = (handler) => {
		// handler is a regular not composed handler
		if (!("chain" in handler)) {
			return createHandlerFromChain({ handler, next: chain });
		}

		// when current chain there is nothing to compose so just return the incoming handler
		if (chain === null) {
			return handler;
		}

		// when the incoming handler is not composed, just return the current composed handler
		if (handler.chain === null) {
			return composedHandler;
		}

		const appended = appendLink(handler.chain, chain);
		return createHandlerFromChain(appended);
	};

	return composedHandler;
}

function appendLink(chain: HandlerChainLink, link: HandlerChainLink): HandlerChainLink {
	const cloned: HandlerChainLink = { handler: chain.handler, next: null };

	let current = chain;
	let currentCloned = cloned;

	while (current.next !== null) {
		currentCloned.next = { handler: current.next.handler, next: null };

		current = current.next;
		currentCloned = currentCloned.next;
	}

	currentCloned.next = link;
	return cloned;
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
