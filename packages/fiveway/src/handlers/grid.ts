import { type NodeId, directChildId } from "../id.js";
import { traverseNodes } from "../tree.js";
import type { NavigationHandler, NavigationDirection } from "../navigation.js";
import { parentHandler } from "./default.js";
import { focusHandler } from "./focus.js";
import { type Metadata, defineMetadata } from "../metadata.js";
import { type ChainedHandler, chainedHandler } from "./chained.js";
import { describeHandler } from "../introspection.js";

export type GridItem = {
  row: number;
  col: number;
};

export const GridItem: Metadata<GridItem> = defineMetadata("core:grid-item");

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

type GridHandlerConfig = {
  distance?: DistanceFunction;
};

/**
 * @category Handler
 */
function createGridMovement(config: GridHandlerConfig = {}) {
  const gridMovement: NavigationHandler = (node, action, next) => {
    if (import.meta.env.DEV) {
      describeHandler(action, { name: "core:grid" });
    }

    if (action.kind !== "move" || action.direction === "back") {
      return next();
    }

    const focusedId = directChildId(node.id, node.tree.focusedId);
    if (focusedId === null) {
      return next();
    }

    const focusedPos = GridItem.query(node.tree, focusedId);
    if (focusedPos == null) {
      return next();
    }

    const getDistance =
      config.distance != null
        ? config.distance(action.direction)
        : defaultDistance(action.direction);

    let closestId: NodeId | null = null;
    let shortestDistance: number | null = null;

    traverseNodes(node.tree, node.id, 1, (id) => {
      const pos = GridItem.query(node.tree, id);
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

/**
 * @category Handler
 */
export { createGridMovement as gridMovement };

export const gridHandler = (config: GridHandlerConfig = {}): ChainedHandler =>
  chainedHandler([
    focusHandler({ skipEmpty: true }),
    createGridMovement(config),
    parentHandler,
  ]);

export const gridItemHandler = GridItem.providerHandler;
