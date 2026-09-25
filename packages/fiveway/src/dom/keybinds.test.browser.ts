import { describe, test, expect } from "vite-plus/test";

import { createTestTree } from "../_test/treeSpec.ts";
import { defaultKeybinds } from "../dom.ts";
import { verticalHandler } from "../handler/directional.ts";
import { dispatchAction } from "../tree/tree.ts";

describe("defaultKeybinds", () => {
	test("should map Enter/Space keydown events to activate action", () => {
		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "Enter" }))).toMatchObject({
			kind: "activate",
		});

		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: " " }))).toMatchObject({
			kind: "activate",
		});
	});

	test("should map directional keydown events to move actions", () => {
		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowUp" }))).toMatchObject({
			kind: "move",
			direction: "up",
		});

		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowDown" }))).toMatchObject({
			kind: "move",
			direction: "down",
		});

		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowLeft" }))).toMatchObject({
			kind: "move",
			direction: "left",
		});

		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowRight" }))).toMatchObject({
			kind: "move",
			direction: "right",
		});

		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "Backspace" }))).toMatchObject({
			kind: "move",
			direction: "back",
		});
	});

	test("should return null for other keys", () => {
		expect(defaultKeybinds(new KeyboardEvent("keydown", { key: "A" }))).toBeNull();
	});

	test("should return null for non-keyboard events", () => {
		expect(defaultKeybinds(new MouseEvent("click"))).toBeNull();
	});

	test("should record longpress", () => {
		expect(
			defaultKeybinds(new KeyboardEvent("keydown", { key: "Enter" }), { longpress: true }),
		).toMatchObject({
			kind: "activate",
			longpress: true,
		});

		expect(
			defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowDown" }), { longpress: true }),
		).toMatchObject({
			kind: "move",
			direction: "down",
			longpress: true,
		});
	});

	test("should return action that can be dispatched", () => {
		const { tree, nodes } = createTestTree({
			id: "container",
			handler: verticalHandler,
			children: [{ id: "item1" }, { id: "item2" }],
		});

		const action = defaultKeybinds(new KeyboardEvent("keydown", { key: "ArrowDown" }));

		expect(action).not.toBeNull();
		dispatchAction(tree, action!);
		expect(tree.focus).toBe(nodes.item2.id);
	});
});
