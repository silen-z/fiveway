import { Navnode, useNavnode, verticalHandler } from "@fiveway/react";

const items = Array.from({ length: 10 }, (_, i) => {
	return { id: `item-${i + 1}`, order: i, label: `Item ${i + 1}` };
});

export function Items(props: { id: string; order: number; depth: number }) {
	const nav = useNavnode(props.id, verticalHandler, { order: props.order });

	if (props.depth === 0) {
		return (
			<div>
				<nav.Context>
					{items.map((item) => (
						<Navnode key={item.id} id={item.id} order={item.order}>
							{(node) => (
								<div>
									{item.label} {node.isFocused() ? "(focused)" : ""}
								</div>
							)}
						</Navnode>
					))}
				</nav.Context>
			</div>
		);
	}

	return (
		<div>
			<nav.Context>
				{items.map((item) => (
					<Items key={item.id} id={item.id} order={item.order} depth={props.depth - 1} />
				))}
			</nav.Context>
		</div>
	);
}
