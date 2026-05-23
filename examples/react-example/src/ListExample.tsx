import {
	horizontalHandler,
	verticalHandler,
	type NavigationHandler,
	useNavnode,
} from "@fiveway/react";

import { NavItem } from "./NavItem";
import { range } from "./utils";

export function ListExample(props: {
	direction: "vertical" | "horizontal";
	handlers?: NavigationHandler[];
}) {
	const baseHandler = props.direction === "vertical" ? verticalHandler : horizontalHandler;

	const nav = useNavnode("list", props.handlers ? [...props.handlers, baseHandler] : baseHandler);

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
