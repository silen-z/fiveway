import { makeHandler } from "../handlers.js";
import { getNode, selectNode } from "../tree.js";
import { focusHandler } from "./focus.js";

export const parentHandler = makeHandler((node, action, context, next) => {
  if (node.parent !== null) {
    const parentNode = getNode(node.tree, node.parent);

    context.path.push(node.id);
    return parentNode.handler(parentNode, action, context);
  }

  return next?.() ?? null;
});

export const selectHandler = makeHandler((node, action, _, next) => {
  if (action.kind === "select") {
    selectNode(node.tree, node.id, true);
    return null;
  }

  return next?.() ?? null;
});

export const rootHandler =  focusHandler();

export const itemHandler = focusHandler()
  .chain(selectHandler)
  .chain(parentHandler);

export const containerHandler = focusHandler().chain(parentHandler);
