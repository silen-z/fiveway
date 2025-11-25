import { expect, test, vi } from "vitest";
import {
  insertNode,
  createNavigationTree,
  createNode,
  type NavigationHandler,
  getHandlerInfo,
  containerHandler,
} from "@fiveway/core";

test("runHandler", async () => {
  const tree = createNavigationTree();

  const handler = vi.fn(() => null);
  insertNode(tree, createNode({ id: "one", parent: "#", handler }));

  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({ id: "#/one" }),
    expect.objectContaining({ kind: "focus" }),
    expect.any(Function),
  );
});

test("runHandler: pass action to non-existent node", () => {
  const tree = createNavigationTree();

  const handler: NavigationHandler = (n, a, next) => {
    const nextId = next("#/non-existent");
    expect(nextId).toBeNull();
    return nextId;
  };
  insertNode(tree, createNode({ id: "one", parent: "#", handler }));
});

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
