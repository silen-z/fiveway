import { test, expect } from "vite-plus/test";

import {
	type NavigationHandler,
	createNode,
	createNavigationTree,
	insertNode,
	composeHandlers,
	defaultHandler,
	createDataHandler,
	dispatchAction,
} from "../index.ts";

test("composedHandler", () => {
	const tree = createNavigationTree();
	const logs: string[] = [];

	const logHandler =
		(msg: string): NavigationHandler =>
		(n, a, next) => {
			if (a.kind === "query" && a.key === "log") {
				logs.push(n.id + ":" + msg);
			}
			return next();
		};

	const subComposition = composeHandlers([])
		.compose(logHandler("4"))
		.compose(logHandler("3"))
		.compose(logHandler("2"));

	const handler = composeHandlers([])
		.compose(logHandler("5"))
		.compose(subComposition)
		.compose(logHandler("1"));

	const node = createNode({ id: "node1", parent: "#", handler: defaultHandler.compose(handler) });
	insertNode(tree, node);

	dispatchAction(tree, { kind: "query", key: "log", value: null });

	expect(logs).toEqual(["#/node1:1", "#/node1:2", "#/node1:3", "#/node1:4", "#/node1:5"]);
});

test("composeHandlers with conditional handler", () => {
	const handler = composeHandlers([undefined, defaultHandler]);
	expect(handler).not.toBeNull();
});

test("composedHandler: meta", () => {
	const tree = createNavigationTree();

	const testHandler = createDataHandler("test");

	const node = createNode({
		id: "node",
		parent: "#",
		handler: defaultHandler.compose(testHandler("test-value")),
	});
	insertNode(tree, node);

	const node2 = createNode({
		id: "node2",
		parent: "#",
		handler: defaultHandler.compose(testHandler(() => "test-value")),
	});
	insertNode(tree, node2);

	expect(testHandler.query(tree, node.id)).toBe("test-value");
	expect(testHandler.query(tree, node2.id)).toBe("test-value");
});
