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
import { Dynamic, render } from "solid-js/web";

import {
  DevtoolsContext,
  useDevtoolContext,
  type DevtoolsAction,
  type DevtoolsState,
} from "./context.js";
import { NodeDetail } from "./detail.jsx";

import css from "./devtools.module.css";

export function enableDevtools(tree: NavigationTree) {
  const devtoolElement =
    document.querySelector("#fiveway-devtools") ?? document.createElement("div");

  const dispose = render(() => <DevtoolPanel tree={tree} />, devtoolElement);

  if (devtoolElement.id === "") {
    devtoolElement.id = "fiveway-devtools";
    document.body.insertAdjacentElement("beforeend", devtoolElement);
  }

  return () => {
    dispose();
    document.querySelector("#fiveway-devtools")?.remove();
  };
}

function DevtoolPanel(props: { tree: NavigationTree }) {
  const [state, setState] = createStore<DevtoolsState>({
    panelOpen: false,
    expandAll: false,
    inspectedNode: null,
  });

  const handleAction = (action: DevtoolsAction) => {
    switch (action.type) {
      case "openPanel": {
        setState("panelOpen", true);
        break;
      }
      case "closePanel": {
        setState("panelOpen", false);
        break;
      }

      case "toggleExpand": {
        setState("expandAll", (on) => !on);
        break;
      }

      case "inspectNode":
        setState("inspectedNode", action.id);
        break;
    }
  };

  return (
    <DevtoolsContext.Provider value={{ tree: props.tree, state, dispatch: handleAction }}>
      <OpenButton />
      <Show when={state.panelOpen}>
        <Sidebar />
      </Show>
    </DevtoolsContext.Provider>
  );
}

function OpenButton() {
  const devtools = useDevtoolContext();

  return (
    <button
      style={{ display: devtools.state.panelOpen ? "none" : undefined }}
      class={css.openButton}
      onClick={() => devtools.dispatch({ type: "openPanel" })}
    >
      <Icon.SquareTerminal /> fiveway
    </button>
  );
}

function Sidebar() {
  const devtools = useDevtoolContext();

  const [side, setSide] = createSignal("right");
  const root = useNode(devtools.tree, () => "#")!;

  const focusedId = useFocusedId(devtools.tree);

  const detailedNode = useNode(devtools.tree, () => devtools.state.inspectedNode ?? focusedId());

  return (
    <div class={css.sidebar} data-side={side()}>
      <header class={css.sidebarToolbar}>
        <span class={css.title}>
          <Icon.SquareTerminal /> fiveway: devtools
        </span>

        <Dynamic
          component={side() === "left" ? Icon.PanelRightDashed : Icon.PanelLeftDashed}
          onClick={() => setSide((s) => (s === "left" ? "right" : "left"))}
        />

        <Icon.XIcon onClick={() => devtools.dispatch({ type: "closePanel" })} />
      </header>

      <div class={css.tree}>
        <button class={css.nodeTag} onClick={() => devtools.dispatch({ type: "toggleExpand" })}>
          <Dynamic component={devtools.state.expandAll ? Icon.FoldVertical : Icon.UnfoldVertical} />
        </button>

        <VisualizeNode node={root()!} />
      </div>

      <Show keyed when={detailedNode()}>
        {(node) => <NodeDetail node={node} inspect={devtools.state.inspectedNode != null} />}
      </Show>
    </div>
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
      <div class={css.node} data-root={isRoot()} data-focused={isNodeFocused()}>
        <span
          class={css.nodeLabel}
          title={props.node.id}
          onClick={() => devtools.dispatch({ type: "inspectNode", id: props.node.id })}
        >
          {isRoot() ? "# (root)" : getLocalId(props.node.id)}
        </span>

        <span
          style={{
            display: !hasChildren() && isNodeFocused() ? undefined : "none",
          }}
          class={clsx(css.nodeTag, css.nodeTagSuccess)}
        >
          <Icon.Focus /> focus
        </span>

        <Show when={!isNodeFocused() && hasChildren()}>
          <div onClick={() => setOpen((o) => !o)} class={css.nodeTag}>
            <Dynamic component={isOpen() ? Icon.ChevronUp : Icon.Ellipsis} />
          </div>
        </Show>
      </div>
      <Show when={hasChildren()}>
        <div class={css.nodeContainer} data-open={isOpen()}>
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
