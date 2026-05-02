import { type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId, childLocalId } from "../tree/id.ts";
import { traverseNodes } from "../tree/tree.ts";
import { type ComposedHandler, composeHandlers } from "./composed.ts";
import { focusHandler } from "./focus.ts";
import { type NavigationHandler, parentHandler } from "./handler.ts";
import { type DataHandler, dataHandler } from "./metadata.ts";

export type GridItem = {
	row: number;
	col: number;
};

export const gridItemHandler: DataHandler<GridItem> = dataHandler("gridItem");

const defaultDistanceDown = (current: GridItem, potential: GridItem) => {
	const rowDistance = potential.row - current.row;
	if (rowDistance <= 0) {
		return null;
	}

	let colDistance = potential.col - current.col;
	if (colDistance < 0) {
		colDistance += 0.5;
	}

	return rowDistance + Math.abs(colDistance);
};

const defaultDistanceUp = (current: GridItem, potential: GridItem) => {
	const rowDistance = current.row - potential.row;
	if (rowDistance <= 0) {
		return null;
	}

	let colDistance = current.col - potential.col;
	if (colDistance < 0) {
		colDistance += 0.5;
	}

	return rowDistance + Math.abs(colDistance);
};

const defaultDistanceLeft = (current: GridItem, potential: GridItem) => {
	const colDistance = current.col - potential.col;
	if (colDistance <= 0) {
		return null;
	}

	let rowDistance = potential.row - current.row;
	if (rowDistance < 0) {
		rowDistance += 0.5;
	}

	return colDistance + Math.abs(rowDistance);
};

const defaultDistanceRight = (current: GridItem, potential: GridItem) => {
	const colDistance = potential.col - current.col;
	if (colDistance <= 0) {
		return null;
	}

	let rowDistance = current.row - potential.row;
	if (rowDistance < 0) {
		rowDistance += 0.5;
	}

	return colDistance + Math.abs(rowDistance);
};

const defaultDistance: DistanceFunction = (direction: NavigationDirection) => {
	switch (direction) {
		case "up":
			return defaultDistanceUp;

		case "down":
			return defaultDistanceDown;

		case "left":
			return defaultDistanceLeft;

		case "right":
			return defaultDistanceRight;
	}
};

type DistanceFunction = (
	direction: NavigationDirection,
) => (a: GridItem, b: GridItem) => number | null;

type GridHandlerOptions = {
	distance?: DistanceFunction;
};

function createGridMovement(options: GridHandlerOptions = {}): NavigationHandler {
	const gridMovement: NavigationHandler = (node, action, next) => {
		if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
			describeHandler(action, { name: "core:grid" });
		}

		if (action.kind !== "move" || action.direction === "back") {
			return next();
		}

		const focusedId = childLocalId(node.id, node.tree.focus);
		if (focusedId === null) {
			return next();
		}

		const focusedPos = gridItemHandler.query(node.tree, focusedId);
		if (focusedPos == null) {
			return next();
		}

		const getDistance =
			options.distance != null
				? options.distance(action.direction)
				: defaultDistance(action.direction);

		let closestId: NodeId | null = null;
		let shortestDistance: number | null = null;

		traverseNodes(node.tree, node.id, 1, (id) => {
			const pos = gridItemHandler.query(node.tree, id);
			if (pos === null) {
				return;
			}

			const distance = getDistance(focusedPos, pos);
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
			return next(closestId, { kind: "focus", direction: action.direction });
		}

		return next();
	};

	return gridMovement;
}

export { createGridMovement as gridMovement };

export const gridHandler = (options: GridHandlerOptions = {}): ComposedHandler =>
	composeHandlers([
		focusHandler({ focusWhenEmpty: false }),
		createGridMovement(options),
		parentHandler,
	]);
