import {
	type NodeId,
	type NavigationHandler,
	type FocusNodeOptions,
	type SelectNodeOptions,
	type CreatedNavtreeNode,
	updateNode,
	insertNode,
	removeNode,
	createNode,
	isFocused,
	registerListener,
	type NavigationTree,
	focusNode,
	selectNode,
	joinId,
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

export type NavigationNodeOptions = {
	id: NodeId;
	parent?: NodeId;
	order?: number;
	handler?: NavigationHandler;
};

export type NavigationNodeHandle = {
	id: NodeId;
	isFocused: () => boolean;
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;
	select: (nodeId?: NodeId, options?: SelectNodeOptions) => void;
	Context: React.FunctionComponent<{ children: ReactNode }>;
};

const NULL_NODE = {} as CreatedNavtreeNode;

export function useNavigationNode(options: NavigationNodeOptions): NavigationNodeHandle {
	const { tree, parentNode } = useNavigationContext();
	const parent = options.parent ?? parentNode;

	const nodeRef = useRef(NULL_NODE);
	if (nodeRef.current === NULL_NODE) {
		nodeRef.current = createNode({
			id: options.id,
			parent,
			handler: options.handler,
			order: options.order,
		});
	} else {
		updateNode(nodeRef.current, options);
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
		return focusNode(tree, id, options);
	};

	const select = (target?: NodeId, options?: SelectNodeOptions) => {
		const id = target != null ? joinId(nodeId, target) : nodeId;
		selectNode(tree, id, options);
	};

	const Context: NavigationNodeHandle["Context"] = useCallback(
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

	return { id: nodeId, isFocused, focus, select, Context };
}

export type NavigationNodeProps = NavigationNodeOptions & {
	children?: ReactNode | ((props: Omit<NavigationNodeHandle, "Context">) => ReactNode);
};

export function NavigationNode({ children, ...props }: NavigationNodeProps): ReactNode {
	const { Context, ...node } = useNavigationNode(props);

	return <Context>{typeof children === "function" ? children(node) : children}</Context>;
}

// lazy isFocused hook to avoid subscribing to focus when not needed
function useLazyIsFocused(tree: NavigationTree, nodeId: NodeId): () => boolean {
	const [subscribed, setSubscribed] = useState(false);

	const subscribe = useCallback(
		(handler: () => void) => registerListener(tree, nodeId, handler),
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
