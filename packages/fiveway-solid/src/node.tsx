import {
	type FocusNodeOptions,
	type ActivateNodeOptions,
	type NodeId,
	insertNode,
	createNode,
	focusNode,
	joinId,
	activateNode,
	updateNode,
	holdFocus,
	composeHandlers,
	type NavigationHandler,
} from "@fiveway/core";
import {
	type Accessor,
	type Component,
	type JSX,
	type ParentProps,
	createEffect,
	createMemo,
	onCleanup,
	untrack,
} from "solid-js";

import { useNavigationContext, NavigationContext } from "./context.tsx";
import { useIsFocused, useOnFocus } from "./hooks.ts";

/**
 * Options for {@link createNavnode}.
 */
export interface NavnodeOptions {
	/**
	 * The parent node ID.
	 * By default the node will be created relative to the current parent node.
	 */
	parent?: NodeId;

	/**
	 * The order of the node in relation to other children.
	 */
	order?: number;
}

/**
 * Navigation node handle returned by {@link createNavnode}.
 */
export interface NavnodeHandle {
	/**
	 * Returns the ID of the node.
	 */
	(): NodeId;

	/**
	 * Accessor that returns whether the node is currently focused.
	 */
	isFocused: Accessor<boolean>;

	/**
	 * Function for focusing the node.
	 */
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;

	/**
	 * Function for activating the node.
	 */
	activate: (nodeId?: NodeId, options?: ActivateNodeOptions) => void;

	/**
	 * Registers a callback that runs when the node is focused.
	 */
	onFocus: (fn: () => void) => void;

	/**
	 * Solid context provider that sets this node as parent for its children.
	 */
	Context: Component<ParentProps>;
}

/**
 * Solid primitive that creates a navigation node and returns a handle for it.
 * When creating container nodes, returned `Context` must be used to provide this node as parent to children nodes.
 *
 * @param id - The ID of the node. Can also be an accessor for reactive IDs.
 * @param handler - The handler for the node. Either a single handler or an array of handlers. If not provided, the node will use the `defaultHandler`.
 * @param options - The options for the node.
 *
 * @see {@link NavnodeOptions}
 * @see {@link NavnodeHandle}
 *
 * @example
 * ```tsx
 * const nav = createNavnode("layout", containerHandler);
 * return (
 *   <nav.Context>
 *     <Sidebar/>
 *     <Content />
 *     <Footer />
 *   </nav.Context>
 * );
 * ```
 */
export function createNavnode(
	id: NodeId | Accessor<NodeId>,
	handler?: NavigationHandler | (NavigationHandler | undefined)[],
	options: NavnodeOptions = {},
): NavnodeHandle {
	const { tree, parentNode } = useNavigationContext();

	const parent = () => options.parent ?? parentNode();

	const localId = () => (typeof id === "function" ? id() : id);

	const nodeId = () => joinId(parent(), localId());

	const node = createMemo(() => {
		return createNode({
			parent: parent(),
			id: localId(),
			handler: Array.isArray(handler) ? composeHandlers(handler) : handler,
			order: untrack(() => options.order),
		});
	});

	createEffect(() => {
		// to resolve initial focus correctly, it needs to be held while child nodes get inserted
		// child (and sibling) effects should run synchronously after this one
		// after they are done Promise.resolve() should release the focus
		const releaseFocus = holdFocus(tree);

		const n = node();

		createEffect(() => updateNode(n, { order: options.order }), { defer: true });

		const cleanupNode = insertNode(tree, n);
		onCleanup(cleanupNode);

		if (releaseFocus) {
			void Promise.resolve().then(releaseFocus);
		}
	});

	const focus = (nodeId?: NodeId, options?: FocusNodeOptions) => {
		const id = nodeId != null ? joinId(node().id, nodeId) : node().id;
		focusNode(tree, id, options);
	};

	const activate = (nodeId?: NodeId, options?: ActivateNodeOptions) => {
		const id = nodeId != null ? joinId(node().id, nodeId) : node().id;
		activateNode(tree, id, options);
	};

	// workaround for: https://github.com/solidjs/solid/issues/2352
	// reading from node() was returning undefined
	const handle = () => nodeId();

	handle.focus = focus;
	handle.activate = activate;
	handle.isFocused = useIsFocused(handle);
	handle.onFocus = (fn: () => void) => useOnFocus(handle, fn);

	handle.Context = (props: ParentProps) => {
		return (
			<NavigationContext.Provider value={{ tree, parentNode: handle }}>
				{props.children}
			</NavigationContext.Provider>
		);
	};

	return handle;
}

type NavnodeChildren = JSX.Element | ((nav: NavnodeHandle) => JSX.Element);

/**
 * Props for {@link Navnode}.
 */
export interface NavnodeProps extends NavnodeOptions {
	/**
	 * The ID of the node.
	 */
	id: NodeId;

	/**
	 * The handler for the node.
	 * Either a single handler or an array of handlers. If not provided, the node will use the `defaultHandler`.
	 */
	handler?: NavigationHandler | (NavigationHandler | undefined)[];

	/**
	 * Children can be regular JSX children or a function that receives `NavnodeHandle` as argument and returns children.
	 */
	children?: NavnodeChildren;
}

/**
 * Solid component version of {@link createNavnode}. It takes same options {@link NavnodeOptions} and creates a navigation node.
 * It provides correct navigation context to children so you don't have to use `nav.Context` manually.
 * It can be given function that accepts {@link NavnodeHandle} as children.
 *
 * @see {@link NavnodeProps}
 *
 * @example
 * ```tsx
 * <Navnode id="layout" handler={containerHandler}>
 *   <Sidebar/>
 *   <Content />
 *   <Footer />
 * </Navnode>
 * ```
 */
export function Navnode(props: NavnodeProps): JSX.Element {
	const node = createNavnode(props.id, props.handler, props);

	return <node.Context>{resolveNodeChildren(props.children, node)}</node.Context>;
}

function resolveNodeChildren(children: NavnodeChildren, node: NavnodeHandle): JSX.Element {
	return createMemo(() =>
		typeof children === "function" ? children(node) : children,
	) as unknown as JSX.Element;
}
