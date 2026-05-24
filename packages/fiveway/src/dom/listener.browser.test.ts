import { describe, test, expect, onTestFinished, vi } from "vite-plus/test";

import { activationHandler } from "../handler/activate.ts";
import { verticalHandler } from "../handler/directional.ts";
import { defaultHandler } from "../handler/handler.ts";
import { longPressHandler } from "../handler/longpress.ts";
import { createTestTree } from "../test/treeSpec.ts";
import { type NavigationTree } from "../tree/tree.ts";
import { defaultKeybinds } from "./keybinds.ts";
import { registerKeyboardListener } from "./listener.ts";

describe("registerKeyboardListener", () => {
	test("should listen to keydown events on window and dispatch actions", () => {
		const { tree, nodes } = createTestTree({
			id: "container",
			handler: verticalHandler,
			children: [{ id: "item1" }, { id: "item2" }],
		});

		expect(tree.focus).toBe(nodes.item1.id);

		const cleanup = registerKeyboardListener(tree, window, defaultKeybinds);
		onTestFinished(() => cleanup());

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
		expect(tree.focus).toBe(nodes.item2.id);
	});

	test("should call event.preventDefault() when event is mapped to action", () => {
		const { tree, nodes } = createTestTree({
			id: "container",
			handler: verticalHandler,
			children: [{ id: "item1" }, { id: "item2" }],
		});

		expect(tree.focus).toBe(nodes.item1.id);

		using _ = defaultKeyboardListener(tree);

		const pressAEvent = new KeyboardEvent("keydown", { key: "A", cancelable: true });
		window.dispatchEvent(pressAEvent);
		expect(pressAEvent.defaultPrevented).toBe(false);
		expect(tree.focus).toBe(nodes.item1.id);

		const pressArrowDownEvent = new KeyboardEvent("keydown", {
			key: "ArrowDown",
			cancelable: true,
		});
		window.dispatchEvent(pressArrowDownEvent);
		expect(pressArrowDownEvent.defaultPrevented).toBe(true);
		expect(tree.focus).toBe(nodes.item2.id);
	});

	test("should handle longpress", () => {
		vi.useFakeTimers();

		let pressedShortPress = false;
		let pressedLongPress = false;

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: [
				activationHandler(({ longpress }) => {
					if (longpress) {
						pressedLongPress = true;
					} else {
						pressedShortPress = true;
					}
				}),
				longPressHandler({}),
				defaultHandler,
			],
		});
		expect(tree.focus).toBe(nodes.container.id);

		using _ = defaultKeyboardListener(tree);

		expect(pressedShortPress).toBe(false);
		expect(pressedLongPress).toBe(false);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		vi.advanceTimersByTime(100);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

		expect(pressedShortPress).toBe(true);
		expect(pressedLongPress).toBe(false);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		vi.advanceTimersByTime(1000);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

		expect(pressedShortPress).toBe(true);
		expect(pressedLongPress).toBe(true);
	});

	test("should dispatch shortpress when longpress is interrupted by another keydown event", () => {
		let pressedShortPress = false;

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: [
				activationHandler(({ longpress }) => {
					if (!longpress) {
						pressedShortPress = true;
					}
				}),
				longPressHandler({}),
				defaultHandler,
			],
		});
		expect(tree.focus).toBe(nodes.container.id);

		using _ = defaultKeyboardListener(tree);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		expect(pressedShortPress).toBe(false);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
		expect(pressedShortPress).toBe(true);
	});

	test("should ignore repeat events when longpress is in progress", () => {
		vi.useFakeTimers();

		let pressedLongPress = false;

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: [
				activationHandler(({ longpress }) => {
					if (longpress) {
						pressedLongPress = true;
					}
				}),
				longPressHandler({}),
				defaultHandler,
			],
		});
		expect(tree.focus).toBe(nodes.container.id);

		using _ = defaultKeyboardListener(tree);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		expect(pressedLongPress).toBe(false);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", repeat: true }));
		expect(pressedLongPress).toBe(false);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", repeat: true }));
		expect(pressedLongPress).toBe(false);

		vi.advanceTimersByTime(1000);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
		expect(pressedLongPress).toBe(true);
	});

	test("should ignore keyup of keys that are not pending", () => {
		vi.useFakeTimers();

		let pressedLongPress = false;

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: [
				activationHandler(({ longpress }) => {
					if (longpress) {
						pressedLongPress = true;
					}
				}),
				longPressHandler({}),
				defaultHandler,
			],
		});
		expect(tree.focus).toBe(nodes.container.id);

		using _ = defaultKeyboardListener(tree);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown" }));
		expect(pressedLongPress).toBe(false);

		vi.advanceTimersByTime(1000);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
		expect(pressedLongPress).toBe(true);
	});
});

function defaultKeyboardListener(tree: NavigationTree) {
	const cleanupListener = registerKeyboardListener(tree, window, defaultKeybinds);

	return {
		[Symbol.dispose]: () => {
			cleanupListener();
		},
	};
}
