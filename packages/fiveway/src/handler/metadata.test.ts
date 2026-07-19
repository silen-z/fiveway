import { test, expect } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { defaultHandler } from "./handler.ts";
import { createDataHandler } from "./metadata.ts";

test("DataHandler.query returns DataHandler", () => {
	const testDataHandler = createDataHandler("test");

	const { tree, nodes } = createTestTree({
		id: "node",
		handler: [testDataHandler("value"), defaultHandler],
	});

	expect(testDataHandler.query(tree, nodes.node.id)).toBe("value");
});

test("DataHandler.query returns defaultValue if no value is stored", () => {
	const metaHandler = createDataHandler("test", "default-value");

	const { tree, nodes } = createTestTree({
		id: "container",
		handler: [metaHandler(), defaultHandler],
	});

	expect(metaHandler.query(tree, nodes.container.id)).toBe("default-value");
});

test("DataHandler.query doesn't look for data in parent nodes", () => {
	const testDataHandler = createDataHandler<string>("test");

	const { tree, nodes } = createTestTree({
		id: "container",
		handler: [testDataHandler("value"), defaultHandler],
		children: [{ id: "item" }],
	});

	expect(testDataHandler.query(tree, nodes.item.id)).toBeNull();
});
