import { type JSX } from "solid-js";

import styles from "./InspectorLayout.module.css";

export function InspectorLayout(props: { children: JSX.Element }) {
	return (
		<>
			<header class={styles.header}>
				<div class={styles.headerInner}>
					<div class={styles.headerRow}>
						<h1 class={styles.title}>
							<strong class={styles.titleBrand}>fiveway</strong> / inspector
						</h1>

						<div class={styles.headerLinks}>
							<a class={styles.headerLink} href="https://fiveway.dev">
								Documentation
							</a>
							<a
								class={styles.headerLink}
								href="https://github.com/silen-z/fiveway"
								target="_blank"
								rel="noreferrer"
							>
								GitHub
							</a>
							<a
								class={styles.headerLink}
								href="https://bsky.app/profile/fiveway.dev"
								target="_blank"
								rel="noreferrer"
							>
								Bluesky
							</a>
						</div>
					</div>
				</div>
			</header>
			<main class={styles.main}>{props.children}</main>
		</>
	);
}
