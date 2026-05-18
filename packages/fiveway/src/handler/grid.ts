import { type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, childLocalId } from "../tree/id.ts";
import { traverseNodes } from "../tree/tree.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type NavigationHandler, parentHandler } from "./handler.ts";
import { type DataHandler, createDataHandler } from "./metadata.ts";

export type GridItem = {
	row: number;
	col: number;
};

/**
 * Associates each item with grid coordinates (query key `gridItem`).
 */
export const gridItemHandler: DataHandler<GridItem> = createDataHandler("gridItem");

/**
 * Lower-level movement handler used inside `gridHandler`; picks the nearest cell using
 * `gridItemHandler` positions.
 */
function createGridMovement(options: GridHandlerOptions = {}): NavigationHandler {
	const gridMovementHandler: NavigationHandler = (node, action, next) => {
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

		const getDistance = options.distance ?? defaultDistance;

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
	};

	return gridMovementHandler;
}

export { createGridMovement as gridMovementHandler };

export type GridDistanceFunction = (
	a: GridItem,
	b: GridItem,
	direction: NavigationDirection,
) => number | null;

export type GridHandlerOptions = {
	distance?: GridDistanceFunction;
};

/**
 * Composes `focusHandler({ focusWhenEmpty: false })`, `gridMovement` (with optional
 * `distance`), and `parentHandler`.
 *
 * Optional `distance` overrides how the nearest cell is chosen for each arrow direction;
 * defaults use row/column heuristics.
 */
const createGridHandler = (options: GridHandlerOptions = {}): ComposedHandler =>
	composeHandlers([
		focusHandler({ focusWhenEmpty: false }),
		createGridMovement(options),
		parentHandler,
	]);

export type GridHandler = ComposedHandler & {
	withOptions: (options: GridHandlerOptions) => ComposedHandler;
};

const gridHandler = createGridHandler() as GridHandler;
gridHandler.withOptions = createGridHandler;

export { gridHandler };

function defaultDistance(a: GridItem, b: GridItem, direction: NavigationDirection) {
	switch (direction) {
		case "up":
			return defaultDistanceUp(a, b);

		case "down":
			return defaultDistanceDown(a, b);

		case "left":
			return defaultDistanceLeft(a, b);

		case "right":
			return defaultDistanceRight(a, b);
	}
}

function defaultDistanceDown(current: GridItem, potential: GridItem) {
	const rowDistance = potential.row - current.row;
	if (rowDistance <= 0) {
		return null;
	}

	let colDistance = potential.col - current.col;
	if (colDistance < 0) {
		colDistance += 0.5;
	}

	return rowDistance + Math.abs(colDistance);
}

function defaultDistanceUp(current: GridItem, potential: GridItem) {
	const rowDistance = current.row - potential.row;
	if (rowDistance <= 0) {
		return null;
	}

	let colDistance = current.col - potential.col;
	if (colDistance < 0) {
		colDistance += 0.5;
	}

	return rowDistance + Math.abs(colDistance);
}

function defaultDistanceLeft(current: GridItem, potential: GridItem) {
	const colDistance = current.col - potential.col;
	if (colDistance <= 0) {
		return null;
	}

	let rowDistance = potential.row - current.row;
	if (rowDistance < 0) {
		rowDistance += 0.5;
	}

	return colDistance + Math.abs(rowDistance);
}

function defaultDistanceRight(current: GridItem, potential: GridItem) {
	const colDistance = potential.col - current.col;
	if (colDistance <= 0) {
		return null;
	}

	let rowDistance = current.row - potential.row;
	if (rowDistance < 0) {
		rowDistance += 0.5;
	}

	return colDistance + Math.abs(rowDistance);
}
