import { EventClient } from "@tanstack/devtools-event-client";

import type { NavtreeEvent } from "./tree/events.ts";
import type { NavigationTree } from "./tree/tree.ts";

type FivewayEvents = {
  "tree-update": { tree: NavigationTree; event?: NavtreeEvent };
  "tree-unmount": { tree: NavigationTree };
};

class FivewayInspectorClient extends EventClient<FivewayEvents> {
  constructor() {
    super({ pluginId: "fiveway-inspector" });
  }
}

export const inspector: FivewayInspectorClient = new FivewayInspectorClient();
