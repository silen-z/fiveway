import { test, expect } from "vite-plus/test";

// import first to avoid circular dependency errors
// prettier-ignore
import { createTreeFromSpec } from "../test/treeSpec.ts";

import {
	handleAction,
	horizontalHandler,
	verticalHandler,
	createNode,
	insertNode,
	removeNode,
} from "../index.ts";

test("verticalHandler", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item2.id);

	handleAction(tree, { kind: "move", direction: "up" });

	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler: wrong direction", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});

	insertNode(tree, createNode({ id: "item2", parent: nodes.container.id }));

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "up" });

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "left" });

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "right" });

	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler: skip removed", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: verticalHandler,
		children: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
	});

	removeNode(tree, nodes.item2.id);

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item3.id);

	handleAction(tree, { kind: "move", direction: "up" });

	expect(tree.focus).toBe(nodes.item1.id);
});

test("verticalHandler: focus direction", async () => {
	const { tree, nodes } = createTreeFromSpec({
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

	handleAction(tree, { kind: "move", direction: "down" });
	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.outside.id);

	handleAction(tree, { kind: "move", direction: "up" });

	expect(tree.focus).toBe(nodes.item2.id);
});

test("horizontalHandler", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "right" });

	expect(tree.focus).toBe(nodes.item2.id);

	handleAction(tree, { kind: "move", direction: "left" });

	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler: wrong direction", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }],
	});

	insertNode(tree, createNode({ id: "item2", parent: nodes.container.id }));

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "left" });

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "up" });

	expect(tree.focus).toBe(nodes.item1.id);
});

test("horizontalHandler: focus direction", async () => {
	const { tree, nodes } = createTreeFromSpec({
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

	handleAction(tree, { kind: "move", direction: "right" });
	handleAction(tree, { kind: "move", direction: "right" });

	expect(tree.focus).toBe(nodes.outside.id);

	handleAction(tree, { kind: "move", direction: "left" });

	expect(tree.focus).toBe(nodes.item2.id);
});

test("horizontal: skip removed", async () => {
	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: horizontalHandler,
		children: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
	});

	removeNode(tree, nodes.item2.id);

	expect(tree.focus).toBe(nodes.item1.id);

	handleAction(tree, { kind: "move", direction: "right" });

	expect(tree.focus).toBe(nodes.item3.id);

	handleAction(tree, { kind: "move", direction: "left" });

	expect(tree.focus).toBe(nodes.item1.id);
});
