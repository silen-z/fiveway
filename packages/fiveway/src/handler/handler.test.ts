import { expect, test, vi } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { inspectHandler } from "../inspector.ts";
import { containerHandler, type NavigationHandler } from "./handler.ts";

test("executeHandler", async () => {
	const handler = vi.fn<NavigationHandler>(() => null);
	createTestTree({ id: "one", handler });

	expect(handler).toHaveBeenCalledWith(
		expect.objectContaining({ kind: "focus" }),
		expect.objectContaining({
			node: expect.objectContaining({ id: "#/one" }),
			next: expect.any(Function),
		}),
	);
});

test("executeHandler: pass action to non-existent node", () => {
	const handler: NavigationHandler = (_, { next }) => {
		const nextId = next("#/non-existent");
		expect(nextId).toBeNull();
		return nextId;
	};
	createTestTree({ id: "one", handler });
});

// TODO test behavior instead of internal properties
test("defaultHandler", () => {
	const { tree, nodes } = createTestTree({
		id: "container",
		handler: containerHandler,
		children: [{ id: "item" }],
	});

	expect(inspectHandler(tree, nodes.container.id)).toEqual([
		{ name: "focus", focusWhenEmpty: false, direction: "default" },
		{ name: "parent" },
	]);

	expect(inspectHandler(tree, nodes.item.id)).toEqual([
		{ name: "focus", focusWhenEmpty: true, direction: "default" },
		{ name: "parent" },
	]);
});
