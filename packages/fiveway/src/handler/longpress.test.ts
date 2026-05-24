import { test, expect } from "vite-plus/test";

import { createNavigationTree, createNode, defaultHandler, insertNode } from "../index.ts";
import { longPressHandler } from "./longpress.ts";

test("longPressHandler.query returns metadata on configured node", async () => {
	const tree = createNavigationTree();
	const node = createNode({
		id: "item",
		parent: "#",
		handler: defaultHandler.compose(longPressHandler({ threshold: 400 })),
	});
	insertNode(tree, node);

	expect(longPressHandler.query(tree, node.id)).toEqual({ threshold: 400 });
});

test("longPressHandler.query returns null without metadata", async () => {
	const tree = createNavigationTree();
	const node = createNode({ id: "item", parent: "#" });
	insertNode(tree, node);

	expect(longPressHandler.query(tree, node.id)).toBeNull();
});
