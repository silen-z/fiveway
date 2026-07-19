import { expect, test } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { createNode } from "../tree/node.ts";
import { dispatchAction, insertNode, removeNode } from "../tree/tree.ts";
import { gridHandler, gridItemHandler } from "./grid.ts";
import { defaultHandler } from "./handler.ts";

test("gridHandler", async () => {
	const { tree, nodes } = createTestTree({
		id: "grid",
		handler: gridHandler,
	});

	for (let row = 1; row <= 3; row++) {
		for (let col = 1; col <= 3; col++) {
			const node = createNode({
				id: `item-${row}-${col}`,
				parent: nodes.grid.id,
				handler: defaultHandler.compose(gridItemHandler({ row, col })),
			});
			insertNode(tree, node);
		}
	}
	removeNode(tree, "#/grid/item-2-2");
	removeNode(tree, "#/grid/item-3-3");
	expect(tree.focus).toBe("#/grid/item-1-1");

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe("#/grid/item-2-1");

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe("#/grid/item-3-1");

	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe("#/grid/item-3-2");

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe("#/grid/item-2-3");

	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe("#/grid/item-2-3");

	dispatchAction(tree, { kind: "move", direction: "left" });
	expect(tree.focus).toBe("#/grid/item-1-2");

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe("#/grid/item-2-1");

	dispatchAction(tree, { kind: "move", direction: "right" });
	expect(tree.focus).toBe("#/grid/item-3-2");

	dispatchAction(tree, { kind: "move", direction: "up" });
	expect(tree.focus).toBe("#/grid/item-2-3");

	dispatchAction(tree, { kind: "move", direction: "down" });
	expect(tree.focus).toBe("#/grid/item-3-2");
});

test("gridHandler handles forwards and backwards move directions", () => {
	const { tree, nodes } = createTestTree({
		id: "grid",
		handler: gridHandler,
	});

	for (let row = 1; row <= 3; row++) {
		for (let col = 1; col <= 3; col++) {
			const node = createNode({
				id: `item-${row}-${col}`,
				parent: nodes.grid.id,
				handler: defaultHandler.compose(gridItemHandler({ row, col })),
			});
			insertNode(tree, node);
		}
	}

	removeNode(tree, "#/grid/item-2-2");
	removeNode(tree, "#/grid/item-3-3");

	expect(tree.focus).toBe("#/grid/item-1-1");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-1-2");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-1-3");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-2-1");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-2-3");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-3-1");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-3-2");

	dispatchAction(tree, { kind: "move", direction: "forwards" });
	expect(tree.focus).toBe("#/grid/item-3-2");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-3-1");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-2-3");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-2-1");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-1-3");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-1-2");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-1-1");

	dispatchAction(tree, { kind: "move", direction: "backwards" });
	expect(tree.focus).toBe("#/grid/item-1-1");
});
