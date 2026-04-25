import { type InspectorNode } from "@fiveway/core";
import { For } from "solid-js";

export function InspectedNode(props: { node: InspectorNode }) {
	return (
		<div>
			<div>{props.node.id}</div>
			<For each={props.node.handler}>
				{(handler) => <div>{JSON.stringify(handler, null, 2)}</div>}
			</For>
		</div>
	);
}
