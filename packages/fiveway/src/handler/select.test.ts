import { test, expect, vi } from "vite-plus/test";

import {
	createNavigationTree,
	insertNode,
	createNode,
	defaultHandler,
	selectHandler,
	dispatchAction,
} from "../index.ts";

test("selectHandler", async () => {
	const tree = createNavigationTree();

	const onSelect = vi.fn<() => void>();

	const node = createNode({
		id: "test",
		parent: "#",
		handler: defaultHandler.compose(selectHandler(onSelect)),
	});
	insertNode(tree, node);

	expect(tree.focus).toBe(node.id);

	dispatchAction(tree, { kind: "select" });

	expect(onSelect).toHaveBeenCalledTimes(1);
});
