import {
	createNavigationNode,
	childLocalId,
	gridHandler,
	gridItemHandler,
	itemHandler,
	useOnFocusChange,
} from "@fiveway/solid";
import { createMemo, createSignal, For, type JSX } from "solid-js";

import { NavItem } from "../NavItem.tsx";
import { offsetWindow, mapRange } from "./virtual.ts";

import css from "./VirtualGridExample.module.css";

const items = Array.from({ length: 42 }, (_, i) => {
	return { id: `item-${i + 1}`, order: i, label: `Item ${i + 1}` };
});

const cols = 4;

export function VirtualGridExample() {
	const [listPosition, setListPosition] = createSignal(0);

	const rows = () => Math.ceil(items.length / cols);
	const itemRowIndex = () => Math.floor(listPosition() / cols);

	const windowRange = () => offsetWindow(rows(), itemRowIndex(), 1, 2);
	const gridRange = (): [number, number] => [
		windowRange()[0] * cols,
		(windowRange()[1] + 1) * cols - 1,
	];

	const nav = createNavigationNode({
		id: "virtual-grid",
		handler: gridHandler().prepend((node, action, next) => {
			if (action.kind === "focus") {
				const lp = listPosition();
				const item = items[lp - (lp % cols)];
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
		}),
	});

	useOnFocusChange(nav, (id) => {
		if (id === null) {
			return;
		}

		const childId = childLocalId(nav(), id)?.substring(nav().length + 1);
		if (childId === null) {
			return;
		}

		const index = items.findIndex((i) => i.id === childId);
		if (index !== -1) {
			setListPosition(index);
		}
	});

	const itemsInRange = createMemo(() => mapRange(items, gridRange(), (item) => item));

	return (
		<div class={css.grid} style={{ "--cols": cols } as JSX.CSSProperties}>
			<nav.Context>
				<For each={itemsInRange()}>
					{(item) => {
						const gridPosition = {
							row: Math.floor(item.order / cols),
							col: item.order % cols,
						};

						return (
							<NavItem
								navId={item.id}
								label={item.label}
								order={item.order}
								handler={itemHandler().prepend(gridItemHandler(gridPosition))}
							/>
						);
					}}
				</For>
			</nav.Context>
		</div>
	);
}
