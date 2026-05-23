import { type NavigationAction, type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, childLocalId } from "../tree/id.ts";
import { type NavigationNode } from "../tree/node.ts";
import { traverseNodes } from "../tree/tree.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type HandlerNext, parentHandler } from "./handler.ts";
import { type DataHandler, createDataHandler } from "./metadata.ts";

export interface GridItem {
	row: number;
	col: number;
}

/**
 * Associates each item with grid coordinates (query key `gridItem`).
 */
export const gridItemHandler: DataHandler<GridItem> = createDataHandler("gridItem");

/**
 * Grid movement handler used by `gridHandler`.
 *
 * Picks the nearest cell using {@link defaultDistance} and `gridItemHandler` positions.
 */
export function gridMovementHandler(
	node: NavigationNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null {
	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		describeHandler(action, { name: "grid" });
	}

	if (action.kind !== "move" || action.direction === "back") {
		return next();
	}

	const direction = action.direction;

	const focusedId = childLocalId(node.id, node.tree.focus);
	if (focusedId === null) {
		return next();
	}

	const focusedPos = gridItemHandler.query(node.tree, focusedId);
	if (focusedPos == null) {
		return next();
	}

	// const focusDirection = direction === "forwards" || direction === "backwards" ? direction : null;

	let closestId: NodeId | null = null;
	let shortestDistance: number | null = null;

	traverseNodes(node.tree, node.id, 1, (id) => {
		const pos = gridItemHandler.query(node.tree, id);
		if (pos === null) {
			return;
		}

		const distance = getDistance(focusedPos, pos, direction);
		if (distance === null) {
			return;
		}

		if (
			(shortestDistance === null || distance < shortestDistance) &&
			next(id, { kind: "focus", direction: null }) !== null
		) {
			closestId = id;
			shortestDistance = distance;
		}
	});

	if (closestId != null) {
		return next(closestId, { kind: "focus", direction });
	}

	return next();
}

/**
 * Combines grid movement with defaults for arrow-key and reading-order navigation.
 */
export const gridHandler: ComposedHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false }),
	gridMovementHandler,
	parentHandler,
]);

/**
 * Vectors from candidate toward current in (col, row) space — same convention as
 * {@link spatial.ts} spatial navigation (x = col, y = row).
 */
const directionVector: Record<NavigationDirection, readonly [number, number] | []> = {
	forwards: [],
	backwards: [],
	left: [1, 0],
	right: [-1, 0],
	up: [0, 1],
	down: [0, -1],
};

/**
 * Default distance between grid cells for a move direction; lower is closer.
 *
 * Arrow directions use primary-axis distance plus penalized misalignment on the other axis.
 * `forwards` / `backwards` use reading-order distance (right then next row, or the reverse).
 */
function getDistance(
	current: GridItem,
	potential: GridItem,
	direction: NavigationDirection,
): number | null {
	if (direction === "forwards") {
		return forwardsDistance(current, potential);
	}

	if (direction === "backwards") {
		return backwardsDistance(current, potential);
	}

	const [sx, sy] = directionVector[direction];
	if (sx == null || sy == null) {
		return null;
	}

	const dCol = current.col - potential.col;
	const dRow = current.row - potential.row;
	const primaryDistance = dCol * sx + dRow * sy;
	if (primaryDistance <= 0) {
		return null;
	}

	const secondaryDelta =
		sx === 0 ? (potential.col - current.col) * -sy : (current.row - potential.row) * -sx;

	const secondaryDistance = secondaryDelta < 0 ? secondaryDelta + 0.5 : secondaryDelta;

	return primaryDistance + Math.abs(secondaryDistance);
}

/**
 * Separates row tiers in {@link forwardsDistance} / {@link backwardsDistance} so any
 * same-row candidate beats any candidate in a later/previous row.
 */
const ROW_STRIDE = 1_000_000;

/** Reading order: nearest column to the right, else first cell in the next row. */
function forwardsDistance(current: GridItem, potential: GridItem): number | null {
	const dRow = potential.row - current.row;
	const dCol = potential.col - current.col;
	if (dRow < 0 || (dRow === 0 && dCol <= 0)) {
		return null;
	}

	if (dRow === 0) {
		return dCol;
	}

	return dRow * ROW_STRIDE + dCol;
}

/** Reading order reversed: nearest column to the left, else last cell in the previous row. */
function backwardsDistance(current: GridItem, potential: GridItem): number | null {
	const dRow = current.row - potential.row;
	const dCol = current.col - potential.col;
	if (dRow < 0 || (dRow === 0 && dCol <= 0)) {
		return null;
	}

	if (dRow === 0) {
		return dCol;
	}

	return dRow * ROW_STRIDE + (ROW_STRIDE - potential.col);
}
