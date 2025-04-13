/** @vitest-environment jsdom */
import { test, expect } from "vitest";

// imported from index files otherwise vitest errors on:
// TypeError: defineMetadata is not a function
import { defaultHandler, verticalHandler, handleAction } from "@fiveway/core";
import { defaultEventMapping } from "@fiveway/core/dom";
import { createTreeFromSpec } from "./test/tree.ts";

test("defaultKeyMapping", async () => {
  expect(defaultEventMapping(new MouseEvent("mouseover"))).toBeNull();

  const { tree, item1, item2 } = createTreeFromSpec({
    id: "container",
    handler: verticalHandler,
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

  expect(tree.focusedId).toBe(item1.id);

  const action = defaultEventMapping(
    new KeyboardEvent("keydown", { key: "ArrowDown" }),
  );
  expect(action).not.toBeNull();
  handleAction(tree, action!);
  expect(tree.focusedId).toBe(item2.id);
});
