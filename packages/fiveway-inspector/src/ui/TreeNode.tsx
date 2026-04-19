import { isParent } from "@fiveway/core";
import { clsx } from "clsx";
import * as Icon from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";

import { type InspectedTree, useDevtoolsContext } from "../context.js";

import styles from "./TreeNode.module.css";

export function TreeNode(props: { tree: InspectedTree; node: string }) {
  const devtools = useDevtoolsContext();

  const isRoot = () => props.node === "#";

  const node = createMemo(() => props.tree.nodes[props.node]);

  const [isNodeExpanded, setExpanded] = createSignal(false);

  const isFocused = createMemo(() => {
    if (props.tree.focus == null) {
      return false;
    }
    return props.tree.focus === props.node || isParent(props.node, props.tree.focus);
  });

  const isExpanded = createMemo(() => props.tree.expanded || isNodeExpanded() || isFocused());

  const isInspected = createMemo(() => (props.tree.inspected ?? "#") === props.node);

  const childCount = createMemo(() => node()?.children.length ?? 0);

  const focusNode = () => {
    devtools.sendCommand({
      kind: "handleAction",
      tree: props.tree.label,
      node: props.node,
      action: { kind: "focus", direction: null },
    });
  };

  return (
    <div>
      <div
        class={styles.node}
        data-root={isRoot() ? "true" : "false"}
        data-focused={isFocused() ? "true" : "false"}
        data-inspected={isInspected() ? "true" : "false"}
        data-children={childCount() > 0 ? "true" : "false"}
      >
        <span
          class={styles.nodeLabel}
          title={props.node}
          onClick={(e) => {
            if (e.ctrlKey) {
              focusNode();
              return;
            }

            devtools.inspectNode(props.node);
            if (childCount() > 0) {
              setExpanded((o) => !o);
            }
          }}
        >
          <Show
            when={childCount() > 0}
            fallback={
              <div class={styles.nodeKindIcon} aria-hidden="true">
                <Icon.CircleDot size={14} />
              </div>
            }
          >
            <span class={styles.nodeChevron} aria-hidden="true">
              {isExpanded() ? <Icon.ChevronDown size={14} /> : <Icon.ChevronRight size={14} />}
            </span>
          </Show>

          <span class={styles.nodeLabelText}>{isRoot() ? "# (root)" : localId(props.node)}</span>
        </span>

        <div class={styles.nodeActions}>
          <Show when={isRoot()}>
            <ExpandButton expanded={props.tree.expanded} onToggle={devtools.toggleExpand} />
          </Show>
          <Show when={!isFocused() && childCount() > 0}>
            <ExpandButton expanded={isExpanded()} onToggle={() => setExpanded((o) => !o)} />
          </Show>
          <Show when={!isFocused()}>
            <button
              type="button"
              class={clsx(styles.nodeActionButton, styles.nodeActionButtonRevealOnHover)}
              title="Focus this node in the app"
              aria-label="Focus in app"
              onClick={() => focusNode()}
            >
              <Icon.Focus size={14} />
            </button>
          </Show>
          <Show when={props.tree.focus === props.node}>
            <span
              class={styles.nodeFocusIndicator}
              title="Focused in app"
              role="img"
              aria-label="Focused in app"
            >
              <Icon.Focus size={14} />
            </span>
          </Show>
        </div>
      </div>

      <Show when={childCount() > 0}>
        <div class={styles.nodeContainer} data-open={isExpanded() ? "true" : "false"}>
          <For each={props.tree.nodes[props.node]?.children ?? []}>
            {(nodeId) => <TreeNode tree={props.tree} node={nodeId} />}
          </For>
        </div>
      </Show>
    </div>
  );
}

function ExpandButton(props: { expanded: boolean; onToggle: () => void }) {
  const label = () => (props.expanded ? "Collapse" : "Expand");

  return (
    <button
      type="button"
      class={clsx(styles.nodeActionButton, styles.nodeActionButtonRevealOnHover)}
      title={label()}
      aria-pressed={props.expanded}
      aria-label={label()}
      onClick={() => props.onToggle()}
    >
      {props.expanded ? <Icon.FoldVertical size={14} /> : <Icon.UnfoldVertical size={14} />}
    </button>
  );
}

function localId(nodeId: string) {
  return nodeId.split("/").pop() ?? nodeId;
}
