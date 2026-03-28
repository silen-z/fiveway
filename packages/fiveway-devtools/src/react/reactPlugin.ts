import { createReactPlugin } from "@tanstack/devtools-utils/react";

import { FivewayDevtoolsPanel } from "./reactPanel.jsx";

const [plugin, pluginNoOp] = createReactPlugin({
  name: "Fiveway",
  Component: FivewayDevtoolsPanel,
});

export const fivewayDevtoolsPlugin: ReturnType<typeof createReactPlugin>[0] = plugin;
export const fivewayDevtoolsNoOpPlugin: ReturnType<typeof createReactPlugin>[1] = pluginNoOp;
