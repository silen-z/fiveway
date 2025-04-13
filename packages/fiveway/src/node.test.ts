import { expect, test } from "vitest";
import { createNavigationTree, insertNode } from "./tree.ts";
import { createNode, updateNode } from "./node.ts";
import { NavigationHandler } from "./navigation.ts";
import { defaultHandler } from "./handlers/default.ts";
import { createTreeFromSpec } from "./test/tree.ts";

test("createNode", () => {
  const node = createNode({
    id: "test",
    parent: "#",
  });

  expect(node.id).toBe("#/test");
  expect(node.connected).toBe(false);
  expect(node.handler).toBe(defaultHandler);
  expect(node.children.length).toBe(0);
});

test("updateNode: handler", () => {
  const tree = createNavigationTree();
  const handler1: NavigationHandler = (n, a, next) => next();
  const handler2: NavigationHandler = (n, a, next) => next();

  const node = createNode({
    id: "test",
    parent: "#",
    handler: handler1,
  });
  insertNode(tree, node);

  expect(node.handler).toBe(handler1);

  updateNode(node, { handler: handler2 });

  expect(node.handler).toBe(handler2);
});

test("updateNode: order", () => {
  const { container, node1, node2, node3 } = createTreeFromSpec({
    id: "container",
    children: [{ id: "node1" }, { id: "node2" }, { id: "node3" }],
  });

  expect(container.children.map((c) => c.id)).toStrictEqual([
    node1.id,
    node2.id,
    node3.id,
  ]);

  updateNode(node2, {
    order: 1,
  });

  expect(container.children.map((c) => c.id)).toStrictEqual([
    node1.id,
    node3.id,
    node2.id,
  ]);

  updateNode(node2, {
    order: -1,
  });

  expect(container.children.map((c) => c.id)).toStrictEqual([
    node2.id,
    node1.id,
    node3.id,
  ]);
});

test("updateNode: order on disconnected", () => {
  const node = createNode({
    id: "container",
    parent: "#",
  });

  updateNode(node, { order: 1 });

  expect(node.order).toBe(1);
});

test("updateNode: order when parent is not connected", () => {
  const tree = createNavigationTree();

  const node = insertNode(
    tree,
    createNode({
      id: "test",
      parent: "#/parent",
    }),
  );

  updateNode(node, { order: 1 });

  expect(node.order).toBe(1);
});
