import { expect, test } from "vitest";
import { createTreeFromSpec } from "../../test/treeSpec.ts";
import {
  spatialHandler,
  spatialItemHandler,
  handleAction,
  createNode,
  insertNode,
  removeNode,
  defaultHandler,
} from "../index.ts";

test("spatialHandler", async () => {
  const { tree, spatial } = createTreeFromSpec({
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
        parent: spatial.id,
        handler: defaultHandler.prepend(position),
      });

      insertNode(tree, node);
    }
  }

  removeNode(tree, "#/spatial/item-2-2");

  expect(tree.focusedId).toBe("#/spatial/item-1-1");

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focusedId).toBe("#/spatial/item-1-2");

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focusedId).toBe("#/spatial/item-2-1");

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focusedId).toBe("#/spatial/item-1-1");

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focusedId).toBe("#/spatial/item-1-2");

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focusedId).toBe("#/spatial/item-1-1");
});
