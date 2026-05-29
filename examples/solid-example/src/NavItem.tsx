import {
	createElementHandler,
	createNavnode,
	itemHandler,
	type NavigationHandler,
	type NodeId,
} from "@fiveway/solid";

import css from "./NavItem.module.css";

type NavItemProps = {
	navId: NodeId;
	order?: number;
	label: string;
	handlers?: NavigationHandler[];
};

const goBackHandler: NavigationHandler = (action, { next }) => {
	if (action.kind === "move" && action.direction === "back") {
		return "#";
	}
	return next();
};

export function NavItem(props: NavItemProps) {
	const elementHandler = createElementHandler();

	const baseHandlers = [goBackHandler, elementHandler, itemHandler()];

	const nav = createNavnode(
		props.navId,
		props.handlers ? [...props.handlers, ...baseHandlers] : baseHandlers,
		{
			get order() {
				return props.order;
			},
		},
	);

	return (
		<div tabIndex={0} onFocus={() => nav.focus()} ref={elementHandler.register} class={css.item}>
			{props.label}
		</div>
	);
}
