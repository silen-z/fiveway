import { test, expect } from "vite-plus/test";

import { createTreeFromSpec } from "../../test/treeSpec.ts";
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
  const { tree, item } = createTreeFromSpec({
    id: "item",
  });

  expect(tree.focus).toBe(item.id);
});

test("focusHandler: skip empty containers", () => {
  const { tree, container } = createTreeFromSpec({
    id: "container",
    handler: containerHandler,
  });

  expect(isFocused(tree, container.id)).toBe(false);
});

test("focusHandler: already inserted node keeps focus", async () => {
  // already inserted node keeps focus even when another node
  // that would be otherwise focused by initial focuses gets inserted later

  const { tree, container, item1 } = createTreeFromSpec({
    id: "container",
    handler: containerHandler,
    children: [{ id: "item1", order: 2 }],
  });

  insertNode(
    tree,
    createNode({
      id: "item2",
      parent: container.id,
      handler: defaultHandler,
      order: 1,
    }),
  );

  expect(tree.focus).toBe(item1.id);
});

test("initialHandler", async () => {
  const { tree, container, item1, item2 } = createTreeFromSpec({
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

  insertNode(tree, item1);
  insertNode(tree, item2);

  releaseFocus!();

  expect(tree.focus).toBe(item2.id);

  const item3 = createNode({
    id: "item3",
    parent: container.id,
    handler: defaultHandler,
  });
  insertNode(tree, item3);

  expect(tree.focus).toBe(item2.id);

  removeNode(tree, item2.id);

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(item3.id);

  insertNode(tree, item2);

  // initialHandler resets focus back to initial node on insert
  expect(tree.focus).toBe(item3.id);
});

test("captureHandler", async () => {
  const { tree, item1, item2, outside } = createTreeFromSpec({
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

  expect(tree.focus).toBe(item1.id);

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(item2.id);

  handleAction(tree, { kind: "move", direction: "down" });

  expect(tree.focus).toBe(item2.id);

  focusNode(tree, outside.id);

  expect(tree.focus).toBe(outside.id);
});
