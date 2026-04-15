import type { InspectorCommand } from "@fiveway/core";
import { isParent } from "@fiveway/core";
import { clsx } from "clsx";
import * as Icon from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { render, Dynamic } from "solid-js/web";

import { createDevtoolsState, type InspectedTree, type InspetorInit } from "./state.js";

import styles from "./devtools.module.css";

export function createInspector(el: HTMLElement, handle: InspetorInit) {
  render(() => <Inspector handle={handle} />, el);
}

function Inspector(props: { handle: InspetorInit }) {
  const state = createDevtoolsState(props.handle);

  const [selectedTree, setSelectedTree] = createSignal<string | null>(null);
  const [expandAll, setExpandAll] = createSignal(false);

  const activeTree = createMemo(() => {
    const label = selectedTree();
    if (label == null) {
      return Object.values(state.trees)[0] ?? null;
    }

    return state.trees[label] ?? null;
  });

  return (
    <div class={styles.panel}>
      <Show when={Object.keys(state.trees).length > 1}>
        <TreeSelector
          trees={state.trees}
          value={selectedTree()}
          onSelectTree={(tree) => {
            setSelectedTree(tree);
          }}
        />
      </Show>

      <Show when={activeTree()} fallback={<NoTreesDetected />} keyed>
        {(tree) => (
          <TreeInspector
            tree={tree}
            expandAll={expandAll()}
            setExpandAll={setExpandAll}
            sendCommand={props.handle.sendCommand}
          />
        )}
      </Show>
    </div>
  );
}

function TreeInspector(props: {
  tree: InspectedTree;
  expandAll: boolean;
  setExpandAll: (value: boolean) => void;
  sendCommand: (command: InspectorCommand) => void;
}) {
  return (
    <div class={styles.inspector}>
      <div class={styles.inspectedNode}>
        <div class={styles.inspectedName}>
          {props.tree.label} · focus: {props.tree.focus}
        </div>
        <div class={styles.tree}>
          <button
            type="button"
            class={styles.nodeTag}
            title={props.expandAll ? "Collapse all" : "Expand all"}
            onClick={() => props.setExpandAll(!props.expandAll)}
          >
            <Dynamic component={props.expandAll ? Icon.FoldVertical : Icon.UnfoldVertical} />
          </button>

          <Node
            tree={props.tree}
            node="#"
            expandAll={props.expandAll}
            sendCommand={props.sendCommand}
          />
        </div>
      </div>
    </div>
  );
}

function TreeSelector(props: {
  trees: Record<string, InspectedTree>;
  value: string | null;
  onSelectTree: (label: string) => void;
}) {
  return (
    <div class={styles.devtoolsHeader}>
      <div class={styles.devtoolsTreeSelect}>
        <label for="fiveway-tree-select">Active tree (inspect)</label>
        <select
          id="fiveway-tree-select"
          class={styles.devtoolsTreeSelectControl}
          value={props.value ?? ""}
          onChange={(e) => {
            const label = e.currentTarget.value;
            if (label != null) {
              props.onSelectTree(label);
            }
          }}
        >
          <For each={Object.values(props.trees)}>
            {(tree, idx) => (
              <option value={tree.label}>
                #{idx() + 1}. {tree.label}
              </option>
            )}
          </For>
        </select>
      </div>
    </div>
  );
}

function NoTreesDetected() {
  return (
    <div class={styles.noTreesDetected}>
      <p>No trees detected</p>
      <p>Activity like focus or change of tree structure will be detected and displayed here.</p>
    </div>
  );
}

function Node(props: {
  tree: InspectedTree;
  node: string;
  expandAll: boolean;
  sendCommand: (command: InspectorCommand) => void;
}) {
  const [isNodeOpen, setOpen] = createSignal(false);

  const hasChildren = createMemo(() => (props.tree.nodes[props.node]?.children ?? []).length > 0);

  const isRoot = () => props.node === "#";

  const isOnFocusPath = createMemo(() => {
    const fid = props.tree.focus;
    if (fid == null) {
      return false;
    }
    return fid === props.node || isParent(props.node, fid);
  });

  const isOpen = createMemo(() => isNodeOpen() || isOnFocusPath() || props.expandAll);

  const isLeafFocused = createMemo(
    () => props.tree.focus != null && props.tree.focus === props.node && !hasChildren(),
  );

  return (
    <div>
      <div
        class={styles.node}
        data-root={isRoot() ? "true" : "false"}
        data-focused={isOnFocusPath() ? "true" : "false"}
      >
        <span
          class={styles.nodeLabel}
          title={props.node}
          onClick={() =>
            props.sendCommand({ kind: "focus", tree: props.tree.label, node: props.node })
          }
        >
          {isRoot() ? "# (root)" : localId(props.node)}
        </span>

        <Show when={isLeafFocused()}>
          <span class={clsx(styles.nodeTag, styles.nodeTagSuccess)}>
            <Icon.Focus /> focus
          </span>
        </Show>

        <Show when={!isOnFocusPath() && hasChildren()}>
          <button
            type="button"
            class={styles.nodeTag}
            title={isOpen() ? "Collapse" : "Expand"}
            onClick={() => setOpen((o) => !o)}
          >
            <Dynamic component={isOpen() ? Icon.ChevronUp : Icon.Ellipsis} />
          </button>
        </Show>
      </div>

      <Show when={hasChildren()}>
        <div class={styles.nodeContainer} data-open={isOpen() ? "true" : "false"}>
          <For each={props.tree.nodes[props.node]?.children ?? []}>
            {(nodeId) => (
              <Node
                tree={props.tree}
                node={nodeId}
                expandAll={props.expandAll}
                sendCommand={props.sendCommand}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function localId(nodeId: string) {
  return nodeId.split("/").pop() ?? nodeId;
}
