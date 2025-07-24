import { test, expect } from "vitest";
import { containerHandler } from "./handlers/default.ts";
import { metaHandler } from "./metadata.ts";
import { createNode } from "./node.ts";
import { createNavigationTree, insertNode } from "./tree.ts";

test("don't look for metadata in parent", () => {
  const tree = createNavigationTree();
  const meta = metaHandler("test");

  const container = createNode({
    id: "test",
    parent: "#",
    handler: containerHandler.prepend(meta(1)),
  });
  insertNode(tree, container);

  const item = createNode({
    id: "test",
    parent: container.id,
  });
  insertNode(tree, item);

  expect(meta.query(tree, item.id)).toBeNull();
});
