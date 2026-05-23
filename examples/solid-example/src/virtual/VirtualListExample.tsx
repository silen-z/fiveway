import { createNavnode, childLocalId, useOnFocusChange, verticalHandler } from "@fiveway/solid";
import { createMemo, createSignal, For } from "solid-js";

import { NavItem } from "../NavItem.tsx";
import { offsetWindow, mapRange } from "./virtual.ts";

const items = Array.from({ length: 21 }, (_, i) => {
	return { id: `item-${i + 1}`, order: i, label: `Item ${i + 1}` };
});

export function VirtualListExample() {
	const [listPosition, setListPosition] = createSignal(0);
	const windowRange = () => offsetWindow(items.length, listPosition(), 3);

	const nav = createNavnode("virtual-list", [
		(node, action, next) => {
			if (action.kind === "focus") {
				const item = items[listPosition()];
				if (item == null) {
					return next();
				}

				try {
					return next(`${node.id}/${item.id}`);
				} catch {
					return next();
				}
			}

			return next();
		},
		verticalHandler,
	]);

	useOnFocusChange(nav, (id) => {
		if (id === null) {
			return;
		}

		const childId = childLocalId(nav(), id)?.substring(nav().length + 1);
		if (childId === null) {
			return;
		}

		const newPosition = items.findIndex((i) => i.id === childId);
		if (newPosition !== -1) {
			setListPosition(newPosition);
		}
	});

	const itemsInRange = createMemo(() => mapRange(items, windowRange(), (item) => item));

	return (
		<ul
			style={{
				display: "flex",
				"flex-direction": "column",
				gap: "8px",
				padding: "16px",
			}}
		>
			<nav.Context>
				<For each={itemsInRange()}>
					{(item) => <NavItem navId={item.id} label={item.label} order={item.order} />}
				</For>
			</nav.Context>
		</ul>
	);
}
