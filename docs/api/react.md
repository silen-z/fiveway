---
outline: deep
---

# React (`@fiveway/react`)

Re-exports everything from `@fiveway/core` and `@fiveway/core/dom`, plus React bindings.

```ts
import {
	NavigationProvider,
	useNavigationContext,
	useNavigationNode,
	NavigationNode,
	useIsFocused,
	useOnFocus,
	useOnBlur,
	useOnFocusChange,
	useFocusedId,
	useFocus,
	useSelect,
	useElementHandler,
	useDispatchOnEvent,
	useFocusSync,
} from "@fiveway/react";
```

## Context

### `NavigationContext` (type)

```ts
type NavigationContext = {
	tree: NavigationTree;
	parentNode: NodeId;
};
```

### `NavigationContext` (value)

```ts
const NavigationContext: React.Context<NavigationContext | null>;
```

### `NavigationProvider`

```ts
function NavigationProvider(props: { tree: NavigationTree; children?: ReactNode }): ReactNode;
```

Supplies `tree` and sets `parentNode` to `"#"`.

### `useNavigationContext`

```ts
function useNavigationContext(): NavigationContext;
```

Throws if used outside a provider.

## Nodes

### `NavigationNodeOptions`

```ts
type NavigationNodeOptions = {
	id: NodeId;
	parent?: NodeId;
	order?: number;
	handler?: NavigationHandler;
};
```

### `NavigationNodeHandle`

```ts
type NavigationNodeHandle = {
	id: NodeId;
	isFocused: () => boolean;
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;
	select: (nodeId?: NodeId, options?: SelectNodeOptions) => void;
	Context: React.FunctionComponent<{ children: ReactNode }>;
};
```

`FocusNodeOptions` and `SelectNodeOptions` are from `@fiveway/core`.

### `useNavigationNode`

```ts
function useNavigationNode(options: NavigationNodeOptions): NavigationNodeHandle;
```

Creates/updates a [node](/api/#nodes-and-ids), inserts it on mount, removes on unmount, and provides a `Context` component that scopes children to this node’s id.

### `NavigationNodeProps` / `NavigationNode`

```ts
type NavigationNodeProps = NavigationNodeOptions & {
	children?: ReactNode | ((props: Omit<NavigationNodeHandle, "Context">) => ReactNode);
};

function NavigationNode(props: NavigationNodeProps): ReactNode;
```

Declarative wrapper around `useNavigationNode` with optional render-prop children.

## Hooks

### `useIsFocused`

```ts
function useIsFocused(nodeId: NodeId): boolean;
```

Reactive `isFocused` for a node id relative to the current context parent (uses `joinId`).

### `useOnFocus`

```ts
function useOnFocus(nodeId: NodeId, handler: () => void): void;
```

Invokes the handler when focus enters this node’s subtree (from unfocused).

### `useOnBlur`

```ts
function useOnBlur(nodeId: NodeId, handler: () => void): void;
```

Invokes the handler when focus leaves this node’s subtree.

### `useOnFocusChange`

```ts
function useOnFocusChange(nodeId: NodeId, handler: (id: NodeId | null) => void): void;
```

Invokes the handler with the current focused id under this subtree, or `null` when unfocused. Also runs once with the initial value.

### `useFocusedId`

```ts
function useFocusedId(scope: NodeId): NodeId | null;
```

While `scope` contains focus, returns `tree.focus`; otherwise `null`.

### `useFocus`

```ts
function useFocus(scope?: NodeId): (nodeId: NodeId, options?: FocusNodeOptions) => boolean;
```

Returns a stable function that calls [`focusNode`](/api/#focusnode) with ids joined under `scope` (default: context parent).

### `useSelect`

```ts
function useSelect(scope?: NodeId): (nodeId: NodeId, options?: SelectNodeOptions) => void;
```

Calls [`selectNode`](/api/#selectnode) with ids under `scope`.

## DOM integration

### `ElementHandler`

```ts
type ElementHandler = ChainedHandler & {
	register: (e: HTMLElement | null) => void;
};
```

### `useElementHandler`

```ts
function useElementHandler(): ElementHandler;
```

Memoized handler combining [element](/api/#dom) and spatial item behavior with a `register` ref callback.

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

Subscribes to DOM events on `target` (default `window`), `event` type default `keydown`, maps them with `eventToAction` (default [`defaultEventMapping`](/api/#dom)), and forwards to [`dispatchAction`](/api/#dispatchaction).

### `useFocusSync`

```ts
function useFocusSync(tree: NavigationTree): void;
```

On focus change, focuses the DOM element registered for the focused node, if any.

## See also

- [Core API](/api/)
- [Solid](/api/solid) — API parallels with Solid-specific naming
