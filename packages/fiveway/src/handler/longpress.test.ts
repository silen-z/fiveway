import { test, expect } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { defaultHandler } from "./handler.ts";
import { longPressHandler } from "./longpress.ts";

test("longPressHandler.query returns metadata on configured node", async () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: [longPressHandler({ threshold: 400 }), defaultHandler],
	});

	expect(longPressHandler.query(tree, nodes.container.id)).toEqual({ threshold: 400 });
});

test("longPressHandler.query returns null without metadata", async () => {
	const { tree, nodes } = createTestTree({ id: "item" });

	expect(longPressHandler.query(tree, nodes.item.id)).toBeNull();
});
