import {
	type GridItem,
	containerHandler,
	gridItemHandler,
	type NodeId,
	useNavnode,
} from "@fiveway/react";
import { type ReactNode } from "react";

import css from "./ExampleBox.module.css";

type ExampleBoxProps = {
	navId: NodeId;
	gridPos: GridItem;
	label: string;
	description: string;
	children: ReactNode;
};

export function ExampleBox(props: ExampleBoxProps) {
	const nav = useNavnode(props.navId, [gridItemHandler(props.gridPos), containerHandler]);

	return (
		<nav.Context>
			<div className={css.box}>
				<div className={css.label}>{props.label}</div>
				<div className={css.description}>{props.description}</div>
				<div className={css.content}>{props.children}</div>
			</div>
		</nav.Context>
	);
}
