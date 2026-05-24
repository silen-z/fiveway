import { test, expect } from "vite-plus/test";

import { createTestTree } from "../_test/treeSpec.ts";
import { dispatchAction } from "../tree/tree.ts";
import { composeHandlers } from "./composed.ts";
import { defaultHandler, type NavigationHandler } from "./handler.ts";
import { createDataHandler } from "./metadata.ts";

test("composedHandler", () => {
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

	const { tree } = createTestTree({
		id: "node1",
		handler: defaultHandler.compose(handler),
	});

	dispatchAction(tree, { kind: "query", key: "log", value: null });

	expect(logs).toEqual(["#/node1:1", "#/node1:2", "#/node1:3", "#/node1:4", "#/node1:5"]);
});

test("composeHandlers with conditional handler", () => {
	const handler = composeHandlers([undefined, defaultHandler]);
	expect(handler).not.toBeNull();
});

test("composedHandler: meta", () => {
	const testHandler = createDataHandler("test");

	const { tree, nodes } = createTestTree({
		id: "root",
		children: [
			{
				id: "node",
				handler: defaultHandler.compose(testHandler("test-value")),
			},
			{
				id: "node2",
				handler: defaultHandler.compose(testHandler(() => "test-value")),
			},
		],
	});

	expect(testHandler.query(tree, nodes.node.id)).toBe("test-value");
	expect(testHandler.query(tree, nodes.node2.id)).toBe("test-value");
});
