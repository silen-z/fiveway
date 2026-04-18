import { render } from "solid-js/web";

import { createDevtoolsContext, devtoolsContext, type InspetorInit } from "./context.js";
import { Inspector } from "./InspectorPanel.js";

export function createInspector(el: HTMLElement, handle: InspetorInit) {
  render(() => {
    const context = createDevtoolsContext(handle);

    return (
      <devtoolsContext.Provider value={context}>
        <Inspector />
      </devtoolsContext.Provider>
    );
  }, el);
}
