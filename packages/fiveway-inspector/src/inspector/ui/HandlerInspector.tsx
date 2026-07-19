import { type HandlerDescription } from "@fiveway/core/inspector";
import { type Component } from "solid-js";
import { For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { type InspectedHandler, parseHandler } from "../handler.ts";
import * as icon from "./icons.ts";

import styles from "./HandlerInspector.module.css";

const HANDLER_ICONS: Record<string, Component<{ size?: number; class?: string }>> = {
	activate: icon.MousePointerClick,
	capture: icon.Scan,
	container: icon.SquareDashed,
	data: icon.Braces,
	"data.element": icon.ChevronsLeftRight,
	"data.gridItem": icon.Grid2x2X,
	"data.longPress": icon.Timer,
	"data.spatialItem": icon.MapPin,
	focus: icon.Focus,
	grid: icon.LayoutGrid,
	"horizontal-movement": icon.MoveHorizontal,
	parent: icon.CornerLeftUp,
	spatial: icon.Map,
	"vertical-movement": icon.MoveVertical,
};

function handlerIcon(handler: InspectedHandler) {
	const key = handler.dataKey ? `data.${handler.dataKey}` : handler.name;
	return HANDLER_ICONS[key] ?? icon.Puzzle;
}

export function HandlerInspector(props: { handler: HandlerDescription[] }) {
	return (
		<div class={styles.handlers}>
			<For each={parseHandler(props.handler)}>
				{(handler) => <HandlerDetail handler={handler} />}
			</For>
		</div>
	);
}

function HandlerDetail(props: { handler: InspectedHandler }) {
	return (
		<section class={styles.detail} aria-label={props.handler.label}>
			<header class={styles.detailHeader} title={props.handler.name}>
				<Dynamic
					component={handlerIcon(props.handler)}
					class={styles.icon}
					size={14}
					aria-hidden="true"
				/>
				<h3 class={styles.title}>{props.handler.label}</h3>
			</header>

			<Show when={props.handler.options.length > 0}>
				<table class={styles.fields}>
					<tbody>
						<For each={props.handler.options}>
							{([key, value]) => (
								<tr>
									<th scope="row" class={styles.fieldKey}>
										{key}
									</th>
									<td class={styles.fieldValue}>{JSON.stringify(value)}</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</Show>
		</section>
	);
}
