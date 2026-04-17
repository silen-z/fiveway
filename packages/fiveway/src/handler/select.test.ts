import { test, expect, vi } from "vite-plus/test";

import {
  createNavigationTree,
  insertNode,
  createNode,
  defaultHandler,
  selectHandler,
  handleAction,
} from "../index.ts";

test("selectHandler", async () => {
  const tree = createNavigationTree();

  const onSelect = vi.fn<() => void>();

  const node = createNode({
    id: "test",
    parent: "#",
    handler: defaultHandler.prepend(selectHandler(onSelect)),
  });
  insertNode(tree, node);

  expect(tree.focus).toBe(node.id);

  handleAction(tree, { kind: "select" });

  expect(onSelect).toHaveBeenCalledTimes(1);
});
