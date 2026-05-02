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
	useOnBlur,
	useOnFocusChange,
	useFocusedId,
	useFocus,
	useSelect,
	createElementHandler,
	useDispatchOnEvent,
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
function NavigationProvider(props: {
	tree: NavigationTree;
	fromEvent?: (e: KeyboardEvent) => NavigationAction | null;
	children: JSX.Element;
}): JSX.Element;
```

Supplies the tree; `fromEvent` is reserved for custom key mapping at the provider level (the tree is not reactive through this prop).

### `useNavigationContext`

```ts
function useNavigationContext(): NavigationContext;
```

## Nodes

### `NavigationNodeOptions`

```ts
type NavigationNodeOptions = {
	id: NodeId | Accessor<NodeId>;
	parent?: NodeId | Accessor<NodeId | undefined>;
	order?: number | Accessor<number | undefined>;
	handler?: NavigationHandler;
};
```

### `NavigationNodeHandle`

```ts
type NavigationNodeHandle = {
	(): NodeId;
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;
	select: (nodeId?: NodeId, options?: SelectNodeOptions) => void;
	isFocused: Accessor<boolean>;
	onFocus: (fn: () => void) => void;
	Context: Component<ParentProps>;
};
```

Calling the handle returns the resolved global node id. `FocusNodeOptions` and `SelectNodeOptions` are from `@fiveway/core`.

### `createNavigationNode`

```ts
function createNavigationNode(options: NavigationNodeOptions): NavigationNodeHandle;
```

Creates a reactive [node](/api/#nodes-and-ids), uses [`holdFocus`](/api/#holdfocus) during synchronous child setup for correct initial focus, and cleans up on dispose.

### `NavigationNode`

```ts
type NavigationNodeProps = NavigationNodeOptions & {
	children?: JSX.Element | ((props: Omit<NavigationNodeHandle, "Context">) => JSX.Element);
};

function NavigationNode(props: NavigationNodeProps): JSX.Element;
```

Component wrapper around `createNavigationNode` with optional render-prop children.

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

### `useOnBlur`

```ts
function useOnBlur(nodeId: NodeId | Accessor<NodeId>, handler: () => void): void;
```

Runs `handler` when the node loses focus.

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
function useFocus(scope?: NodeId): (nodeId: NodeId, options?: FocusNodeOptions) => boolean;
```

### `useSelect`

```ts
function useSelect(scope?: NodeId): (nodeId: NodeId, options?: SelectNodeOptions) => void;
```

## DOM integration

### `ElementHandler`

Same shape as [React](/api/react): `ComposedHandler` plus `register`.

### `createElementHandler`

```ts
function createElementHandler(): ElementHandler;
```

Solid signal-backed element ref for [element](/api/#dom) + spatial handlers.

### `DispatchOnEventOptions`

```ts
type DispatchOnEventOptions = {
	target?: EventTarget;
	event?: string;
	eventToAction?: (e: Event) => NavigationAction | null;
};
```

### `useDispatchOnEvent`

```ts
function useDispatchOnEvent(tree: NavigationTree, options?: DispatchOnEventOptions): void;
```

Subscribes to DOM events and forwards mapped actions to [`dispatchAction`](/api/#dispatchaction), same options as React.

### `useFocusSync`

```ts
function useFocusSync(tree: NavigationTree): void;
```

Syncs DOM focus to the focused node’s element; blurs active element when no element is registered.

## See also

- [React](/api/react) — feature comparison
- [Core API](/api/#handlers)
