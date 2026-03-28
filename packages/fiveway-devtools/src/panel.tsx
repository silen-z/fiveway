import { type NavigationTree, inspector } from "@fiveway/core";
import { MainPanel, ThemeContextProvider, type TanStackDevtoolsTheme } from "@tanstack/devtools-ui";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";

import { Inspector } from "./inspector.jsx";

import devtoolsCss from "./devtools.css?inline";

interface DevtoolsProps {
  theme: TanStackDevtoolsTheme;
}

export default function Devtools(props: DevtoolsProps) {
  return (
    <ThemeContextProvider theme={props.theme}>
      <FivewayDevtoolsPanel />
    </ThemeContextProvider>
  );
}

function FivewayDevtoolsPanel() {
  const [knownTrees, setKnownTrees] = createSignal<NavigationTree[]>([]);

  const [selectedTree, setSelectedTree] = createSignal<number>(0);

  const activeTree = createMemo(() => knownTrees()[selectedTree()] ?? null);

  createEffect(() => {
    document.head.insertAdjacentHTML("beforeend", `<style>${devtoolsCss}</style>`);

    const unsubUpdate = inspector.on("tree-update", (e) => {
      console.log(e);
      const { tree } = e.payload;

      setKnownTrees((known) => {
        return known.some((t) => t.label === tree.label) ? known : [...known, tree];
      });
    });

    const unsubUnmount = inspector.on("tree-unmount", (e) => {
      const { tree } = e.payload;
      setKnownTrees((prev) => prev.filter((t) => tree !== t));
    });

    return () => {
      unsubUpdate();
      unsubUnmount();
    };
  });

  return (
    <MainPanel>
      <div>
        <Show when={knownTrees().length > 1}>
          <TreeSelector
            trees={knownTrees()}
            value={selectedTree()}
            onSelectTree={(tree) => {
              setSelectedTree(tree);
            }}
          />
        </Show>

        <Show when={activeTree()} fallback={<NoTreesDetected />} keyed>
          {(tree) => <Inspector tree={tree} />}
        </Show>
      </div>
    </MainPanel>
  );
}

function TreeSelector(props: {
  trees: NavigationTree[];
  value: number;
  onSelectTree: (idx: number) => void;
}) {
  return (
    <div class="devtoolsHeader">
      <div class="devtoolsTreeSelect">
        <label for="fiveway-tree-select">Active tree (inspect)</label>
        <select
          id="fiveway-tree-select"
          class="devtoolsTreeSelectControl"
          value={props.value}
          onChange={(e) => {
            const i = Number(e.currentTarget.value);
            const trees = props.trees;
            const chosen = trees[i];
            if (chosen != null) {
              props.onSelectTree(i);
            }
          }}
        >
          <For each={props.trees}>
            {(tree, idx) => (
              <option value={String(idx())}>
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
    <div class="no-trees-detected">
      <p>No trees detected</p>
      <p>Activity like focus or change of tree structure will be detected and displayed here.</p>
    </div>
  );
}
