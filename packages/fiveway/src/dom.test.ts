// @vitest-environment happy-dom

import { test, expect } from "vite-plus/test";

// import first to avoid circular dependency errors
import { createTreeFromSpec } from "../test/treeSpec.ts";
import { defaultEventMapping } from "./dom.ts";
import { verticalHandler, defaultHandler, handleAction } from "./index.ts";

test("defaultKeyMapping", async () => {
  expect(defaultEventMapping(new MouseEvent("mouseover"))).toBeNull();

  const { tree, item1, item2 } = createTreeFromSpec({
    id: "container",
    handler: verticalHandler,
    children: [
      { id: "item1", handler: defaultHandler },
      { id: "item2", handler: defaultHandler },
    ],
  });

  expect(tree.focus).toBe(item1.id);

  const action = defaultEventMapping(new KeyboardEvent("keydown", { key: "ArrowDown" }));
  expect(action).not.toBeNull();
  handleAction(tree, action!);
  expect(tree.focus).toBe(item2.id);
});
