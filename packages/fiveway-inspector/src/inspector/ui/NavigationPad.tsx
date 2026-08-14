import { type NavigationAction } from "@fiveway/core";
import { createSignal } from "solid-js";

import { useDevtoolsContext } from "../context.ts";
import * as icon from "./icons.tsx";

import styles from "./NavigationPad.module.css";

export function NavigationPad(props: { tree: string }) {
	const devtools = useDevtoolsContext();
	const [longPress, setLongPress] = createSignal(false);

	const sendAction = (action: NavigationAction) => {
		devtools.sendCommand({
			kind: "dispatchAction",
			tree: props.tree,
			action,
		});
	};

	return (
		<div class={styles.root} aria-label="Simulate navigation">
			<button
				type="button"
				class={`${styles.button} ${styles.bwd}`}
				title="Move backwards"
				aria-label="Move backwards"
				onClick={() => sendAction({ kind: "move", direction: "backwards", longpress: longPress() })}
			>
				<icon.ChevronsLeft size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.up}`}
				title="Move up"
				aria-label="Move up"
				onClick={() => sendAction({ kind: "move", direction: "up", longpress: longPress() })}
			>
				<icon.ArrowUp size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.fwd}`}
				title="Move forwards"
				aria-label="Move forwards"
				onClick={() => sendAction({ kind: "move", direction: "forwards", longpress: longPress() })}
			>
				<icon.ChevronsRight size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.left}`}
				title="Move left"
				aria-label="Move left"
				onClick={() => sendAction({ kind: "move", direction: "left", longpress: longPress() })}
			>
				<icon.ArrowLeft size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.select}`}
				title="Activate"
				aria-label="Activate"
				onClick={() => sendAction({ kind: "activate", longpress: longPress() })}
			>
				<icon.Check size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.right}`}
				title="Move right"
				aria-label="Move right"
				onClick={() => sendAction({ kind: "move", direction: "right", longpress: longPress() })}
			>
				<icon.ArrowRight size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.back}`}
				title="Back"
				aria-label="Back"
				onClick={() => sendAction({ kind: "move", direction: "back", longpress: longPress() })}
			>
				<icon.Undo2 size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.down}`}
				title="Move down"
				aria-label="Move down"
				onClick={() => sendAction({ kind: "move", direction: "down", longpress: longPress() })}
			>
				<icon.ArrowDown size={16} />
			</button>
			<button
				type="button"
				class={`${styles.button} ${styles.longpress}`}
				title={longPress() ? "Long press mode on" : "Long press mode off"}
				aria-label="Toggle long press mode"
				aria-pressed={longPress() ? "true" : "false"}
				onClick={() => setLongPress((on) => !on)}
			>
				<icon.Timer size={16} />
			</button>
		</div>
	);
}
