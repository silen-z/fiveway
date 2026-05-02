import {
	itemHandler,
	type ComposedHandler,
	type NavigationHandler,
	type NodeId,
	useElementHandler,
	useNavigationNode,
} from "@fiveway/react";

import css from "./NavItem.module.css";

type NavItemProps = {
	navId: NodeId;
	order?: number;
	onSelect?: () => void;
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
	const elementHandler = useElementHandler();

	const nav = useNavigationNode({
		id: props.navId,
		order: props.order,
		handler: (props.handler ?? itemHandler()).compose(goBackHandler).compose(elementHandler),
	});

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
