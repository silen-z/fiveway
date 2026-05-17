import {
	type FocusNodeOptions,
	type SelectNodeOptions,
	type NavigationHandler,
	type NodeId,
	insertNode,
	createNode,
	focusNode,
	joinId,
	selectNode,
	updateNode,
	holdFocus,
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

export type NavOptions = {
	order?: number;
	parent?: NodeId;
};

export type Nav = {
	(): NodeId;
	isFocused: Accessor<boolean>;
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;
	select: (nodeId?: NodeId, options?: SelectNodeOptions) => void;
	onFocus: (fn: () => void) => void;
	Context: Component<ParentProps>;
};

export function createNav(
	id: NodeId | Accessor<NodeId>,
	handler?: NavigationHandler,
	options: NavOptions = {},
): Nav {
	const { tree, parentNode } = useNavigationContext();

	const parent = () => options.parent ?? parentNode();

	const localId = () => (typeof id === "function" ? id() : id);

	const nodeId = () => joinId(parent(), localId());

	const node = createMemo(() => {
		return createNode({
			parent: parent(),
			id: localId(),
			handler,
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

	const select = (nodeId?: NodeId, options?: SelectNodeOptions) => {
		const id = nodeId != null ? joinId(node().id, nodeId) : node().id;
		selectNode(tree, id, options);
	};

	// workaround for: https://github.com/solidjs/solid/issues/2352
	// reding from node() was returning undefined
	const handle = () => nodeId();

	handle.focus = focus;
	handle.select = select;
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

type NavChildren = JSX.Element | ((props: Omit<Nav, "Context">) => JSX.Element);

export type NavProps = NavOptions & {
	id: NodeId;
	handler?: NavigationHandler;
	children?: NavChildren;
};

export function Nav(props: NavProps): JSX.Element {
	const node = createNav(props.id, props.handler, props);

	return <node.Context>{resolveNodeChildren(props.children, node)}</node.Context>;
}

function resolveNodeChildren(children: NavChildren, node: Nav): JSX.Element {
	return createMemo(() =>
		typeof children === "function" ? children(node) : children,
	) as unknown as JSX.Element;
}
