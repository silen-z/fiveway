import { expect, test } from "vite-plus/test";

import { createTestTree } from "../_test/treeSpec.ts";
import { createNode } from "../tree/node.ts";
import { dispatchAction, insertNode, removeNode } from "../tree/tree.ts";
import { defaultHandler } from "./handler.ts";
import { spatialHandler, spatialItemHandler } from "./spatial.ts";

test("spatialHandler", async () => {
	const { tree, nodes } = createTestTree({
		id: "spatial",
		handler: spatialHandler,
	});

	for (let row = 1; row <= 2; row++) {
		for (let col = 1; col <= 2; col++) {
			const position = spatialItemHandler(() => {
				return {
					top: row * 100,
					y: row * 100,
					bottom: row * 100 + 10,

					left: col * 100,
					x: col * 100,
					right: col * 100 + 10,

					width: 10,
					height: 10,
					toJSON: () => null,
				};
			});

			const node = createNode({
				id: `item-${row}-${col}`,
				parent: nodes.spatial.id,
				handler: defaultHandler.compose(position),
			});

			insertNode(tree, node);
		}
	}

	removeNode(tree, "#/spatial/item-2-2");

	expect(tree.focus).toBe("#/spatial/item-1-1");

	dispatchAction(tree, { kind: "move", direction: "right" });

	expect(tree.focus).toBe("#/spatial/item-1-2");

	dispatchAction(tree, { kind: "move", direction: "down" });

	expect(tree.focus).toBe("#/spatial/item-2-1");

	dispatchAction(tree, { kind: "move", direction: "up" });

	expect(tree.focus).toBe("#/spatial/item-1-1");

	dispatchAction(tree, { kind: "move", direction: "right" });

	expect(tree.focus).toBe("#/spatial/item-1-2");

	dispatchAction(tree, { kind: "move", direction: "left" });

	expect(tree.focus).toBe("#/spatial/item-1-1");
});
