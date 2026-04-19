import { render } from "solid-js/web";

import { createDevtoolsContext, devtoolsContext, type InspetorInit } from "../context.ts";
import { Inspector } from "./InspectorPanel.tsx";

export function createInspector(el: HTMLElement, handle: InspetorInit): void {
  render(() => {
    const context = createDevtoolsContext(handle);

    return (
      <devtoolsContext.Provider value={context}>
        <Inspector />
      </devtoolsContext.Provider>
    );
  }, el);
}
