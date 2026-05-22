import { type NavigationAction } from "../action.ts";

export type Keybinds = (e: Event, options: { longpress?: boolean }) => NavigationAction | null;

/**
 * Default keybinds for `keydown`-like events:
 *
 * - Arrow keys → `move`
 * - Enter / Space → `select`
 * - Backspace → `move` with direction `"back"`
 *
 * When `longpress` is passed, it is set on `move` and `select` actions.
 * Omit it for immediate dispatch (no `longpress` field).
 *
 * Returns `null` when unmapped.
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
		return { kind: "select", longpress };
	}

	if (key === "ArrowUp") {
		return { kind: "move", direction: "up", longpress };
	}

	if (key === "ArrowDown") {
		return { kind: "move", direction: "down", longpress };
	}

	if (key === "ArrowLeft") {
		return { kind: "move", direction: "left", longpress };
	}

	if (key === "ArrowRight") {
		return { kind: "move", direction: "right", longpress };
	}

	if (key === "Backspace") {
		return { kind: "move", direction: "back", longpress };
	}

	return null;
}

export function getKey(e: Event): string | null {
	if ("key" in e && typeof e.key === "string") {
		return e.key;
	}

	return null;
}
