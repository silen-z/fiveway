import { createSignal, For, Show } from "solid-js";

import { type InspectedTree, useDevtoolsContext } from "../context.ts";
import * as icon from "./icons.ts";
import { NavigationPad } from "./NavigationPad.tsx";

import styles from "./InspectorHeader.module.css";

export function InspectorHeader(props: { tree: InspectedTree }) {
	const devtools = useDevtoolsContext();
	const [isNavPadOpen, setNavPadOpen] = createSignal(false);

	return (
		<header class={styles.root}>
			<div class={styles.header}>
				<div class={styles.brand}>
					<Logo />
					<span>
						<span class={styles.brandName}>fiveway</span> / inspector
					</span>
				</div>
				<div class={styles.actions}>
					<button
						type="button"
						class={styles.iconButton}
						title={isNavPadOpen() ? "Hide navigation controls" : "Show navigation controls"}
						aria-expanded={isNavPadOpen()}
						onClick={() => setNavPadOpen((o) => !o)}
					>
						<icon.Gamepad2 size={18} />
					</button>
					<Show when={Object.keys(devtools.trees).length > 1}>
						<TreeSelector />
					</Show>
				</div>
			</div>

			<Show when={isNavPadOpen()}>
				<NavigationPad tree={props.tree.label} />
			</Show>

			<div class={styles.statusBar} aria-live="polite">
				<span class={styles.statusBarLabel}>Focus</span>
				<span class={styles.statusBarValue}>{props.tree.focus ?? "—"}</span>
			</div>
		</header>
	);
}

function TreeSelector() {
	const devtools = useDevtoolsContext();

	return (
		<select
			class={styles.treeSelect}
			aria-label="Active tree"
			value={devtools.inspectedTree()?.label ?? ""}
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
	);
}

function Logo() {
	return (
		<svg
			class={styles.brandLogo}
			width="64"
			height="64"
			viewBox="0 0 64 64"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g transform="translate(-31.011 -49.194)">
				<path
					d="m46.593 52.34-6.9879 32.91c-0.22759 1.0721 0.59003 2.0816 1.686 2.0816l13.344-7.93e-4 0.64894-3.0564 6.9191 0.09321 5.0805 9.462-9.0392 9.1832-6.9364-0.0125 0.72916-3.4341-13.344 0.0011c-1.2407 0-2.3123 0.86788-2.5701 2.0815l-1.7841 8.4011c-0.2276 1.072 0.58992 2.0815 1.6859 2.0815h40.834c1.2407 0 2.3122-0.86793 2.5699-2.0816l6.9796-32.873c0.2276-1.0721-0.59002-2.0815-1.686-2.0816l-13.462-9e-4 -0.78913 3.7169-7.0861-0.01625-4.5957-11.037 8.7398-8.4812 7.0795 0.04672-0.65307 3.076 13.462 9e-4c1.2407 8.9e-5 2.3121-0.86799 2.5697-2.0816l1.6933-7.9801c0.22761-1.0722-0.59023-2.0816-1.6863-2.0816h-40.832c-1.2407 0-2.3123 0.86793-2.57 2.0816z"
					fill="currentColor"
					opacity=".995"
				/>
			</g>
		</svg>
	);
}
