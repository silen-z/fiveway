import { test, expect, vi } from "vitest";
import {
  createNavigationTree,
  insertNode,
  createNode,
  defaultHandler,
  selectHandler,
  handleAction,
} from "@fiveway/core";

test("selectHandler", async () => {
  const tree = createNavigationTree();

  const onSelect = vi.fn();

  const node = createNode({
    id: "test",
    parent: "#",
    handler: defaultHandler.prepend(selectHandler(onSelect)),
  });
  insertNode(tree, node);

  expect(tree.focusedId).toBe(node.id);

  handleAction(tree, { kind: "select" });

  expect(onSelect).toBeCalledTimes(1);
});
