import { longPressHandler } from "../handler/longpress.ts";
import { dispatchAction, type NavigationTree } from "../tree/tree.ts";
import { type Keybinds, getKey } from "./keybinds.ts";

const DEFAULT_LONG_PRESS_THRESHOLD = 500;

type PendingPress = {
	event: KeyboardEvent;
	timer: number;
};

/**
 * Registers a keyboard listener for a given target and keybinds.
 *
 * This handler handles long presses for nodes with {@link longPressHandler}.
 *
 * @param tree - The navigation tree.
 * @param target - The target to register the listener on.
 * @param keybinds - The keybinds to use.
 *
 * @returns A function to unregister the listener.
 *
 * @see {@link Keybinds}
 */
export function registerKeyboardListener(
	tree: NavigationTree,
	target: EventTarget,
	keybinds: Keybinds,
): () => void {
	const dispatchPending = (longpress?: boolean) => {
		if (pending == null) {
			return;
		}

		const action = keybinds(pending.event, { longpress });
		if (action == null) {
			return;
		}

		dispatchAction(tree, action);
		clearPending();
	};

	let pending: PendingPress | null = null;

	const clearPending = () => {
		if (pending == null) {
			return;
		}

		window.clearTimeout(pending.timer);
		pending = null;
	};

	const onKeyDown = (e: Event) => {
		const key = getKey(e);
		if (key == null) {
			return;
		}

		// check if any action for this event can be dispatched
		const action = keybinds(e);
		if (action == null) {
			return;
		}

		e.preventDefault();

		const longPress = longPressHandler.query(tree, tree.focus);
		if (longPress == null || longPress.enabled === false) {
			dispatchAction(tree, action);
			return;
		}

		if ("repeat" in e && e.repeat === true) {
			return;
		}

		if (pending != null) {
			dispatchPending(false);
		}

		const timer = window.setTimeout(() => {
			dispatchPending(true);
		}, longPress.threshold ?? DEFAULT_LONG_PRESS_THRESHOLD);

		pending = { timer, event: e as KeyboardEvent };
	};

	const onKeyUp = (e: Event) => {
		if (pending == null) {
			return;
		}

		const key = getKey(e);
		if (key == null || pending.event.key !== key) {
			return;
		}

		e.preventDefault();
		dispatchPending(false);
	};

	const onCancel = () => {
		clearPending();
	};

	target.addEventListener("keydown", onKeyDown);
	target.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", onCancel);
	window.addEventListener("visibilitychange", onCancel);

	return () => {
		clearPending();
		target.removeEventListener("keydown", onKeyDown);
		target.removeEventListener("keyup", onKeyUp);
		window.removeEventListener("blur", onCancel);
		window.removeEventListener("visibilitychange", onCancel);
	};
}
