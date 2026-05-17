import {
	type NodeId,
	type NavigationHandler,
	type FocusNodeOptions,
	type SelectNodeOptions,
	type CreatedNavigationNode,
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

export type NavOptions = {
	parent?: NodeId;
	order?: number;
};

export type Nav = {
	id: NodeId;
	isFocused: () => boolean;
	focus: (nodeId?: NodeId, options?: FocusNodeOptions) => void;
	select: (nodeId?: NodeId, options?: SelectNodeOptions) => void;
	Context: React.FunctionComponent<{ children: ReactNode }>;
};

const NULL_NODE = {} as CreatedNavigationNode;

export function useNav(id: NodeId, handler?: NavigationHandler, options: NavOptions = {}): Nav {
	const { tree, parentNode } = useNavigationContext();
	const parent = options.parent ?? parentNode;

	const nodeRef = useRef(NULL_NODE);
	if (nodeRef.current === NULL_NODE) {
		nodeRef.current = createNode({
			id,
			parent,
			handler,
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
		focusNode(tree, id, options);
	};

	const select = (target?: NodeId, options?: SelectNodeOptions) => {
		const id = target != null ? joinId(nodeId, target) : nodeId;
		selectNode(tree, id, options);
	};

	const Context: Nav["Context"] = useCallback(
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

export type NavProps = NavOptions & {
	id: NodeId;
	handler?: NavigationHandler;
	children?: ReactNode | ((props: Omit<Nav, "Context">) => ReactNode);
};

export function Nav({ children, ...props }: NavProps): ReactNode {
	const { Context, ...node } = useNav(props.id, props.handler, props);

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
