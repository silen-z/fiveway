import { type NavigationAction } from "@fiveway/core";
import { clsx } from "clsx";
import * as Icon from "lucide-solid";

import styles from "./NavigationPad.module.css";

export function NavigationPad(props: { onAction: (action: NavigationAction) => void }) {
  const { onAction } = props;

  return (
    <div class={styles.navPad} id="fiveway-nav-pad" aria-label="Simulate navigation">
      <button
        type="button"
        class={clsx(styles.navButton, styles.navPadBack)}
        title="Back (Backspace)"
        aria-label="Back"
        onClick={() => onAction({ kind: "move", direction: "back" })}
      >
        <Icon.Undo2 size={16} />
      </button>
      <button
        type="button"
        class={clsx(styles.navButton, styles.navPadUp)}
        title="Move up"
        aria-label="Move up"
        onClick={() => onAction({ kind: "move", direction: "up" })}
      >
        <Icon.ArrowUp size={16} />
      </button>
      <button
        type="button"
        class={clsx(styles.navButton, styles.navPadSelect)}
        title="Select (Enter)"
        aria-label="Select"
        onClick={() => onAction({ kind: "select" })}
      >
        <Icon.Check size={16} />
      </button>
      <button
        type="button"
        class={clsx(styles.navButton, styles.navPadLeft)}
        title="Move left"
        aria-label="Move left"
        onClick={() => onAction({ kind: "move", direction: "left" })}
      >
        <Icon.ArrowLeft size={16} />
      </button>
      <button
        type="button"
        class={clsx(styles.navButton, styles.navPadRight)}
        title="Move right"
        aria-label="Move right"
        onClick={() => onAction({ kind: "move", direction: "right" })}
      >
        <Icon.ArrowRight size={16} />
      </button>
      <button
        type="button"
        class={clsx(styles.navButton, styles.navPadDown)}
        title="Move down"
        aria-label="Move down"
        onClick={() => onAction({ kind: "move", direction: "down" })}
      >
        <Icon.ArrowDown size={16} />
      </button>
    </div>
  );
}
