import type { NavigationAction } from "@fiveway/core";
import * as Icon from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { type InspectedTree, useDevtoolsContext } from "../context.ts";
import { NavigationPad } from "./NavigationPad.tsx";
import { TreeNode } from "./TreeNode.tsx";

import styles from "./TreeInspector.module.css";

export function TreeInspector(props: { tree: InspectedTree }) {
  const devtools = useDevtoolsContext();

  const [navOpen, setNavOpen] = createSignal(false);

  const sendNav = (action: NavigationAction) => {
    devtools.sendCommand({
      kind: "handleAction",
      tree: props.tree.label,
      action,
    });
  };

  return (
    <div class={styles.inspector}>
      <div class={styles.inspectedNode}>
        <div class={styles.inspectorToolbar}>
          <span class={styles.toolbarBrandRow}>
            <svg
              class={styles.toolbarBrandLogo}
              width="64"
              height="64"
              viewBox="0 0 64 64"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(-31.011 -49.194)">
                <path
                  d="m46.593 52.34-6.9879 32.91c-0.22759 1.0721 0.59003 2.0816 1.686 2.0816l13.344-7.93e-4 0.64894-3.0564 6.9191 0.09321 5.0805 9.462-9.0392 9.1832-6.9364-0.0125 0.72916-3.4341-13.344 0.0011c-1.2407 0-2.3123 0.86788-2.5701 2.0815l-1.7841 8.4011c-0.2276 1.072 0.58992 2.0815 1.6859 2.0815h40.834c1.2407 0 2.3122-0.86793 2.5699-2.0816l6.9796-32.873c0.2276-1.0721-0.59002-2.0815-1.686-2.0816l-13.462-9e-4 -0.78913 3.7169-7.0861-0.01625-4.5957-11.037 8.7398-8.4812 7.0795 0.04672-0.65307 3.076 13.462 9e-4c1.2407 8.9e-5 2.3121-0.86799 2.5697-2.0816l1.6933-7.9801c0.22761-1.0722-0.59023-2.0816-1.6863-2.0816h-40.832c-1.2407 0-2.3123 0.86793-2.57 2.0816z"
                  fill="#f43f5e"
                  opacity=".995"
                />
              </g>
            </svg>
            <span class={styles.toolbarBrand}>fiveway</span>
          </span>
          <div class={styles.toolbarActions}>
            <button
              type="button"
              class={styles.toolbarIconButton}
              title={navOpen() ? "Hide navigation controls" : "Show navigation controls"}
              aria-expanded={navOpen()}
              aria-controls={navOpen() ? "fiveway-nav-pad" : undefined}
              onClick={() => setNavOpen((o) => !o)}
            >
              <Icon.Gamepad2 size={18} />
            </button>
            <Show when={Object.keys(devtools.trees).length > 1}>
              <select
                class={styles.inspectorTreeSelect}
                aria-label="Active tree"
                value={props.tree.label}
                onChange={(e) => {
                  devtools.selectTree(e.currentTarget.value);
                }}
              >
                <For each={Object.values(devtools.trees)}>
                  {(t, idx) => (
                    <option value={t.label}>
                      #{idx() + 1}. {t.label}
                    </option>
                  )}
                </For>
              </select>
            </Show>
          </div>
        </div>

        <div class={styles.inspectorStatus} aria-live="polite">
          <span class={styles.inspectorStatusLabel}>Focus</span>
          <span class={styles.inspectorStatusValue}>{props.tree.focus ?? "—"}</span>
        </div>

        <Show when={navOpen()}>
          <NavigationPad onAction={sendNav} />
        </Show>

        <div class={styles.tree}>
          <TreeNode tree={props.tree} node="#" />
        </div>
      </div>
    </div>
  );
}
