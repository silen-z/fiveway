import { test, expect } from "vite-plus/test";

// import first to avoid circular dependency errors
// prettier-ignore
import { createTreeFromSpec } from "../test/treeSpec.ts";

import {
	focusNode,
	holdFocus,
	insertNode,
	isFocused,
	removeNode,
	createNode,
	containerHandler,
	defaultHandler,
	captureHandler,
	initialHandler,
	verticalHandler,
	handleAction,
} from "../index.ts";

test("focusHandler: items themselves are focusable", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "item",
	});

	expect(tree.focus).toBe(nodes.item.id);
});

test("focusHandler: skip empty containers", () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: containerHandler,
	});

	expect(isFocused(tree, nodes.container.id)).toBe(false);
});

test("focusHandler: already inserted node keeps focus", async () => {
	// already inserted node keeps focus even when another node
	// that would be otherwise focused by initial focuses gets inserted later

	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: containerHandler,
		children: [{ id: "item1", order: 2 }],
	});

	insertNode(
		tree,
		createNode({
			id: "item2",
			parent: nodes.container.id,
			handler: defaultHandler,
			order: 1,
		}),
	);

	expect(tree.focus).toBe(nodes.item1.id);
});

test("initialHandler", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",

		handler: verticalHandler.prepend(initialHandler("item2")),
		children: [
			{
				id: "item1",
				handler: defaultHandler,
			},
			{
				id: "item2",
				handler: defaultHandler,
			},
		],
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
		handler: defaultHandler,
	});
	insertNode(tree, item3);

	expect(tree.focus).toBe(nodes.item2.id);

	removeNode(tree, nodes.item2.id);

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(item3.id);

	insertNode(tree, nodes.item2);

	// initialHandler resets focus back to initial node on insert
	expect(tree.focus).toBe(item3.id);
});

test("captureHandler", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: verticalHandler,
		children: [
			{
				id: "list",
				handler: verticalHandler.prepend(captureHandler),
				children: [{ id: "item1" }, { id: "item2" }],
			},
			{ id: "outside" },
		],
	});

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item2.id);

	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item2.id);

	focusNode(tree, nodes.outside.id);

	expect(tree.focus).toBe(nodes.outside.id);
});
