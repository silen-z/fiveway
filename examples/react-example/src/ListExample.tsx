import {
	horizontalHandler,
	verticalHandler,
	type ComposedHandler,
	type NavigationHandler,
	useNav,
} from "@fiveway/react";

import { NavItem } from "./NavItem";
import { range } from "./utils";

export function ListExample(props: {
	direction: "vertical" | "horizontal";
	handler?: (h: ComposedHandler) => NavigationHandler;
}) {
	const handler = props.direction === "vertical" ? verticalHandler : horizontalHandler;

	const nav = useNav("list", props.handler ? props.handler(handler) : handler);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: props.direction === "vertical" ? "column" : "row",
				gap: "8px",
				padding: "16px",
				width: "fit-content",
			}}
		>
			<nav.Context>
				{range(5).map((i: number) => (
					<NavItem key={`item${i}`} navId={`item${i}`} label={`Item ${i}`} order={i} />
				))}
			</nav.Context>
		</div>
	);
}
