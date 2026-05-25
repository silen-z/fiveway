import {
	type NodeId,
	type NavigationTree,
	type CreatedNavigationNode,
	type FocusNodeOptions,
	type ActivateNodeOptions,
	updateNode,
	insertNode,
	removeNode,
	createNode,
	isFocused,
	registerFocusListener,
	focusNode,
	activateNode,
	joinId,
	composeHandlers,
	type NavigationHandler,
} from "@fiveway/core";
import {
	type ReactNode,
	useRef,
	useEffect,
	useCallback,
	useSyncExternalStore,
	useState,
} from "react";

import { NavigationContext, useNavigationContext } from "./context.tsx";

/**
 * Options for {@link useNavnode}.
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
 * Navigation node handle returned by {@link useNavnode}.
 */
export interface NavnodeHandle {
	/**
	 * The ID of the node.
	 */
	id: NodeId;

	/**
	 * Function that returns whether the node is currently focused.
	 */
	isFocused: () => boolean;

	/**
	 * Function for focusing the node.
	 */
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;

	/**
	 * Function for activating the node.
	 */
	activate: (nodeId?: NodeId, options?: ActivateNodeOptions) => void;

	/**
	 * React context provider that sets this node as parent for its children.
	 */
	Context: React.FunctionComponent<{ children: ReactNode }>;
}

const NULL_NODE = {} as CreatedNavigationNode;

/**
 * React hook that creates a navigation node and returns a handle for it.
 * When creating container nodes, returned `Context` must be used to provide this node as parent to children nodes.
 *
 * @param id - The ID of the node.
 * @param handler - The handler for the node. Either a single handler or an array of handlers. If not provided, the node will use the `defaultHandler`.
 * @param options - The options for the node.
 *
 * @see {@link NavnodeOptions}
 * @see {@link NavnodeHandle}
 *
 * @example
 * ```tsx
 * const nav = useNavnode("layout", containerHandler);
 * return (
 *   <nav.Context>
 *     <Sidebar/>
 *     <Content />
 *     <Footer />
 *   </nav.Context>
 * );
 * ```
 */
export function useNavnode(
	id: NodeId,
	handler?: NavigationHandler | (NavigationHandler | undefined)[],
	options: NavnodeOptions = {},
): NavnodeHandle {
	const { tree, parentNode } = useNavigationContext();
	const parent = options.parent ?? parentNode;

	handler = Array.isArray(handler) ? composeHandlers(handler) : handler;

	const nodeRef = useRef(NULL_NODE);
	if (nodeRef.current === NULL_NODE || nodeRef.current.parent !== parent) {
		nodeRef.current = createNode({
			id,
			parent,
			handler,
			order: options.order,
		});
	} else {
		updateNode(nodeRef.current, { handler, order: options.order });
	}
	const nodeId = nodeRef.current.id;

	useEffect(() => {
		insertNode(tree, nodeRef.current);

		return () => {
			removeNode(tree, nodeId);
		};
	}, [tree, nodeId]);

	const isFocused = useLazyIsFocused(tree, nodeId);

	const focus = (target?: NodeId, options?: FocusNodeOptions) => {
		const id = target != null ? joinId(nodeId, target) : nodeId;
		focusNode(tree, id, options);
	};

	const activate = (target?: NodeId, options?: ActivateNodeOptions) => {
		const id = target != null ? joinId(nodeId, target) : nodeId;
		activateNode(tree, id, options);
	};

	const Context: NavnodeHandle["Context"] = useCallback(
		(props: { children: ReactNode }) => {
			const context = {
				tree: tree,
				parentNode: nodeId,
			};

			return (
				<NavigationContext.Provider value={context}>{props.children}</NavigationContext.Provider>
			);
		},
		[tree, nodeId],
	);

	Context.displayName = "NodeContext";

	return { id: nodeId, isFocused, focus, activate, Context };
}

type NavnodeChildren = ReactNode | ((nav: NavnodeHandle) => ReactNode);

/**
 * Props for {@link Navnode} component.
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
	 * Children can be regular react children or function that receives `NavnodeHandle` as argument and returns children.
	 */
	children?: NavnodeChildren;
}

/**
 * React component version of {@link useNavnode}. It takes same options {@link NavnodeOptions} and creates a navigation node.
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
export function Navnode({ children, ...props }: NavnodeProps): ReactNode {
	const nav = useNavnode(props.id, props.handler, props);
	return <nav.Context>{typeof children === "function" ? children(nav) : children}</nav.Context>;
}

function useLazyIsFocused(tree: NavigationTree, nodeId: NodeId): () => boolean {
	const [subscribed, setSubscribed] = useState(false);

	const subscribe = useCallback(
		(handler: () => void) => registerFocusListener(tree, nodeId, handler),
		[tree, nodeId],
	);

	const subscribedValue = useSyncExternalStore(subscribed ? subscribe : noopSubscribe, () =>
		isFocused(tree, nodeId),
	);

	return () => {
		if (!subscribed) {
			setSubscribed(true);
		}

		return subscribedValue;
	};
}

function noopSubscribe() {
	return () => {};
}
