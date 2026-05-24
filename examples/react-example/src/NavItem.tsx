import {
	itemHandler,
	type NavigationHandler,
	type NodeId,
	useElementHandler,
	useNavnode,
} from "@fiveway/react";

import css from "./NavItem.module.css";

type NavItemProps = {
	navId: NodeId;
	order?: number;
	onActivate?: () => void;
	label: string;
	handlers?: NavigationHandler[];
};

const goBackHandler: NavigationHandler = (_, action, next) => {
	if (action.kind === "move" && action.direction === "back") {
		return "#";
	}
	return next();
};

export function NavItem(props: NavItemProps) {
	const elementHandler = useElementHandler();

	const baseHandlers = [goBackHandler, elementHandler, itemHandler()];

	const nav = useNavnode(
		props.navId,
		props.handlers ? [...props.handlers, ...baseHandlers] : baseHandlers,
		{ order: props.order },
	);

	return (
		<div
			tabIndex={0}
			onFocus={() => nav.focus()}
			ref={elementHandler.register}
			className={css.item}
		>
			{props.label}
		</div>
	);
}
