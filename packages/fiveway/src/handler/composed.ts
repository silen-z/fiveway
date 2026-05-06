import { type NavigationAction } from "../action.ts";
import { describeHandler, INSPECT_QUERY_KEY, type HandlerDescription } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { type NavtreeNode } from "../tree/node.ts";
import { type NavigationHandler } from "./handler.ts";

/**
 * A navigation handler composed from multiple other handlers.
 *
 * It can be further extended further via its `compose` method.
 */
export type ComposedHandler = NavigationHandler & {
	link: HandlerLink | null;

	/**
	 * Creates a new composed handler with the given handler added to the front of the chain.
	 *
	 * @param handler - The handler to add to the front of the chain.
	 * @returns A new composed handler.
	 */
	compose(handler: NavigationHandler | ComposedHandler): ComposedHandler;
};

type HandlerLink = {
	handler: NavigationHandler;
	next: HandlerLink | null;
};

/**
 * Composes multiple navigation handlers so they run in a sequence.
 *
 * Also adds `.compose()` method to allow further composition.
 */
export function composeHandlers(
	link: HandlerLink | NavigationHandler | NavigationHandler[] | null = null,
): ComposedHandler {
	if (typeof link === "function") {
		link = { handler: link, next: null };
	} else if (Array.isArray(link)) {
		link = createChain(link);
	}

	const composedHandler: ComposedHandler = (node, action, next) => {
		const runLink = (
			link: HandlerLink | null,
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

		return runLink(link);
	};

	composedHandler.link = link;

	composedHandler.compose = (handler) => {
		if ("link" in handler) {
			if (handler.link === null) {
				return composedHandler;
			}

			const cloned = cloneChain(handler.link);
			appendChain(cloned, link);
			return composeHandlers(cloned);
		}

		return composeHandlers({ handler, next: link });
	};

	return composedHandler;
}

function createChain(handlers: (NavigationHandler | ComposedHandler)[]): HandlerLink | null {
	if (handlers.length === 0) {
		return null;
	}

	let chain = null;
	for (let i = handlers.length - 1; i >= 0; i--) {
		chain = { handler: handlers[i]!, next: chain };
	}

	return chain;
}

function appendChain(chain: HandlerLink, next: HandlerLink | null) {
	let current = chain;
	while (current.next !== null) {
		current = current.next;
	}

	current.next = next;
}

function cloneChain(original: HandlerLink) {
	const cloned: HandlerLink = { handler: original.handler, next: null };

	let current = original;
	let currentCloned = cloned;

	while (current.next !== null) {
		currentCloned.next = { handler: current.next.handler, next: null };

		current = current.next;
		currentCloned = currentCloned.next;
	}

	return cloned;
}

function describeLinkHandler(
	handler: NavigationHandler,
	node: NavtreeNode,
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
