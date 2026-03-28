declare global {
  interface ImportMeta {
    env: { DEV?: boolean };
  }
}

export {
  type NavigationTree,
  type FocusOptions,
  createNavigationTree,
  insertNode,
  removeNode,
  holdFocus,
  focusNode,
  isFocused,
  traverseNodes,
  handleAction,
} from "./tree/tree.ts";
export {
  type CreatedNavtreeNode,
  type NavtreeNode,
  type NodeChild,
  type NodeConfig,
  type ContainerConfig,
  createNode,
  updateNode,
} from "./tree/node.ts";
export {
  type NodeId,
  createGlobalId,
  scopedId,
  isParent,
  directChildId,
  idsToRoot,
  convergingPaths,
} from "./tree/id.ts";
export {
  type FocusChangeEvent,
  type StructureChangeEvent,
  type NavtreeEvent,
  type NavtreeListener,
  type ListenerTree,
  registerListener,
  callListeners,
} from "./tree/events.ts";

export {
  type NavigationDirection,
  type NavigationActions,
  type NavigationAction,
} from "./action.ts";

export {
  type NavigationHandler,
  type HandlerNext,
  runHandler,
  defaultHandler,
  containerHandler,
  parentHandler,
  itemHandler,
} from "./handler/handler.ts";
export { type ChainedHandler, chainedHandler } from "./handler/chained.ts";
export {
  type FocusDirection,
  type FocusHandlerConfig,
  initialHandler,
  captureHandler,
  focusHandler,
} from "./handler/focus.ts";
export {
  verticalMovementHandler,
  verticalHandler,
  horizontalMovementHandler,
  horizontalHandler,
} from "./handler/directional.ts";
export { type GridPos, gridItemHandler, gridMovement, gridHandler } from "./handler/grid.ts";
export { selectNode, selectHandler } from "./handler/select.ts";
export { spatialItemHandler, spatialMovement, spatialHandler } from "./handler/spatial.ts";

export { type MetaHandler, metaHandler } from "./meta/metadata.ts";
export {
  type HandlerInfo,
  describeHandler,
  getHandlerInfo,
  defaultHandlerInfo,
} from "./meta/introspection.ts";

export { inspector } from "./inspector.js";
