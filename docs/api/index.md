---
outline: deep
---

# Core API

These functions, types and objects are the same for all frameworks. As such they are reexported from every framework specific package like `@fiveway/react` and `@fiveway/solid`. Some of them are meant to be used by end user such as handlers. Others are more low-level for use by framework integrations.

## Navigation tree {#navigation-tree}

The navigation tree object keeps a `Map` of navigation `nodes` and currently focused node ID in `focus`. Other properties are considered internal and should not be relied upon.

### `NavigationTree`

```ts
type NavigationTree = {
	nodes: Map<NodeId, NavtreeNode>;
	focus: NodeId;

	// internal
	orphans: Map<NodeId, NodeId[]>;
	listeners: Map<NodeId, NavtreeListener[]>;
	focusLock: "free" | "locked" | "updatePending";
};
```

### `createNavigationTree`

```ts
function createNavigationTree(): NavigationTree;
```

Creates a new tree with a root node `"#"`.

### `insertNode`

```ts
function insertNode(tree: NavigationTree, node: CreatedNavtreeNode): () => void;
```

Registers a node create by [createNode](#createNode) in the tree. Replaces node with identical ID if it already exists. This function returns a dispose function that removes the node.

### `removeNode`

```ts
function removeNode(tree: NavigationTree, node: NodeId | NavtreeNode): void;
```

Removes a node by ID or by reference.

### `holdFocus` {#holdfocus}

```ts
function holdFocus(tree: NavigationTree): (() => void) | null;
```

Temporarily locks focus from changinh while the tree structure changes to allow inserting multiple nodes at once. Returns a release function, or `null` if a lock is already held.

Calling the release function may apply a pending focus update.

### `focusNode` {#focusnode}

```ts
type FocusOptions = {
	direction?: NavigationDirection | "initial";
};

function focusNode(tree: NavigationTree, targetId: NodeId, options?: FocusOptions): boolean;
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

### `handleAction` {#handleaction}

```ts
function handleAction(tree: NavigationTree, action: NavigationAction): void;
```

Runs the current focus node’s handler chain with `action`. If the handler chain returns a target id, focus moves there via `focusNode`.

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

### `NodeConfig`

```ts
type NodeConfig = {
	id: string;
	parent: NodeId;
	order?: number;
	handler?: NavigationHandler;
};
```

Used by higher-level patterns; the core `createNode` API uses `NodeConfig`.

### `createNode`

```ts
function createNode(options: NodeConfig): CreatedNavtreeNode;
```

Builds an unattached node description. The `id` is combined with `parent` via `joinId`. Default handler is `defaultHandler` if omitted.

### `updateNode`

```ts
function updateNode(node: CreatedNavtreeNode, options: Omit<NodeConfig, "id" | "parent">): void;
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

## Events {#events}

The tree emits structural and focus events on node paths so UI can subscribe at the right scope.

### `FocusChangeEvent`

```ts
type FocusChangeEvent = {
	type: "focuschange";
	focused: NodeId;
	previous: NodeId;
};
```

### `StructureChangeEvent`

```ts
type StructureChangeEvent = {
	type: "structurechange";
	operation: "insert" | "removal";
	id: NodeId;
};
```

### `NavtreeEvent`

```ts
type NavtreeEvent = StructureChangeEvent | FocusChangeEvent;
```

### `NavtreeListener`

```ts
type NavtreeListener = {
	type: NavtreeEvent["type"];
	fn: (event: NavtreeEvent) => void;
};
```

### `registerListener`

```ts
function registerListener(
	tree: NavigationTree,
	id: NodeId,
	type: "focuschange" | "structurechange",
	fn: (event: NavtreeEvent) => void,
): () => void;
```

Registers a listener on `id` for `"focuschange"` or `"structurechange"`. Returns an unsubscribe function.

Focus changes are invoked along the converging path between the previous and new focus so ancestors can update highlighting.

## Actions {#actions}

Actions describe what the navigation system should do. Handlers receive them and may delegate to parent nodes or change the action.

### `NavigationDirection`

```ts
type NavigationDirection = "up" | "down" | "left" | "right";
```

### `NavigationActions`

```ts
interface NavigationActions {
	select: { kind: "select" };
	move: { kind: "move"; direction: NavigationDirection | "back" };
	focus: { kind: "focus"; direction: NavigationDirection | "initial" | null };
	query: { kind: "query"; key: string; value: unknown };
}
```

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
2. [`handleAction`](#handleaction) runs the action from the focused node.
3. Handlers return the next `NodeId` to focus, or `null`.

## Handlers {#handlers}

Handlers implement navigation behavior. Each node has a `NavigationHandler`; composite behavior is built with `chainedHandler` and specialized handlers.

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

### `chainedHandler`

```ts
type ChainedHandler = NavigationHandler & {
	prepend(another: NavigationHandler | ChainedHandler): ChainedHandler;
};

function chainedHandler(handlers: NavigationHandler | NavigationHandler[] | null): ChainedHandler;
```

Combines handlers so each receives `next` wired to the rest of the chain. Use `.prepend()` to add behavior at the front (for example `selectHandler` on items).

### `defaultHandler`

```ts
const defaultHandler: ChainedHandler;
```

Chains `focusHandler()` with `parentHandler` — typical leaf and general-purpose default.

### `containerHandler`

```ts
const containerHandler: ChainedHandler;
```

Like `defaultHandler`, but focus skips empty containers (`focusHandler({ skipEmpty: true })`).

### `parentHandler`

```ts
const parentHandler: NavigationHandler;
```

Delegates most actions to the parent node; ignores `query` (returns `null`).

### `itemHandler`

```ts
function itemHandler(onSelect?: () => void): ChainedHandler;
```

If `onSelect` is provided, prepends `selectHandler(onSelect)` to `defaultHandler`; otherwise returns `defaultHandler`.

### `focusHandler`

```ts
type FocusDirection = "front" | "back";

type FocusHandlerConfig = {
	skipEmpty?: boolean;
	direction?: (dir: NavigationDirection | "initial" | null) => FocusDirection | null;
};

function focusHandler(config?: FocusHandlerConfig): NavigationHandler;
```

Resolves `focus` actions by walking children (respecting `initialHandler` metadata when direction is initial).

### `initialHandler`

```ts
const initialHandler: MetaHandler<string>;
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
const verticalHandler: ChainedHandler;
const horizontalHandler: ChainedHandler;
```

Prebuilt chains: `focusHandler` with direction mapping, movement handler, and `parentHandler`.

### `GridPos`

```ts
type GridPos = { row: number; col: number };
```

### `gridItemHandler`

```ts
const gridItemHandler: MetaHandler<GridPos>;
```

Associates each item with grid coordinates (`core:grid-item`).

### `gridMovement`

```ts
const gridMovement: NavigationHandler;
```

Lower-level movement handler used inside `gridHandler`; picks the nearest cell using `gridItemHandler` positions.

### `gridHandler`

```ts
function gridHandler(config?: {
	distance?: (direction: NavigationDirection) => (a: GridPos, b: GridPos) => number | null;
}): ChainedHandler;
```

Chains `focusHandler({ skipEmpty: true })`, `gridMovement` (with optional `distance`), and `parentHandler`.

Optional `distance` overrides how the nearest cell is chosen for each arrow direction; defaults use row/column heuristics.

### `spatialItemHandler`

```ts
const spatialItemHandler: MetaHandler<DOMRect>;
```

Stores layout bounds per node (`core:node-position`).

### `spatialMovement`

```ts
const spatialMovement: NavigationHandler;
```

### `spatialHandler`

```ts
const spatialHandler: ChainedHandler;
```

Combines spatial movement with defaults for arrow-key style navigation using rects.

### `selectHandler`

```ts
function selectHandler(onSelect: () => void): NavigationHandler;
```

Invokes `onSelect` when the action is `select`. Used inside `itemHandler`.

### `selectNode` {#selectnode}

```ts
function selectNode(tree: NavigationTree, nodeId: NodeId, focus?: boolean): void;
```

Optionally focuses `nodeId`, then runs the `select` action through that node’s handler chain.

## Metadata & introspection {#metadata-and-introspection}

Metadata handlers attach values to nodes and expose them through `query` [actions](#actions). Introspection helpers support dev tooling and handler inspection.

### `MetaHandler`

```ts
type MetaHandler<T> = {
	key: string;
	(v: T | (() => T | null) | null): NavigationHandler;
	query: (tree: NavigationTree, id: NodeId) => T | null;
};
```

Calling `metaHandler(key)` returns a factory: given a value (or getter), it produces a handler that answers `query` actions for that `key`. The `.query(tree, id)` helper runs the query and returns the stored value.

Built-in meta handlers include `initialHandler`, `gridItemHandler`, `spatialItemHandler`, and DOM `elementHandler` (see [DOM](#dom)).

### `metaHandler`

```ts
function metaHandler<T>(key: string): MetaHandler<T>;
```

Factory for custom metadata keys.

### `HandlerInfo`

```ts
type HandlerInfo = Record<string, string | { toString(): string }>;
```

### `describeHandler`

```ts
function describeHandler(action: NavigationAction, info: HandlerInfo): void;
```

In development, records handler description into `query` actions with key `core:handler-info`.

### `queryHandlerInfo`

```ts
function queryHandlerInfo(tree: NavigationTree, id: NodeId): HandlerInfo[];
```

Runs the handler-info query at `id` and returns collected metadata from the chain.

## DOM (`@fiveway/core/dom`) {#dom}

Helpers for connecting browser events and DOM elements to the core navigation model.

### `defaultEventMapping`

```ts
function defaultEventMapping(e: Event): NavigationAction | null;
```

Maps `keydown` events to default [actions](#actions): arrow keys to `move`, Enter/Space to `select`, Backspace to `move` with direction `"back"`. Returns `null` when unmapped.

Use with [`handleAction`](#handleaction) from a keydown listener, or via framework helpers ([React](/api/react) `useActionHandler`, [Solid](/api/solid) `createActionHandler`).

### `elementHandler`

```ts
const elementHandler: MetaHandler<HTMLElement>;
```

Metadata handler (`core:node-element`) that ties a node to a focusable DOM element (getter or value). Exposes `.query(tree, id)` to resolve the element for focus sync.

React’s `useElementHandler` and Solid’s `createElementHandler` wrap this with `spatialItemHandler` for layout-aware navigation.
