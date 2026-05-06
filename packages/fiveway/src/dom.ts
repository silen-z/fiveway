import { type NavigationAction } from "./action.ts";
import { dataHandler, type DataHandler } from "./handler/metadata.ts";

const eventKeyToAction: Record<string, NavigationAction> = {
	ArrowUp: { kind: "move", direction: "up" },
	ArrowDown: { kind: "move", direction: "down" },
	ArrowLeft: { kind: "move", direction: "left" },
	ArrowRight: { kind: "move", direction: "right" },
	Enter: { kind: "select" },
	" ": { kind: "select" },
	Backspace: { kind: "move", direction: "back" },
};

/**
 * Maps `keydown`-like events to default actions:
 *
 * - Arrow keys → `move`
 * - Enter / Space → `select`
 * - Backspace → `move` with direction `"back"`
 *
 * Returns `null` when unmapped.
 */
export function defaultEventMapping(e: Event): NavigationAction | null {
	if ("key" in e && typeof e.key === "string") {
		return eventKeyToAction[e.key] ?? null;
	}

	return null;
}

/**
 * Metadata handler (`core:node-element`) that ties a node to a focusable DOM element
 * (getter or value).
 *
 * Exposes `.query(tree, id)` to resolve the element for focus sync.
 */
export const elementHandler: DataHandler<HTMLElement> = dataHandler("core:node-element");
