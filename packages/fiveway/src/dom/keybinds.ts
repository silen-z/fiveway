import { type NavigationAction, type MoveAction, type ActivateAction } from "../action.ts";

/**
 * Keybinds function that maps keyboard events to navigation actions.
 *
 * As optimization when keybinds do not return action for shortpress,
 * default `registerKeyboardListener` does not listen for longpress.
 *
 * @see {@link defaultKeybinds} for default keybinds
 */
export type Keybinds = (e: Event, options?: { longpress?: boolean }) => NavigationAction | null;

/**
 * {@link Keybinds} function that maps set of default `keydown` keybinds to {@link NavigationAction}:
 *
 * Default keybinds:
 * - Arrow keys → {@link MoveAction}
 * - Enter / Space → {@link ActivateAction}
 * - Backspace → {@link MoveAction} with direction `"back"`
 */
export function defaultKeybinds(
	e: Event,
	options: { longpress?: boolean } = {},
): NavigationAction | null {
	const { longpress } = options;
	const key = getKey(e);
	if (key == null) {
		return null;
	}

	if (key === "Enter" || key === " ") {
		return { kind: "activate", longpress } satisfies ActivateAction;
	}

	if (key === "ArrowUp") {
		return { kind: "move", direction: "up", longpress } satisfies MoveAction;
	}

	if (key === "ArrowDown") {
		return { kind: "move", direction: "down", longpress } satisfies MoveAction;
	}

	if (key === "ArrowLeft") {
		return { kind: "move", direction: "left", longpress } satisfies MoveAction;
	}

	if (key === "ArrowRight") {
		return { kind: "move", direction: "right", longpress } satisfies MoveAction;
	}

	if (key === "Backspace") {
		return { kind: "move", direction: "back", longpress } satisfies MoveAction;
	}

	return null;
}

export function getKey(e: Event): string | null {
	if ("key" in e && typeof e.key === "string") {
		return e.key;
	}

	return null;
}
