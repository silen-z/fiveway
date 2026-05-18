import { captureHandler, createNavnode, spatialHandler } from "@fiveway/solid";
import { type JSX } from "solid-js";

import { NavItem } from "./NavItem.tsx";

import css from "./SpatialExample.module.css";

export function SpatialExample() {
	const nav = createNavnode("spatial", spatialHandler.compose(captureHandler));

	return (
		<nav.Context>
			<div class={css.container}>
				<SpatialItem navId="item1" style={{ left: "10%", top: "10%" }} isMoving />
				<SpatialItem navId="item2" style={{ left: "20%", bottom: "10%" }} />
				<SpatialItem navId="item3" style={{ right: "20%", bottom: "10%" }} />
			</div>
		</nav.Context>
	);
}

function SpatialItem(props: { navId: string; style: JSX.CSSProperties; isMoving?: boolean }) {
	return (
		<div class={css.item} data-moving={props.isMoving ? "true" : undefined} style={props.style}>
			<NavItem navId={props.navId} label={props.navId} />
		</div>
	);
}
