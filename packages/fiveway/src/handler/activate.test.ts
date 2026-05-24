import { test, expect, vi } from "vite-plus/test";

import {
	type ActivateCallback,
	createNavigationTree,
	insertNode,
	createNode,
	defaultHandler,
	activationHandler,
	dispatchAction,
} from "../index.ts";

test("activationHandler", async () => {
	const tree = createNavigationTree();

	const onActivate = vi.fn<ActivateCallback>();

	const node = createNode({
		id: "test",
		parent: "#",
		handler: defaultHandler.compose(activationHandler(onActivate)),
	});
	insertNode(tree, node);

	expect(tree.focus).toBe(node.id);

	dispatchAction(tree, { kind: "activate" });

	expect(onActivate).toHaveBeenCalledTimes(1);
	expect(onActivate).toHaveBeenCalledWith({ longpress: false });
});
