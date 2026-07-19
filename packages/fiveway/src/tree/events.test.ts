import { expect, test, vi } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { registerFocusListener } from "./events.ts";
import { createNavigationTree, focusNode, isFocused } from "./tree.ts";

test("listeners", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		children: [{ id: "one" }, { id: "two" }],
	});

	expect(tree.focus).toBe(nodes.one.id);

	const listener1 = vi.fn<() => void>();
	const cleanupListener1 = registerFocusListener(tree, "#", listener1);

	const listener2 = vi.fn<() => void>();
	const cleanupListener2 = registerFocusListener(tree, "#", listener2);

	focusNode(tree, nodes.two.id);

	expect(isFocused(tree, nodes.two.id)).toBe(true);
	expect(listener1).toHaveBeenCalledTimes(1);
	expect(listener2).toHaveBeenCalledTimes(1);

	cleanupListener1();

	focusNode(tree, nodes.one.id);
	expect(isFocused(tree, nodes.one.id)).toBe(true);
	expect(listener1).toHaveBeenCalledTimes(1);
	expect(listener2).toHaveBeenCalledTimes(2);

	cleanupListener2();

	focusNode(tree, nodes.two.id);
	expect(isFocused(tree, nodes.two.id)).toBe(true);
	expect(listener1).toHaveBeenCalledTimes(1);
	expect(listener2).toHaveBeenCalledTimes(2);
});

test("listeners: cleaning listener twice", () => {
	const tree = createNavigationTree();
	const cleanup = registerFocusListener(tree, "#", () => {});

	cleanup();
	expect(() => {
		cleanup();
	}).not.toThrow();
});
