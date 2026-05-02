---
outline: deep
---

# Core API

These functions, types and objects are the same for all frameworks. As such they are reexported from every framework specific package like `@fiveway/react` and `@fiveway/solid`. Some of them are meant to be used by end user such as handlers. Others are more low-level for use by framework integrations.

## Navigation tree {#navigation-tree}

The navigation tree object keeps a `Map` of navigation `nodes` and currently focused node ID in `focus`. It also has a `label` string (used by the inspector protocol). Other fields are mainly for internal bookkeeping.

### `NavigationTree`

```ts
type NavigationTree = {
	label: string;
	nodes: Map<NodeId, NavtreeNode>;
	focus: NodeId;
	orphans: Map<NodeId, NodeId[]>;
	listeners: Map<NodeId, NavtreeListener[]>;
	focusLock: "free" | "locked" | "updatePending";
};
```

### `createNavigationTree`

```ts
function createNavigationTree(options?: { label?: string }): NavigationTree;
```

Creates a new tree with a root node `"#"`. An optional `label` identifies this tree for devtools messages (defaults to a random label).

### `insertNode`

```ts
function insertNode(tree: NavigationTree, node: CreatedNavtreeNode): () => void;
```

Registers a node created by [createNode](#createNode) in the tree. Replaces node with identical ID if it already exists. This function returns a dispose function that removes the node.

### `removeNode`

```ts
function removeNode(tree: NavigationTree, node: NodeId | NavtreeNode): void;
```

Removes a node by ID or by reference.

### `holdFocus` {#holdfocus}

```ts
function holdFocus(tree: NavigationTree): (() => void) | null;
```

Temporarily locks focus from changing while the tree structure changes to allow inserting multiple nodes at once. Returns a release function, or `null` if a lock is already held.

Calling the release function may apply a pending focus update.

### `focusNode` {#focusnode}

```ts
type FocusNodeOptions = {
	direction?: NavigationDirection | "initial";
};

function focusNode(tree: NavigationTree, targetId: NodeId, options?: FocusNodeOptions): boolean;
```

Attempts to move focus to `targetId` by running the focus [action](#actions) through handlers. Returns whether focus ended on the resolved node.

### `isFocused`

```ts
function isFocused(tree: NavigationTree, nodeId: NodeId): boolean;
```

Returns `true` if `tree.focus === nodeId` or if `nodeId` is an ancestor of the focused node (focus is “inside” that subtree).

### `traverseNodes`

```ts
function traverseNodes(
	tree: NavigationTree,
	nodeId: NodeId,
	depth: number | null,
	callback: (id: NodeId) => void,
): void;
```

Walks active children from `nodeId`. If `depth` is a number, only that many levels are visited; `null` means unlimited depth.

### `dispatchAction` {#dispatchaction}

```ts
function dispatchAction(tree: NavigationTree, action: NavigationAction, node?: NodeId): void;
```

Runs the focused node’s handler with `action`. If the handler returns a target id, focus moves there via `focusNode`.

Typical source of actions: keyboard mapping (see [DOM](#dom)) or framework helpers.

## Nodes & IDs {#nodes-and-ids}

### `NodeId`

```ts
type NodeId = string;
```

Ids form a path hierarchy from the root `"#"`, e.g. `"#/list/item-1"`.

### `CreatedNavtreeNode` / `NavtreeNode`

```ts
type CreatedNavtreeNode = {
	tree: NavigationTree | null;
	id: NodeId;
	connected: boolean;
	parent: NodeId | null;
	order: number | null;
	handler: NavigationHandler;
	children: NodeChild[];
};

type NavtreeNode = CreatedNavtreeNode & {
	tree: NavigationTree;
};
```

### `NodeChild`

```ts
type NodeChild = { id: NodeId; order: number | null; active: boolean };
```

### `NodeOptions`

```ts
type NodeOptions = {
	id: string;
	parent: NodeId;
	order?: number;
	handler?: NavigationHandler;
};
```

### `createNode` {#createNode}

```ts
function createNode(options: NodeOptions): CreatedNavtreeNode;
```

Builds an unattached node description. The `id` is combined with `parent` via `joinId`. Default handler is `defaultHandler` if omitted.

### `updateNode`

```ts
function updateNode(node: CreatedNavtreeNode, options: Omit<NodeOptions, "id" | "parent">): void;
```

Updates `handler` and/or `order` on an existing node. Changing order repositions the node among its parent’s children.

### `joinId`

```ts
function joinId(scope: NodeId, nodeId: NodeId): NodeId;
```

Joins a parent scope with a local segment. If `nodeId` starts with `#/`, it is treated as absolute and returned as-is.

### `isParent`

```ts
function isParent(parentId: NodeId, childId: NodeId): boolean;
```

True when `childId` is a descendant path of `parentId` (path-prefix semantics).

### `childLocalId`

```ts
function childLocalId(parentId: NodeId, descendantId: NodeId): NodeId | null;
```

Returns the id of the direct child of `parentId` on the path to `descendantId`, or `null` if not a descendant.

## Listeners {#events}

When focus moves, callbacks registered on nodes along the path between the previous and new focus are notified. This is what powers reactive hooks in the framework packages.

### `NavtreeListener`

```ts
type NavtreeListener = () => void;
```

### `registerListener`

```ts
function registerListener(tree: NavigationTree, id: NodeId, handler: NavtreeListener): () => void;
```

Registers `handler` on `id`. It runs when a focus transition affects that node (along the converging path between old and new focus). Returns an unsubscribe function.

## Actions {#actions}

Actions describe what the navigation system should do. Handlers receive them and may delegate to parent nodes or change the action.

### `NavigationDirection`

```ts
type NavigationDirection = "up" | "down" | "left" | "right";
```

### `NavigationActions` and per-kind types

```ts
interface NavigationActions {
	select: SelectAction;
	move: MoveAction;
	focus: FocusAction;
	query: QueryAction;
}

type SelectAction = { kind: "select" };
type MoveAction = { kind: "move"; direction: NavigationDirection | "back" };
type FocusAction = { kind: "focus"; direction: NavigationDirection | "initial" | null };
type QueryAction = { kind: "query"; key: string; value: unknown };
```

These types are exported individually as well as through `NavigationActions`.

#### Extending actions

You can merge additional action variants via TypeScript module augmentation:

```ts
declare module "@fiveway/core" {
	interface NavigationActions {
		custom: { kind: "my-custom-action"; customValue: string };
	}
}
```

### `NavigationAction`

```ts
type NavigationAction = NavigationActions[keyof NavigationActions];
```

### Typical flow

1. Input (e.g. keyboard) is mapped to a `NavigationAction` (see [DOM](#dom) `defaultEventMapping`).
2. [`dispatchAction`](#dispatchaction) runs the action from the focused node.
3. Handlers return the next `NodeId` to focus, or `null`.

## Handlers {#handlers}

Handlers implement navigation behavior. Each node has a `NavigationHandler`; composite behavior is built with `composeHandlers` and specialized handlers.

### `HandlerNext`

```ts
type HandlerNext = (id?: NodeId, action?: NavigationAction) => NodeId | null;
```

Call `next()` to stop at the current node, `next(parentId)` to delegate to another node (optionally with a different action).

### `NavigationHandler`

```ts
type NavigationHandler = (
	node: NavtreeNode,
	action: NavigationAction,
	next: HandlerNext,
) => NodeId | null;
```

### `composeHandlers`

```ts
type HandlerLink = {
	handler: NavigationHandler;
	next: HandlerLink | null;
};

type ComposedHandler = NavigationHandler & {
	link: HandlerLink | null;
	compose(handler: NavigationHandler | ComposedHandler): ComposedHandler;
};

function composeHandlers(handlers: NavigationHandler | NavigationHandler[] | null): ComposedHandler;
```

Combines handlers so each receives `next` wired to the handlers that follow. Use `.compose()` to add behavior at the front (for example `selectHandler` on items).

### `defaultHandler`

```ts
const defaultHandler: ComposedHandler;
```

Composes `focusHandler()` with `parentHandler` — typical leaf and general-purpose default.

### `containerHandler`

```ts
const containerHandler: ComposedHandler;
```

Like `defaultHandler`, but empty containers do not keep focus (`focusHandler({ focusWhenEmpty: false })`).

### `parentHandler`

```ts
const parentHandler: NavigationHandler;
```

Delegates most actions to the parent node; ignores `query` (returns `null`).

### `itemHandler`

```ts
function itemHandler(onSelect?: () => void): ComposedHandler;
```

If `onSelect` is provided, composes `selectHandler(onSelect)` onto `defaultHandler` via `.compose()`; otherwise returns `defaultHandler`.

### `focusHandler`

```ts
type FocusDirection = "front" | "back";

type FocusHandlerOptions = {
	focusWhenEmpty?: boolean;
	direction?: (dir: NavigationDirection | "initial" | null) => FocusDirection | null;
};

function focusHandler(config?: FocusHandlerOptions): NavigationHandler;
```

Resolves `focus` actions by walking children (respecting `initialHandler` metadata when direction is initial). When `focusWhenEmpty` is `false`, an empty container does not receive focus (used by `containerHandler`, grid, and spatial handlers).

### `initialHandler`

```ts
const initialHandler: DataHandler<string>;
```

Metadata handler keyed `core:initial` — stores the local id of the preferred first child for initial focus.

### `captureHandler`

```ts
const captureHandler: NavigationHandler;
```

Ensures the resolved id stays under the current node subtree.

### `verticalMovementHandler` / `horizontalMovementHandler`

```ts
function verticalMovementHandler(
	node: NavtreeNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null;

function horizontalMovementHandler(
	node: NavtreeNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null;
```

Handle `move` for up/down (vertical) or left/right (horizontal) by walking ordered siblings under the current container.

### `verticalHandler` / `horizontalHandler`

```ts
const verticalHandler: ComposedHandler;
const horizontalHandler: ComposedHandler;
```

Prebuilt compositions: `focusHandler` with direction mapping, movement handler, and `parentHandler`.

### `GridItem`

```ts
type GridItem = { row: number; col: number };
```

### `gridItemHandler`

```ts
const gridItemHandler: DataHandler<GridItem>;
```

Associates each item with grid coordinates (query key `gridItem`).

### `gridMovement`

```ts
const gridMovement: NavigationHandler;
```

Lower-level movement handler used inside `gridHandler`; picks the nearest cell using `gridItemHandler` positions.

### `gridHandler`

```ts
function gridHandler(config?: {
	distance?: (direction: NavigationDirection) => (a: GridItem, b: GridItem) => number | null;
}): ComposedHandler;
```

Composes `focusHandler({ focusWhenEmpty: false })`, `gridMovement` (with optional `distance`), and `parentHandler`.

Optional `distance` overrides how the nearest cell is chosen for each arrow direction; defaults use row/column heuristics.

### `SpatialItem`

```ts
type SpatialItem = {
	left: number;
	top: number;
	width: number;
	height: number;
};
```

Plain rectangle (for example from `getBoundingClientRect()`).

### `spatialItemHandler`

```ts
const spatialItemHandler: DataHandler<SpatialItem>;
```

Stores layout bounds per node (query key `core:node-position`).

### `spatialMovement`

```ts
const spatialMovement: NavigationHandler;
```

### `spatialHandler`

```ts
const spatialHandler: ComposedHandler;
```

Combines spatial movement with defaults for arrow-key style navigation using rects.

### `selectHandler`

```ts
function selectHandler(onSelect: () => void): NavigationHandler;
```

Invokes `onSelect` when the action is `select`. Used inside `itemHandler`.

### `selectNode` {#selectnode}

```ts
type SelectNodeOptions = {
	focus?: boolean;
};

function selectNode(tree: NavigationTree, nodeId: NodeId, options?: SelectNodeOptions): void;
```

By default focuses `nodeId` first (`focus` defaults to `true`), then runs the `select` action through that node’s handler.

## Metadata & introspection {#metadata-and-introspection}

Data handlers attach values to nodes and expose them through `query` [actions](#actions). Exported introspection types support devtools and custom tooling.

### `DataHandler`

```ts
type DataHandler<T> = {
	key: string;
	(v: T | (() => T | null) | null): NavigationHandler;
	query: (tree: NavigationTree, id: NodeId) => T | null;
};
```

Calling `dataHandler(key)` returns a factory: given a value (or getter), it produces a handler that answers `query` actions for that `key`. The `.query(tree, id)` helper runs the query and returns the stored value.

Built-in data handlers include `initialHandler`, `gridItemHandler`, `spatialItemHandler`, and DOM `elementHandler` (see [DOM](#dom)).

### `dataHandler`

```ts
function dataHandler<T>(key: string): DataHandler<T>;
```

Factory for custom metadata keys.

### `describeHandler`

```ts
type HandlerDescription = Record<string, unknown>;

function describeHandler(action: NavigationAction, info: HandlerDescription): void;
```

In development builds, handler implementations call this so inspector queries can collect structured descriptions.

### Inspector protocol types (exported)

```ts
type InspectorNode = {
	id: string;
	parent: string | null;
	order: number | null;
	children: string[];
	handler?: HandlerDescription[];
};

type InspectorMessage = {
	type: "fiveway:treeState";
	tree: string;
	focus?: string;
	nodes?: InspectorNode[];
	removedNodes?: string[];
	complete?: true;
};

type InspectorCommand =
	| { kind: "dispatchAction"; tree: string; action: NavigationAction; node?: NodeId }
	| { kind: "requestCompleteSnapshot"; tree: string }
	| { kind: "inspectHandler"; tree: string; node: NodeId };
```

These mirror messages used between the library and the browser extension / inspector UI.

## DOM (`@fiveway/core/dom`) {#dom}

Helpers for connecting browser events and DOM elements to the core navigation model.

### `defaultEventMapping`

```ts
function defaultEventMapping(e: Event): NavigationAction | null;
```

Maps `keydown` events to default [actions](#actions): arrow keys to `move`, Enter/Space to `select`, Backspace to `move` with direction `"back"`. Returns `null` when unmapped.

Use with [`dispatchAction`](#dispatchaction) from a keydown listener, or via framework helpers ([React](/api/react) `useDispatchOnEvent`, [Solid](/api/solid) `useDispatchOnEvent`).

### `elementHandler`

```ts
const elementHandler: DataHandler<HTMLElement>;
```

Metadata handler (`core:node-element`) that ties a node to a focusable DOM element (getter or value). Exposes `.query(tree, id)` to resolve the element for focus sync.

React’s `useElementHandler` and Solid’s `createElementHandler` combine this with `spatialItemHandler` for layout-aware navigation.
