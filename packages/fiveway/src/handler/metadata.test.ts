import { test, expect } from "vite-plus/test";

import {
	containerHandler,
	dataHandler,
	createNode,
	createNavigationTree,
	insertNode,
} from "../index.ts";

test("don't look for metadata in parent", () => {
	const tree = createNavigationTree();
	const meta = dataHandler("test");

	const container = createNode({
		id: "test",
		parent: "#",
		handler: containerHandler.compose(meta(1)),
	});
	insertNode(tree, container);

	const item = createNode({
		id: "test",
		parent: container.id,
	});
	insertNode(tree, item);

	expect(meta.query(tree, item.id)).toBeNull();
});
