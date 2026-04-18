import { Show } from "solid-js";

import { useDevtoolsContext } from "./context.js";
import { TreeInspector } from "./TreeInspector.js";

import styles from "./InspectorPanel.module.css";

export function Inspector() {
  const devtools = useDevtoolsContext();

  return (
    <div class={styles.panel}>
      <Show when={devtools.selectedTree()} fallback={<NoTreesDetected />} keyed>
        {(tree) => <TreeInspector tree={tree} />}
      </Show>
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
