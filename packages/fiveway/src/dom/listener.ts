import { type LongPressOptions, longPressHandler } from "../handler/longpress.ts";
import { dispatchAction, type NavigationTree } from "../tree/tree.ts";
import { type Keybinds, getKey } from "./keybinds.ts";

const DEFAULT_LONG_PRESS_THRESHOLD = 500;

type PendingPress = {
	event: KeyboardEvent;
	timer: number;
};

export function registerKeyboardListener(
	tree: NavigationTree,
	target: EventTarget,
	keybinds: Keybinds,
): () => void {
	const dispatch = (e: Event, longpress?: boolean) => {
		const action = keybinds(e, { longpress });
		if (action == null) {
			return;
		}

		e.preventDefault();
		dispatchAction(tree, action);
	};

	let pending: PendingPress | null = null;

	const startPending = (options: LongPressOptions, event: KeyboardEvent) => {
		clearPending();

		const timer = window.setTimeout(() => {
			if (pending == null) {
				return;
			}

			dispatch(pending.event, true);
			clearPending();
		}, options.threshold ?? DEFAULT_LONG_PRESS_THRESHOLD);

		pending = { timer, event };
	};

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

		const longPress = longPressHandler.query(tree, tree.focus);
		if (longPress == null || longPress.enabled === false) {
			dispatch(e);
			return;
		}

		e.preventDefault();

		if ("repeat" in e && e.repeat === true) {
			return;
		}

		if (pending != null) {
			dispatch(pending.event, false);
		}

		startPending(longPress, e as KeyboardEvent);
	};

	const onKeyUp = (e: Event) => {
		if (pending == null) {
			return;
		}

		const key = getKey(e);
		if (key == null || pending.event.key !== key) {
			return;
		}

		dispatch(pending.event, false);
		clearPending();
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
