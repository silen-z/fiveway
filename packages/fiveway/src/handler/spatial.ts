import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { traverseNodes } from "../tree/tree.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type NavigationHandler } from "./handler.ts";
import { parentHandler } from "./handler.ts";
import { type DataHandler, createDataHandler } from "./metadata.ts";

export interface SpatialItem {
	x: number;
	y: number;
}

/**
 * Stores layout bounds per node (query key `spatialItem`).
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#spatial-handler}
 * @see {@link DataHandler}
 */
export const spatialItemHandler: DataHandler<SpatialItem> = createDataHandler("spatialItem");

/**
 * Spatial movement handler used by `spatialHandler`.
 *
 * Combines spatial movement with defaults for arrow-key style navigation using rects.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#spatial-handler}
 * @see {@link NavigationHandler}
 */
export const spatialMovementHandler: NavigationHandler = (node, action, next) => {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "spatial" });
	}

	if (action.kind !== "move") {
		return next();
	}

	const direction = action.direction;

	if (direction === "forwards" || direction === "backwards" || direction === "back") {
		return next();
	}

	const focusedPos = spatialItemHandler.query(node.tree, node.tree.focus);
	if (focusedPos == null) {
		return next();
	}

	let closestId: NodeId | null = null;
	let shortestDistance: number | null = null;

	traverseNodes(node.tree, node.id, 1, (id) => {
		const pos = spatialItemHandler.query(node.tree, id);
		if (pos === null) {
			return;
		}

		const distance = distanceSquared(focusedPos, pos, direction);
		if (
			distance !== null &&
			(shortestDistance === null || distance < shortestDistance) &&
			next(id, { kind: "focus", direction: null }) !== null
		) {
			closestId = id;
			shortestDistance = distance;
		}
	});

	return closestId ?? next();
};

/**
 * Combines spatial movement with defaults for arrow-key style navigation using rects.
 *
 * @see {@link https://fiveway.dev/guide/built-in-handlers#spatial-handler}
 * @see {@link ComposedHandler}
 */
export const spatialHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false }),
	spatialMovementHandler,
	parentHandler,
]);

/** Unit vectors from candidate toward focused, per move direction. */
const directionVector: Record<"up" | "down" | "left" | "right", readonly [number, number]> = {
	left: [1, 0],
	right: [-1, 0],
	up: [0, 1],
	down: [0, -1],
};

function distanceSquared(
	a: SpatialItem,
	b: SpatialItem,
	direction: "up" | "down" | "left" | "right",
) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;

	const [sx, sy] = directionVector[direction];
	if (dx * sx + dy * sy <= 0) {
		return null;
	}

	return dx * dx + dy * dy;
}
