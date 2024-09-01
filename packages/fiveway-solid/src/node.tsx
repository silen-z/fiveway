import {
  type Accessor,
  type Component,
  type JSX,
  type ParentProps,
  children,
  createEffect,
  onCleanup,
  splitProps,
  untrack,
} from "solid-js";
import {
  type FocusOptions,
  type NavigationHandler,
  type NodeId,
  insertNode,
  createNode,
  focusNode,
  removeNode,
  scopedId,
  selectNode,
  updateNode,
} from "@fiveway/core";
import { useNavigationContext, NavigationContext } from "./context.jsx";

import { useIsFocused } from "./hooks.jsx";

export type NodeOptions = {
  id: NodeId;
  parent?: NodeId;
  order?: number;
  handler?: NavigationHandler;
};

export type NodeHandle = {
  id: NodeId;
  isFocused: Accessor<boolean>;
  focus: (nodeId?: NodeId) => void;
  select: () => void;
  Context: Component<ParentProps>;
};

export function createNavigationNode(options: NodeOptions): NodeHandle {
  const { tree, parentNode } = useNavigationContext();

  const node = createNode({
    id: options.id,
    parent: options.parent ?? parentNode,
    order: options.order,
    handler: options.handler,
  });

  createEffect(() => {
    insertNode(tree, node);

    createEffect(() => {
      updateNode(node, options);
    });

    onCleanup(() => {
      removeNode(tree, node.id);
    });
  });

  return {
    id: node.id,
    isFocused: useIsFocused(node.id),
    focus: (nodeId?: NodeId, options?: FocusOptions) => {
      return focusNode(
        tree,
        nodeId != null ? scopedId(parentNode, nodeId) : node.id,
        options,
      );
    },
    select: (nodeId?: NodeId) => {
      selectNode(tree, nodeId != null ? scopedId(parentNode, nodeId) : node.id);
    },
    Context: (props: ParentProps) => (
      <NodeContext node={node.id}>{props.children}</NodeContext>
    ),
  };
}

export type NodeProps = NodeOptions & {
  children?: ((node: Omit<NodeHandle, "Context">) => JSX.Element) | JSX.Element;
};

export function NavigationNode(props: NodeProps) {
  const [, options] = splitProps(props, ["children"]);
  const { Context, ...node } = createNavigationNode(options);

  return (
    <Context>
      {children(() => {
        const child = props.children;

        return typeof child === "function" ? child(node) : child;
      })()}
    </Context>
  );
}

function NodeContext(props: { node: NodeId; children: JSX.Element }) {
  const context = useNavigationContext();
  const parentNode = untrack(() => props.node);

  return (
    <NavigationContext.Provider value={{ ...context, parentNode }}>
      {props.children}
    </NavigationContext.Provider>
  );
}
