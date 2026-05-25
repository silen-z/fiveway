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
	type NavigationTreeOptions,
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
	type CreatedNavigationNode,
	type NavigationNode,
	type NodeChild,
	type NodeOptions,
	createNode,
	updateNode,
} from "./tree/node.ts";

export { type NodeId, joinId, isParent, childLocalId } from "./tree/id.ts";

export { type FocusListener, registerFocusListener } from "./tree/events.ts";

export {
	type NavigationDirection,
	type DefinedNavigationActions,
	type NavigationAction,
	type ActivateAction,
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

export {
	type GridItem,
	gridHandler,
	gridItemHandler,
	gridMovementHandler,
} from "./handler/grid.ts";

export {
	type ActivateNodeOptions,
	type ActivateCallback,
	activateNode,
	activationHandler,
} from "./handler/activate.ts";

export { type LongPressOptions, longPressHandler } from "./handler/longpress.ts";

export {
	type SpatialItem,
	spatialHandler,
	spatialItemHandler,
	spatialMovementHandler,
} from "./handler/spatial.ts";

export { type DataHandler, createDataHandler } from "./handler/metadata.ts";
