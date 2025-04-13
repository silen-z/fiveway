import { test, expect } from "vitest";
import { createNavigationTree, insertNode } from "../tree.ts";
import { createNode } from "../node.ts";
import { getHandlerInfo } from "../introspection.ts";
import { containerHandler } from "./default.ts";

// TODO test behavior instead of internal properties
test("defaultHandler", () => {
  const tree = createNavigationTree();

  const container = createNode({
    id: "test",
    parent: "#",
    handler: containerHandler,
  });
  insertNode(tree, container);

  const item = createNode({
    id: "test",
    parent: container.id,
  });
  insertNode(tree, item);

  expect(getHandlerInfo(tree, container.id)).toEqual([
    { name: "core:focus", skipEmpty: true, direction: "default" },
    { name: "core:parent" },
  ]);

  expect(getHandlerInfo(tree, item.id)).toEqual([
    { name: "core:focus", skipEmpty: false, direction: "default" },
    { name: "core:parent" },
  ]);
});
