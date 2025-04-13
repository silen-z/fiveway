import { expect, test } from "vitest";
import { gridHandler, gridItemHandler } from "./grid.ts";
import { handleAction } from "../navigation.ts";
import { createNode } from "../node.ts";
import { insertNode, removeNode } from "../tree.ts";
import { defaultHandler } from "./default.ts";
import { createTreeFromSpec } from "../test/tree.ts";

test("gridHandler", async () => {
  const { tree, grid } = createTreeFromSpec({
    id: "grid",
    handler: gridHandler(),
  });

  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      const node = createNode({
        id: `item-${row}-${col}`,
        parent: grid.id,
        handler: defaultHandler.prepend(gridItemHandler({ row, col })),
      });
      insertNode(tree, node);
    }
  }

  removeNode(tree, "#/grid/item-2-2");
  removeNode(tree, "#/grid/item-3-3");

  expect(tree.focusedId).toBe("#/grid/item-1-1");

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focusedId).toBe("#/grid/item-2-1");

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focusedId).toBe("#/grid/item-3-1");

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focusedId).toBe("#/grid/item-3-2");

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focusedId).toBe("#/grid/item-2-3");

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focusedId).toBe("#/grid/item-2-3");

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focusedId).toBe("#/grid/item-1-2");

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focusedId).toBe("#/grid/item-2-1");

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focusedId).toBe("#/grid/item-3-2");

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focusedId).toBe("#/grid/item-2-3");

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focusedId).toBe("#/grid/item-3-2");
});
