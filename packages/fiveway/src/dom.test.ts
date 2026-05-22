// @vitest-environment happy-dom

import { test, expect } from "vite-plus/test";

// import first to avoid circular dependency errors
// prettier-ignore
import { createTreeFromSpec } from "./test/treeSpec.ts";

import { defaultKeybinds } from "./dom.ts";
import { verticalHandler, defaultHandler, dispatchAction } from "./index.ts";

test("defaultKeyMapping", async () => {
	expect(defaultKeybinds(new MouseEvent("mouseover"))).toBeNull();

	const { tree, nodes } = createTreeFromSpec({
		id: "container",
		handler: verticalHandler,
		children: [
			{ id: "item1", handler: defaultHandler },
			{ id: "item2", handler: defaultHandler },
		],
	});

	expect(tree.focus).toBe(nodes.item1.id);

	const action = defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowDown" }));
	expect(action).not.toBeNull();
	dispatchAction(tree, action!);
	expect(tree.focus).toBe(nodes.item2.id);
});
