import { test, expect } from "vite-plus/test";

import {
	type NavigationHandler,
	createNode,
	createNavigationTree,
	insertNode,
	chainedHandler,
	defaultHandler,
	dataHandler,
	dispatchAction,
} from "../index.ts";

test("chainedHandler", () => {
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

	const subChain = chainedHandler()
		.prepend(logHandler("4"))
		.prepend(logHandler("3"))
		.prepend(logHandler("2"));

	const handler = chainedHandler()
		.prepend(logHandler("5"))
		.prepend(subChain)
		.prepend(logHandler("1"));

	const node = createNode({ id: "node1", parent: "#", handler: defaultHandler.prepend(handler) });
	insertNode(tree, node);

	dispatchAction(tree, { kind: "query", key: "log", value: null });

	expect(logs).toEqual(["#/node1:1", "#/node1:2", "#/node1:3", "#/node1:4", "#/node1:5"]);
});

test("chainedHandler: meta", () => {
	const tree = createNavigationTree();

	const testHandler = dataHandler("test");

	const node = createNode({
		id: "node",
		parent: "#",
		handler: defaultHandler.prepend(testHandler("test-value")),
	});
	insertNode(tree, node);

	const node2 = createNode({
		id: "node2",
		parent: "#",
		handler: defaultHandler.prepend(testHandler(() => "test-value")),
	});
	insertNode(tree, node2);

	expect(testHandler.query(tree, node.id)).toBe("test-value");
	expect(testHandler.query(tree, node2.id)).toBe("test-value");
});
