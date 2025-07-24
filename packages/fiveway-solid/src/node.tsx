import {
  type Accessor,
  type Component,
  type JSX,
  type ParentProps,
  createEffect,
  createMemo,
  on,
  onCleanup,
  untrack,
} from "solid-js";
import {
  type FocusOptions,
  type NavigationHandler,
  type NodeId,
  insertNode,
  createNode,
  focusNode,
  scopedId,
  selectNode,
  updateNode,
  holdFocus,
  createGlobalId,
} from "@fiveway/core";
import { useNavigationContext, NavigationContext } from "./context.jsx";
import { useIsFocused, useOnFocus } from "./hooks.jsx";

export type NodeOptions = {
  id: NodeId | Accessor<NodeId>;
  parent?: NodeId | Accessor<NodeId | undefined>;
  order?: number | Accessor<number | undefined>;
  handler?: NavigationHandler;
};

export type NodeHandle = {
  (): NodeId;
  focus: (nodeId?: NodeId) => void;
  select: () => void;
  isFocused: Accessor<boolean>;
  onFocus: (fn: () => void) => void;
  Context: Component<ParentProps>;
};

export function createNavigationNode(options: NodeOptions): NodeHandle {
  const { tree, parentNode } = useNavigationContext();

  const localId = () =>
    typeof options.id === "function" ? options.id() : options.id;

  const globalId = () => createGlobalId(parent(), localId());

  const parent = () => {
    const fromContext = parentNode();
    // if (fromContext == null) {
    //   console.warn("parent node not found in context", id());
    // }

    if (typeof options.parent === "function") {
      return options.parent() ?? fromContext;
    }

    return options.parent ?? fromContext;
  };

  const order = () =>
    typeof options.order === "function" ? options.order() : options.order;

  const node = createMemo(() => {
    return createNode({
      parent: parent(),
      id: localId(),
      handler: options.handler,
      order: untrack(order),
    });
  });

  const updatable = () => ({
    handler: options.handler,
    order: order(),
  });

  createEffect(() => {
    // to resolve initial focus correctly, it needs to be held while child nodes get inserted
    // child (and sibling) effects should run synchronously after this one
    // after they are done Promise.resolve() should release the focus
    const releaseFocus = holdFocus(tree);

    const n = node();

    // prettier-ignore
    createEffect(on(updatable, (options) => {
      updateNode(n, options);
    }, { defer: true }));

    const cleanupNode = insertNode(tree, n);
    onCleanup(cleanupNode);

    if (releaseFocus) {
      Promise.resolve().then(releaseFocus);
    }
  });

  const focus = (nodeId?: NodeId, options?: FocusOptions) => {
    const id = nodeId != null ? scopedId(node().id, nodeId) : node().id;
    return focusNode(tree, id, options);
  };

  const select = (nodeId?: NodeId) => {
    const id = nodeId != null ? scopedId(node().id, nodeId) : node().id;
    selectNode(tree, id);
  };

  // workaround for: https://github.com/solidjs/solid/issues/2352
  // reding from node() was returning undefined
  const handle = () => globalId();

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

export type NodeProps = NodeOptions & {
  children?: JSX.Element;
};

export function NavigationNode(props: NodeProps) {
  const node = createNavigationNode(props);

  return <node.Context>{props.children}</node.Context>;
}
