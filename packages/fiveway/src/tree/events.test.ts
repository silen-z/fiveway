import { expect, test, vi } from "vite-plus/test";

import {
  registerListener,
  createNavigationTree,
  focusNode,
  insertNode,
  isFocused,
  createNode,
} from "../index.ts";

test("listeners", async () => {
  const tree = createNavigationTree();

  insertNode(tree, createNode({ id: "one", parent: "#" }));
  insertNode(tree, createNode({ id: "two", parent: "#" }));

  expect(tree.focus).toBe("#/one");

  const listener1 = vi.fn<() => void>();
  const cleanupListener1 = registerListener(tree, "#", listener1);

  const listener2 = vi.fn<() => void>();
  const cleanupListener2 = registerListener(tree, "#", listener2);

  focusNode(tree, "#/two");

  expect(isFocused(tree, "#/two")).toBe(true);
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);

  cleanupListener1();

  focusNode(tree, "#/one");
  expect(isFocused(tree, "#/one")).toBe(true);
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(2);

  cleanupListener2();

  focusNode(tree, "#/two");
  expect(isFocused(tree, "#/two")).toBe(true);
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(2);
});

test("listeners: cleaning listener twice", () => {
  const tree = createNavigationTree();
  const cleanup = registerListener(tree, "#", () => {});

  cleanup();
  expect(() => {
    cleanup();
  }).not.toThrow();
});
