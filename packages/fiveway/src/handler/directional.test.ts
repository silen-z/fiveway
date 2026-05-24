import { test, expect } from "vite-plus/test";

import { createTestTree } from "../_test/treeSpec.ts";
import { dispatchAction, removeNode } from "../tree/tree.ts";
import { horizontalHandler, verticalHandler } from "./directional.ts";

test("verticalHandler", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe(nodes.item2.id);

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler handles forwards/backwards directions", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe(nodes.item2.id);

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler ignore moves in other directions", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "left" });
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler handles move actions when these is nowhere to move", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler skips inactive children", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
	});
	removeNode(tree, nodes.item2.id);
	expect(tree.focus).toBe(nodes.item1.id);
	expect(nodes.container.children.length).toBe(3); // NodeChild is kept in inactive state

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe(nodes.item3.id);

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler: focus direction", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: verticalHandler,
		children: [
			{
				id: "list",
				handler: verticalHandler,
				children: [{ id: "item1" }, { id: "item2" }],
			},
			{ id: "outside" },
		],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "down" });
	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe(nodes.outside.id);

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe(nodes.item2.id);
});

test("horizontalHandler", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe(nodes.item2.id);

	dispatchAction(tree, { kind: "move", direction: "left" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler handles forwards/backwards directions", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe(nodes.item2.id);

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler ignore moves in other directions", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler handles move actions when these is nowhere to move", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "left" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler skips inactive children", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
	});
	removeNode(tree, nodes.item2.id);
	expect(tree.focus).toBe(nodes.item1.id);
	expect(nodes.container.children.length).toBe(3); // NodeChild is kept in inactive state

	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe(nodes.item3.id);

	dispatchAction(tree, { kind: "move", direction: "left" });
	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler: focus direction", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: horizontalHandler,
		children: [
			{
				id: "list",
				handler: horizontalHandler,
				children: [{ id: "item1" }, { id: "item2" }],
			},
			{ id: "outside" },
		],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	dispatchAction(tree, { kind: "move", direction: "right" });
	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe(nodes.outside.id);

	dispatchAction(tree, { kind: "move", direction: "left" });
	expect(tree.focus).toBe(nodes.item2.id);
});
