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
	type FocusNodeOptions,
	createNavigationTree,
	insertNode,
	removeNode,
	holdFocus,
	focusNode,
	isFocused,
	traverseNodes,
	dispatchAction,
} from "./tree/tree.ts";

export {
	type CreatedNavtreeNode,
	type NavtreeNode,
	type NodeChild,
	type NodeOptions,
	createNode,
	updateNode,
} from "./tree/node.ts";

export { type NodeId, joinId, isParent, childLocalId } from "./tree/id.ts";

export { type NavtreeListener, registerListener } from "./tree/events.ts";

export {
	type NavigationDirection,
	type NavigationActions,
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

export { type ComposedHandler, composeHandlers } from "./handler/composed.ts";

export {
	type FocusDirection,
	type FocusHandlerOptions,
	focusHandler,
	initialHandler,
	captureHandler,
} from "./handler/focus.ts";

export {
	verticalHandler,
	horizontalHandler,
	verticalMovementHandler,
	horizontalMovementHandler,
} from "./handler/directional.ts";

export { type GridItem, gridHandler, gridItemHandler, gridMovement } from "./handler/grid.ts";

export { type SelectNodeOptions, selectNode, selectHandler } from "./handler/select.ts";

export {
	type SpatialItem,
	spatialHandler,
	spatialItemHandler,
	spatialMovement,
} from "./handler/spatial.ts";

export { type DataHandler, dataHandler } from "./handler/metadata.ts";

export {
	type HandlerDescription,
	type InspectorMessage,
	type InspectorCommand,
	type InspectorNode,
	describeHandler,
} from "./inspector.ts";
