import { test, expect, vi } from "vite-plus/test";

import { createTestTree } from "../_test/treeSpec.ts";
import { dispatchAction, focusNode } from "../tree/tree.ts";
import { activateNode, activationHandler, type ActivateCallback } from "./activate.ts";
import { defaultHandler, itemHandler } from "./handler.ts";

test("activationHandler", async () => {
	const onActivate = vi.fn<ActivateCallback>();

	const { tree, nodes } = createTestTree({
		id: "test",
		handler: [activationHandler(onActivate), defaultHandler],
	});

	expect(tree.focus).toBe(nodes.test.id);

	dispatchAction(tree, { kind: "activate" });

	expect(onActivate).toHaveBeenCalledTimes(1);
	expect(onActivate).toHaveBeenCalledWith({ longpress: false });
});

test("activateNode", () => {
	let activated = false;

	const { tree, nodes } = createTestTree({
		id: "container",
		handler: [
			activationHandler(() => {
				activated = true;
			}),
			defaultHandler,
		],
	});
	expect(tree.focus).toBe(nodes.container.id);

	activateNode(tree, nodes.container.id);
	expect(activated).toBe(true);
});

test("activateNode with focus option", () => {
	let item1Activated = false;
	let item2Activated = false;

	const { tree, nodes } = createTestTree({
		id: "container",
		children: [
			{
				id: "item1",
				handler: itemHandler(() => {
					item1Activated = true;
				}),
			},
			{
				id: "item2",
				handler: itemHandler(() => {
					item2Activated = true;
				}),
			},
		],
	});
	expect(tree.focus).toBe(nodes.item1.id);

	expect(item1Activated).toBe(false);
	expect(item2Activated).toBe(false);

	activateNode(tree, nodes.item2.id);
	expect(item1Activated).toBe(false);
	expect(item2Activated).toBe(true);
	expect(tree.focus).toBe(nodes.item2.id);

	focusNode(tree, nodes.item1.id);
	expect(tree.focus).toBe(nodes.item1.id);

	activateNode(tree, nodes.item1.id, { focus: false });
	expect(item1Activated).toBe(true);
	expect(item2Activated).toBe(true);
	expect(tree.focus).toBe(nodes.item1.id);
});

test("activateNode with longpress option", () => {
	let shortpressActivated = false;
	let longpressActivated = false;

	const { tree, nodes } = createTestTree({
		id: "container",
		handler: itemHandler(({ longpress }) => {
			if (longpress) {
				longpressActivated = true;
			} else {
				shortpressActivated = true;
			}
		}),
	});
	expect(tree.focus).toBe(nodes.container.id);

	expect(longpressActivated).toBe(false);
	expect(shortpressActivated).toBe(false);

	activateNode(tree, nodes.container.id);
	expect(shortpressActivated).toBe(true);
	expect(longpressActivated).toBe(false);

	activateNode(tree, nodes.container.id, { longpress: true });
	expect(shortpressActivated).toBe(true);
	expect(longpressActivated).toBe(true);
});
