import { render } from "@solidjs/web";

import { type InspetorInit } from "./context.ts";
import { Inspector } from "./ui/Inspector.tsx";

export function createInspector(el: HTMLElement, handle: InspetorInit): void {
	render(() => Inspector({ handle }), el);
}
