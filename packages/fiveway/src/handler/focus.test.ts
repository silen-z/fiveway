import { test, expect } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { createNode } from "../tree/node.ts";
import {
	dispatchAction,
	focusNode,
	holdFocus,
	insertNode,
	isFocused,
	removeNode,
} from "../tree/tree.ts";
import { verticalHandler } from "./directional.ts";
import { captureHandler, initialHandler } from "./focus.ts";
import { containerHandler } from "./handler.ts";

test("focusHandler: items themselves are focusable", async () => {
	const { tree, nodes } = createTestTree({
		id: "item",
	});

	expect(tree.focus).toBe(nodes.item.id);
});

test("focusHandler: skip empty containers", () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: containerHandler,
	});

	expect(isFocused(tree, nodes.container.id)).toBe(false);
});

test("focusHandler: already inserted node keeps focus", async () => {
	// already inserted node keeps focus even when another node
	// that would be otherwise focused by initial focuses gets inserted later

	const { tree, nodes } = createTestTree({
		id: "container",
		handler: containerHandler,
		children: [{ id: "item1", order: 2 }],
	});

	insertNode(
		tree,
		createNode({
			id: "item2",
			parent: nodes.container.id,
			order: 1,
		}),
	);

	expect(tree.focus).toBe(nodes.item1.id);
});

test("initialHandler", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",

		handler: [initialHandler("item2"), verticalHandler],
		children: [{ id: "item1" }, { id: "item2" }],
	});

	const releaseFocus = holdFocus(tree);
	expect(releaseFocus).not.toBeNull();

	insertNode(tree, nodes.item1);
	insertNode(tree, nodes.item2);

	releaseFocus!();

	expect(tree.focus).toBe(nodes.item2.id);

	const item3 = createNode({
		id: "item3",
		parent: nodes.container.id,
	});
	insertNode(tree, item3);

	expect(tree.focus).toBe(nodes.item2.id);

	removeNode(tree, nodes.item2.id);

	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(item3.id);

	insertNode(tree, nodes.item2);

	// initialHandler resets focus back to initial node on insert
	expect(tree.focus).toBe(item3.id);
});

test("captureHandler", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [
			{
				id: "list",
				handler: [captureHandler, verticalHandler],
				children: [{ id: "item1" }, { id: "item2" }],
			},
			{ id: "outside" },
		],
	});

	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item2.id);

	dispatchAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item2.id);

	focusNode(tree, nodes.outside.id);

	expect(tree.focus).toBe(nodes.outside.id);
});
