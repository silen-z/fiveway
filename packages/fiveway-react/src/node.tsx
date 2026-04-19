import {
  type NodeId,
  type NavigationHandler,
  type FocusOptions,
  type SelectOptions,
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

export type NodeOptions = {
  id: NodeId;
  parent?: NodeId;
  order?: number;
  handler?: NavigationHandler;
};

export type NodeHandle = {
  id: NodeId;
  isFocused: () => boolean;
  focus: (nodeId?: NodeId, options?: FocusOptions) => void;
  select: (nodeId?: NodeId, options?: SelectOptions) => void;
  Context: React.FunctionComponent<{ children: ReactNode }>;
};

const NULL_NODE = {} as CreatedNavtreeNode;

export function useNavigationNode(options: NodeOptions): NodeHandle {
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

  const focus = (target?: NodeId, options?: FocusOptions) => {
    const id = target != null ? joinId(nodeId, target) : nodeId;
    return focusNode(tree, id, options);
  };

  const select = (target?: NodeId, options?: SelectOptions) => {
    const id = target != null ? joinId(nodeId, target) : nodeId;
    selectNode(tree, id, options);
  };

  const Context: NodeHandle["Context"] = useCallback(
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

export type NodeProps = NodeOptions & {
  children?: ReactNode | ((props: Omit<NodeHandle, "Context">) => ReactNode);
};

export function NavigationNode({ children, ...props }: NodeProps): ReactNode {
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
