import {
	createElementHandler,
	createNav,
	itemHandler,
	type ComposedHandler,
	type NavigationHandler,
	type NodeId,
} from "@fiveway/solid";

import css from "./NavItem.module.css";

type NavItemProps = {
	navId: NodeId;
	order?: number;
	label: string;
	handler?: ComposedHandler;
};

const goBackHandler: NavigationHandler = (_, action, next) => {
	if (action.kind === "move" && action.direction === "back") {
		return "#";
	}
	return next();
};

export function NavItem(props: NavItemProps) {
	const elementHandler = createElementHandler();

	const baseHandler = props.handler ?? itemHandler();

	const nav = createNav(props.navId, baseHandler.compose(goBackHandler).compose(elementHandler), {
		get order() {
			return props.order;
		},
	});

	return (
		<div tabIndex={0} onFocus={() => nav.focus()} ref={elementHandler.register} class={css.item}>
			{props.label}
		</div>
	);
}
