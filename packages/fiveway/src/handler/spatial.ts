import { type NavigationDirection } from "../action.ts";
import { describeHandler } from "../inspector.ts";
import { type NodeId } from "../tree/id.ts";
import { traverseNodes } from "../tree/tree.ts";
import { type ChainedHandler, chainedHandler } from "./chained.ts";
import { focusHandler } from "./focus.ts";
import { type NavigationHandler } from "./handler.ts";
import { parentHandler } from "./handler.ts";
import { type MetaHandler, metaHandler } from "./metadata.ts";

export const spatialItemHandler: MetaHandler<DOMRect> = metaHandler("core:node-position");

export const spatialMovement: NavigationHandler = (node, action, next) => {
  if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
    describeHandler(action, { name: "core:spatial" });
  }

  if (action.kind !== "move" || action.direction === "back") {
    return next();
  }

  const focusedPos = spatialItemHandler.query(node.tree, node.tree.focus);
  if (focusedPos == null) {
    return next();
  }

  const isCorrectDirection = directionFilters[action.direction];

  let closestId: NodeId | null = null;
  let shortestDistance: number | null = null;

  traverseNodes(node.tree, node.id, 1, (id) => {
    const pos = spatialItemHandler.query(node.tree, id);
    if (pos === null) {
      return;
    }

    if (!isCorrectDirection(focusedPos, pos)) {
      return;
    }

    const distance = distanceSquared(focusedPos, pos);
    if (
      (shortestDistance === null || distance < shortestDistance) &&
      next(id, { kind: "focus", direction: null }) !== null
    ) {
      closestId = id;
      shortestDistance = distance;
    }
  });

  return closestId ?? next();
};

export const spatialHandler: ChainedHandler = chainedHandler([
  focusHandler({ skipEmpty: true }),
  spatialMovement,
  parentHandler,
]);

type DirectionFilter = (current: DOMRect, potential: DOMRect) => boolean;

const directionFilters: Record<NavigationDirection, DirectionFilter> = {
  up: (current, potential) => Math.floor(potential.bottom) <= Math.ceil(current.top),
  down: (current, potential) => Math.ceil(potential.top) >= Math.floor(current.bottom),
  left: (current, potential) => Math.floor(potential.right) <= Math.ceil(current.left),
  right: (current, potential) => Math.ceil(potential.left) >= Math.floor(current.right),
};

function distanceSquared(a: DOMRect, b: DOMRect) {
  const ax = a.left + a.width * 0.5;
  const ay = a.top + a.height * 0.5;

  const bx = b.left + b.width * 0.5;
  const by = b.top + b.height * 0.5;

  const dx = ax - bx;
  const dy = ay - by;

  return dx * dx + dy * dy;
}
