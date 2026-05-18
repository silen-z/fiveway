import { type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { traverseNodes } from "../tree/tree.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type NavigationHandler } from "./handler.ts";
import { parentHandler } from "./handler.ts";
import { type DataHandler, createDataHandler } from "./metadata.ts";

export type SpatialItem = {
	x: number;
	y: number;
};

/**
 * Stores layout bounds per node (query key `spatialItem`).
 */
export const spatialItemHandler: DataHandler<SpatialItem> = createDataHandler("spatialItem");

/**
 * Spatial movement handler used by `spatialHandler`.
 *
 * Combines spatial movement with defaults for arrow-key style navigation using rects.
 */
export const spatialMovementHandler: NavigationHandler = (node, action, next) => {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "spatial" });
	}

	if (action.kind !== "move" || action.direction === "back") {
		return next();
	}

	const focusedPos = spatialItemHandler.query(node.tree, node.tree.focus);
	if (focusedPos == null) {
		return next();
	}

	let closestId: NodeId | null = null;
	let shortestDistance: number | null = null;

	const direction = action.direction;

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
 */
export const spatialHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false }),
	spatialMovementHandler,
	parentHandler,
]);

/** Unit vectors from candidate toward focused, per move direction. */
const directionVector: Record<NavigationDirection, readonly [number, number]> = {
	left: [1, 0],
	right: [-1, 0],
	up: [0, 1],
	down: [0, -1],
};

function distanceSquared(a: SpatialItem, b: SpatialItem, direction: NavigationDirection) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;

	const [sx, sy] = directionVector[direction];
	if (dx * sx + dy * sy <= 0) {
		return null;
	}

	return dx * dx + dy * dy;
}
