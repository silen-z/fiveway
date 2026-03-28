import {
  type NavtreeNode,
  type NavigationTree,
  type NodeId,
  isParent,
  registerListener,
} from "@fiveway/core";
import { clsx } from "clsx";
import * as Icon from "lucide-solid";
import { createEffect, createMemo, createSignal, For, onCleanup, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { DevtoolsContext, type DevtoolsAction, type DevtoolsState } from "./context.js";
import { NodeDetail } from "./detail.jsx";

export function Inspector(props: { tree: NavigationTree }) {
  const [state, setState] = createStore<DevtoolsState>({
    expandAll: false,
    inspectedNode: null,
  });

  const handleAction = (action: DevtoolsAction) => {
    switch (action.type) {
      case "toggleExpand": {
        setState("expandAll", (on) => !on);
        break;
      }

      case "inspectNode":
        setState("inspectedNode", action.id);
        break;
    }
  };

  const root = useNode(props.tree, () => "#")!;
  const focusedId = useFocusedId(props.tree);
  const detailedNode = useNode(props.tree, () => state.inspectedNode ?? focusedId());

  return (
    <DevtoolsContext.Provider value={{ tree: props.tree, state, dispatch: handleAction }}>
      <div class="inspector">
        <div class="tree">
          <button class="nodeTag" onClick={() => handleAction({ type: "toggleExpand" })}>
            <Dynamic component={state.expandAll ? Icon.FoldVertical : Icon.UnfoldVertical} />
          </button>

          <VisualizeNode node={root()!} />
        </div>

        <Show keyed when={detailedNode()}>
          {(node) => <NodeDetail node={node} inspect={state.inspectedNode != null} />}
        </Show>
      </div>
    </DevtoolsContext.Provider>
  );
}

function VisualizeNode(props: { node: NavtreeNode }) {
  const devtools = useContext(DevtoolsContext)!;

  const isNodeFocused = useIsFocused(devtools.tree, props.node.id);
  const [isNodeOpen, setOpen] = createSignal(false);

  const isOpen = createMemo(() => isNodeOpen() || isNodeFocused() || devtools.state.expandAll);
  const hasChildren = createMemo(() => props.node.children.some((c) => c.active));

  const isRoot = () => props.node.id === "#";
  return (
    <div>
      <div class="node" data-root={isRoot()} data-focused={isNodeFocused()}>
        <span
          class="nodeLabel"
          title={props.node.id}
          onClick={() => devtools.dispatch({ type: "inspectNode", id: props.node.id })}
        >
          {isRoot() ? "# (root)" : getLocalId(props.node.id)}
        </span>

        <span
          style={{
            display: !hasChildren() && isNodeFocused() ? undefined : "none",
          }}
          class={clsx("nodeTag", "nodeTagSuccess")}
        >
          <Icon.Focus /> focus
        </span>

        <Show when={!isNodeFocused() && hasChildren()}>
          <div onClick={() => setOpen((o) => !o)} class="nodeTag">
            <Dynamic component={isOpen() ? Icon.ChevronUp : Icon.Ellipsis} />
          </div>
        </Show>
      </div>
      <Show when={hasChildren()}>
        <div class="nodeContainer" data-open={isOpen()}>
          <For each={props.node.children}>
            {(child) => {
              const node = useNode(devtools.tree, () => child.id);
              return <Show when={node()}>{(n) => <VisualizeNode node={n()} />}</Show>;
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}

function useNode(tree: NavigationTree, id: () => NodeId) {
  const [node, setNode] = createSignal<NavtreeNode | undefined>(tree.nodes.get(id()), {
    equals: () => false,
  });

  createEffect(() => {
    const watchedId = id();

    setNode(tree.nodes.get(watchedId));

    const cleanup = onCleanup(
      registerListener(tree, watchedId, "structurechange", (e) => {
        if (e.id === watchedId || isParent(watchedId, e.id)) {
          setNode(tree.nodes.get(watchedId));
        }
      }),
    );

    onCleanup(cleanup);
  });

  return node;
}

function useIsFocused(tree: NavigationTree, id: NodeId) {
  const focusedId = useFocusedId(tree, id);

  return () => focusedId() === id || isParent(id, focusedId());
}

function useFocusedId(tree: NavigationTree, listenOn: NodeId = "#") {
  const [nodeId, setNodeId] = createSignal(tree.focusedId);

  createEffect(() => {
    const cleanup = registerListener(tree, listenOn, "focuschange", () => {
      setNodeId(tree.focusedId);
    });
    onCleanup(cleanup);
  });

  return nodeId;
}

function getLocalId(id: NodeId) {
  return id.substring(id.lastIndexOf("/") + 1);
}
