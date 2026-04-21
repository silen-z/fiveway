---
outline: deep
---

# Solid (`@fiveway/solid`)

Re-exports everything from `@fiveway/core` and `@fiveway/core/dom`, plus Solid primitives.

```ts
import {
	NavigationProvider,
	useNavigationContext,
	createNavigationNode,
	NavigationNode,
	useIsFocused,
	useOnFocus,
	useOnFocusChange,
	useFocusedId,
	useFocus,
	useSelect,
	createElementHandler,
	createActionHandler,
	useFocusSync,
} from "@fiveway/solid";
```

## Context

### `NavigationContext` (type)

```ts
type NavigationContext = {
	tree: NavigationTree;
	parentNode: () => NodeId;
};
```

`parentNode` is an accessor for the current parent id (Solid reactivity).

### `NavigationProvider`

```ts
type NavigationProviderProps = {
	tree: NavigationTree;
	fromEvent?: (e: KeyboardEvent) => NavigationAction | null;
	children: JSX.Element;
};
```

Supplies the tree; optional `fromEvent` is reserved for custom key mapping at the provider level.

### `useNavigationContext`

```ts
function useNavigationContext(): NavigationContext;
```

## Nodes

### `NodeOptions`

```ts
type NodeOptions = {
	id: NodeId | Accessor<NodeId>;
	parent?: NodeId | Accessor<NodeId | undefined>;
	order?: number | Accessor<number | undefined>;
	handler?: NavigationHandler;
};
```

### `NodeHandle`

```ts
type NodeHandle = {
	(): NodeId;
	focus: (nodeId?: NodeId) => void;
	select: () => void;
	isFocused: Accessor<boolean>;
	onFocus: (fn: () => void) => void;
	Context: Component<ParentProps>;
};
```

Calling the handle returns the resolved global node id.

### `createNavigationNode`

```ts
function createNavigationNode(options: NodeOptions): NodeHandle;
```

Creates a reactive [node](/api/#nodes-and-ids), uses [`holdFocus`](/api/#holdfocus) during synchronous child setup for correct initial focus, and cleans up on dispose.

### `NavigationNode`

Component wrapper around `createNavigationNode` (see package source for props).

## Hooks

### `useIsFocused`

```ts
function useIsFocused(id: NodeId | Accessor<NodeId>): Accessor<boolean>;
```

### `useOnFocus`

```ts
function useOnFocus(nodeId: NodeId | Accessor<NodeId>, handler: () => void): void;
```

Runs `handler` when the node gains focus (entering from unfocused).

### `useOnFocusChange`

```ts
function useOnFocusChange(
	nodeId: NodeId | Accessor<NodeId>,
	handler: (id: NodeId | null) => void,
): void;
```

### `useFocusedId`

```ts
function useFocusedId(scope: NodeId): Accessor<NodeId | null>;
```

### `useFocus`

```ts
function useFocus(scope?: NodeId): (nodeId: NodeId, options?: FocusOptions) => boolean;
```

### `useSelect`

```ts
function useSelect(scope?: NodeId): (nodeId: NodeId, focus?: boolean) => void;
```

## DOM integration

### `ElementHandler`

Same shape as [React](/api/react): `ChainedHandler` plus `register`.

### `createElementHandler`

```ts
function createElementHandler(): ElementHandler;
```

Solid signal-backed element ref for [element](/api/#dom) + spatial handlers.

### `createActionHandler`

```ts
function createActionHandler(tree: NavigationTree, options?: ActionHandlerOptions): void;
```

`ActionHandlerOptions` matches React: `target`, `eventToAction`.

### `useFocusSync`

```ts
function useFocusSync(tree: NavigationTree): void;
```

Syncs DOM focus to the focused node’s element; blurs active element when no element is registered.

## See also

- [React](/api/react) — feature comparison
- [Core API](/api/#handlers)
