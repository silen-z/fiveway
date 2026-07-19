import { describe, test, expect, onTestFinished, vi } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { type NavigationAction } from "../action.ts";
import { activationHandler, type ActivateCallback } from "../handler/activate.ts";
import { verticalHandler } from "../handler/directional.ts";
import { defaultHandler, type NavigationHandler } from "../handler/handler.ts";
import { longPressHandler } from "../handler/longpress.ts";
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
		const onAction = vi.fn<(action: NavigationAction) => void>();
		const trackingHandler: NavigationHandler = (action, { next }) => {
			onAction(action);
			return next();
		};

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: verticalHandler,
			children: [{ id: "item1", handler: [trackingHandler, defaultHandler] }, { id: "item2" }],
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
		expect(onAction).toHaveBeenLastCalledWith({ kind: "move", direction: "down" });
		expect(tree.focus).toBe(nodes.item2.id);
	});

	test("should handle longpress", () => {
		vi.useFakeTimers();

		const onActivate = vi.fn<ActivateCallback>();

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: [activationHandler(onActivate), longPressHandler(), defaultHandler],
		});
		expect(tree.focus).toBe(nodes.container.id);

		using _ = defaultKeyboardListener(tree);

		expect(onActivate).not.toHaveBeenCalledWith();

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		vi.advanceTimersByTime(100);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

		expect(onActivate).toHaveBeenLastCalledWith({ longpress: false });

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		vi.advanceTimersByTime(1000);

		expect(onActivate).toHaveBeenLastCalledWith({ longpress: true });
	});

	test("should dispatch shortpress when longpress is interrupted by another keydown event", () => {
		const onActivate = vi.fn<ActivateCallback>();

		const { tree, nodes } = createTestTree({
			id: "container",
			handler: [activationHandler(onActivate), longPressHandler(), defaultHandler],
		});
		expect(tree.focus).toBe(nodes.container.id);

		using _ = defaultKeyboardListener(tree);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		expect(onActivate).not.toHaveBeenCalled();

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
		expect(onActivate).toHaveBeenCalledWith({ longpress: false });
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
				longPressHandler(),
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
				longPressHandler(),
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

	test("should respect disabled long press", async () => {
		vi.useFakeTimers();

		const onActivate = vi.fn<ActivateCallback>();

		const longPressOptions = { enabled: true };

		const { tree } = createTestTree({
			id: "disabled",
			handler: [activationHandler(onActivate), longPressHandler(longPressOptions), defaultHandler],
		});

		using _ = defaultKeyboardListener(tree);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		vi.advanceTimersByTime(1000);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

		expect(onActivate).toHaveBeenLastCalledWith({ longpress: true });

		longPressOptions.enabled = false;

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		vi.advanceTimersByTime(1000);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));

		expect(onActivate).not.toHaveBeenLastCalledWith({ longpress: true });
	});

	test("should respect conditional long press", async () => {
		vi.useFakeTimers();

		const onAction = vi.fn<(action: NavigationAction) => void>();

		const { tree } = createTestTree({
			id: "disabled",
			handler: [
				(action, { next }) => {
					onAction(action);
					return next();
				},
				longPressHandler({
					enabled: (action) => action.kind === "move" && action.direction === "down",
				}),
				defaultHandler,
			],
		});

		using _ = defaultKeyboardListener(tree);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
		expect(onAction).toHaveBeenCalled();
		vi.advanceTimersByTime(1000);
		window.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown" }));

		expect(onAction).toHaveBeenLastCalledWith({
			kind: "move",
			direction: "down",
			longpress: true,
		});

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));

		expect(onAction).toHaveBeenLastCalledWith({
			kind: "move",
			direction: "up",
			longpress: undefined,
		});
	});
});

function defaultKeyboardListener(tree: NavigationTree) {
	const cleanupListener = registerKeyboardListener(tree, window, defaultKeybinds);

	return { [Symbol.dispose]: cleanupListener };
}
