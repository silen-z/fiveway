import {
	createNavigationNode,
	horizontalHandler,
	verticalHandler,
	type ChainedHandler,
	type NavigationHandler,
} from "@fiveway/solid";
import { For } from "solid-js";

import { NavItem } from "./NavItem.tsx";
import { range } from "./utils.ts";

export function ListExample(props: {
	direction: "vertical" | "horizontal";
	handler?: (h: ChainedHandler) => NavigationHandler;
}) {
	const baseHandler = props.direction === "vertical" ? verticalHandler : horizontalHandler;

	const nav = createNavigationNode({
		id: "list",
		handler: props.handler ? props.handler(baseHandler) : baseHandler,
	});

	return (
		<div
			style={{
				display: "flex",
				"flex-direction": props.direction === "vertical" ? "column" : "row",
				gap: "8px",
				padding: "16px",
				width: "fit-content",
			}}
		>
			<nav.Context>
				<For each={range(5)}>
					{(i: number) => <NavItem navId={`item${i}`} label={`Item ${i}`} order={i} />}
				</For>
			</nav.Context>
		</div>
	);
}
