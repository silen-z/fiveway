declare global {
	interface ImportMetaEnv {
		readonly FIVEWAY_INSPECTOR?: unknown;
		readonly DEV?: unknown;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
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
	createNode,
	updateNode,
} from "./tree/node.ts";
export { type NodeId, joinId, isParent, childLocalId } from "./tree/id.ts";

export { type NavtreeListener, registerListener } from "./tree/events.ts";

export {
	type NavigationDirection,
	type NavigationAction,
	type SelectAction,
	type MoveAction,
	type FocusAction,
	type QueryAction,
} from "./action.ts";

export {
	type NavigationHandler,
	type HandlerNext,
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

export { type SelectOptions, selectNode, selectHandler } from "./handler/select.ts";

export { spatialItemHandler, spatialMovement, spatialHandler } from "./handler/spatial.ts";

export { type MetaHandler, metaHandler } from "./handler/metadata.ts";

export {
	type HandlerInfo,
	type InspectorMessage,
	type InspectorCommand,
	type InspectorNode,
	describeHandler,
	queryHandlerInfo,
} from "./inspector.ts";
