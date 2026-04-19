import { expect, test } from "vite-plus/test";

// import first to avoid circular dependency errors
// prettier-ignore
import { createTreeFromSpec } from "../test/treeSpec.ts";

import {
  createNavigationTree,
  insertNode,
  createNode,
  updateNode,
  type NavigationHandler,
  defaultHandler,
} from "../index.ts";

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
  const { nodes } = createTreeFromSpec({
    id: "container",
    children: [{ id: "node1" }, { id: "node2" }, { id: "node3" }],
  });

  expect(nodes.container.children.map((c) => c.id)).toStrictEqual([
    nodes.node1.id,
    nodes.node2.id,
    nodes.node3.id,
  ]);

  updateNode(nodes.node2, {
    order: 1,
  });

  expect(nodes.container.children.map((c) => c.id)).toStrictEqual([
    nodes.node1.id,
    nodes.node3.id,
    nodes.node2.id,
  ]);

  updateNode(nodes.node2, {
    order: -1,
  });

  expect(nodes.container.children.map((c) => c.id)).toStrictEqual([
    nodes.node2.id,
    nodes.node1.id,
    nodes.node3.id,
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

  const node = createNode({
    id: "test",
    parent: "#/parent",
  });

  insertNode(tree, node);

  updateNode(node, { order: 1 });

  expect(node.order).toBe(1);
});
