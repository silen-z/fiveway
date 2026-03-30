import { test, expect } from "vite-plus/test";

import { createTreeFromSpec } from "../../test/treeSpec.ts";
import {
  handleAction,
  horizontalHandler,
  verticalHandler,
  createNode,
  insertNode,
  removeNode,
} from "../index.ts";

test("verticalHandler", async () => {
  const { tree, item1, item2 } = createTreeFromSpec({
    id: "container",
    handler: verticalHandler,
    children: [{ id: "item1" }, { id: "item2" }],
  });

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(item2.id);

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focus).toBe(item1.id);
});

test("verticalHandler: wrong direction", async () => {
  const { tree, container, item1 } = createTreeFromSpec({
    id: "container",
    handler: verticalHandler,
    children: [{ id: "item1" }, { id: "item2" }],
  });

  insertNode(tree, createNode({ id: "item2", parent: container.id }));

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focus).toBe(item1.id);
});

test("verticalHandler: skip removed", async () => {
  const { tree, item1, item2, item3 } = createTreeFromSpec({
    id: "container",
    handler: verticalHandler,
    children: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
  });

  removeNode(tree, item2.id);

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(item3.id);

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focus).toBe(item1.id);
});

test("verticalHandler: focus direction", async () => {
  const { tree, item1, item2, outside } = createTreeFromSpec({
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

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "down" });
  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(outside.id);

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focus).toBe(item2.id);
});

test("horizontalHandler", async () => {
  const { tree, item1, item2 } = createTreeFromSpec({
    id: "container",
    handler: horizontalHandler,
    children: [{ id: "item1" }, { id: "item2" }],
  });

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focus).toBe(item2.id);

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focus).toBe(item1.id);
});

test("horizontalHandler: wrong direction", async () => {
  const { tree, container, item1 } = createTreeFromSpec({
    id: "container",
    handler: horizontalHandler,
    children: [{ id: "item1" }, { id: "item2" }],
  });

  insertNode(tree, createNode({ id: "item2", parent: container.id }));

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "up" });

  expect(tree.focus).toBe(item1.id);
});

test("horizontalHandler: focus direction", async () => {
  const { tree, item1, item2, outside } = createTreeFromSpec({
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

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "right" });
  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focus).toBe(outside.id);

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focus).toBe(item2.id);
});

test("horizontal: skip removed", async () => {
  const { tree, item1, item2, item3 } = createTreeFromSpec({
    id: "container",
    handler: horizontalHandler,
    children: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
  });

  removeNode(tree, item2.id);

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "right" });

  expect(tree.focus).toBe(item3.id);

  handleAction(tree, { kind: "move", direction: "left" });

  expect(tree.focus).toBe(item1.id);
});
