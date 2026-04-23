import { render } from "solid-js/web";

import { createDevtoolsContext, devtoolsContext, type InspetorInit } from "./context.ts";
import { InspectorPanel } from "./ui/InspectorPanel.tsx";

export function createInspector(el: HTMLElement, handle: InspetorInit): void {
	render(() => {
		const context = createDevtoolsContext(handle);

		return (
			<devtoolsContext.Provider value={context}>
				<InspectorPanel />
			</devtoolsContext.Provider>
		);
	}, el);
}
