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
	useFocusedId,
	useFocus,
	useSelect,
	useElementHandler,
	useActionHandler,
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
type NavigationProviderProps = PropsWithChildren<{
	tree: NavigationTree;
}>;

function NavigationProvider(props: NavigationProviderProps): JSX.Element;
```

Supplies `tree` and sets `parentNode` to `"#"`.

### `useNavigationContext`

```ts
function useNavigationContext(): NavigationContext;
```

Throws if used outside a provider.

## Nodes

### `NodeOptions`

```ts
type NodeOptions = {
	id: NodeId;
	parent?: NodeId;
	order?: number;
	handler?: NavigationHandler;
};
```

### `NodeHandle`

```ts
type NodeHandle = {
	id: NodeId;
	isFocused: () => boolean;
	focus: (nodeId?: NodeId, options?: FocusOptions) => void;
	select: (nodeId?: NodeId, focus?: boolean) => void;
	Context: React.FunctionComponent<{ children: ReactNode }>;
};
```

### `useNavigationNode`

```ts
function useNavigationNode(options: NodeOptions): NodeHandle;
```

Creates/updates a [node](/api/#nodes-and-ids), inserts it on mount, removes on unmount, and provides a `Context` component that scopes children to this node’s id.

### `NodeProps` / `NavigationNode`

```ts
type NodeProps = NodeOptions & {
	children?: ReactNode | ((props: Omit<NodeHandle, "Context">) => ReactNode);
};

function NavigationNode(props: NodeProps): JSX.Element;
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
function useOnFocus(nodeId: NodeId, handler: (id: NodeId | null) => void): void;
```

Invokes the handler when focus enters or leaves this node’s subtree (focused id or `null`).

### `useFocusedId`

```ts
function useFocusedId(scope: NodeId): NodeId | null;
```

While `scope` contains focus, returns `tree.focus`; otherwise `null`.

### `useFocus`

```ts
function useFocus(scope?: NodeId): (nodeId: NodeId, options?: FocusOptions) => boolean;
```

Returns a stable function that calls [`focusNode`](/api/#focusnode) with ids joined under `scope` (default: context parent).

### `useSelect`

```ts
function useSelect(scope?: NodeId): (nodeId: NodeId, focus?: boolean) => void;
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

### `ActionHandlerOptions`

```ts
type ActionHandlerOptions = {
	target?: EventTarget;
	eventToAction?: (e: Event) => NavigationAction | null;
};
```

### `useActionHandler`

```ts
function useActionHandler(tree: NavigationTree, options?: ActionHandlerOptions): void;
```

Subscribes to `keydown` on `target` (default `window`) and forwards mapped actions to [`handleAction`](/api/#handleaction).

### `useFocusSync`

```ts
function useFocusSync(tree: NavigationTree): void;
```

On focus change, focuses the DOM element registered for the focused node, if any.

## See also

- [Core API](/api/)
- [Solid](/api/solid) — API parallels with Solid-specific naming
