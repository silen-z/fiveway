import { type NavigationAction } from "@fiveway/core";
import { clsx } from "clsx";

import { useDevtoolsContext } from "../context.ts";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Undo2 } from "./icons.ts";

import styles from "./NavigationPad.module.css";

export function NavigationPad(props: { tree: string }) {
	const devtools = useDevtoolsContext();

	const sendAction = (action: NavigationAction) => {
		devtools.sendCommand({
			kind: "dispatchAction",
			tree: props.tree,
			action,
		});
	};

	return (
		<div class={styles.navPad} id="fiveway-nav-pad" aria-label="Simulate navigation">
			<button
				type="button"
				class={clsx(styles.navButton, styles.navPadBack)}
				title="Back"
				aria-label="Back"
				onClick={() => sendAction({ kind: "move", direction: "back" })}
			>
				<Undo2 size={16} />
			</button>
			<button
				type="button"
				class={clsx(styles.navButton, styles.navPadUp)}
				title="Move up"
				aria-label="Move up"
				onClick={() => sendAction({ kind: "move", direction: "up" })}
			>
				<ArrowUp size={16} />
			</button>
			<button
				type="button"
				class={clsx(styles.navButton, styles.navPadActivate)}
				title="Activate"
				aria-label="Activate"
				onClick={() => sendAction({ kind: "activate" })}
			>
				<Check size={16} />
			</button>
			<button
				type="button"
				class={clsx(styles.navButton, styles.navPadLeft)}
				title="Move left"
				aria-label="Move left"
				onClick={() => sendAction({ kind: "move", direction: "left" })}
			>
				<ArrowLeft size={16} />
			</button>
			<button
				type="button"
				class={clsx(styles.navButton, styles.navPadRight)}
				title="Move right"
				aria-label="Move right"
				onClick={() => sendAction({ kind: "move", direction: "right" })}
			>
				<ArrowRight size={16} />
			</button>
			<button
				type="button"
				class={clsx(styles.navButton, styles.navPadDown)}
				title="Move down"
				aria-label="Move down"
				onClick={() => sendAction({ kind: "move", direction: "down" })}
			>
				<ArrowDown size={16} />
			</button>
		</div>
	);
}
