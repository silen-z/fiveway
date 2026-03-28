import { createSolidPlugin } from "@tanstack/devtools-utils/solid";

import { FivewayDevtoolsPanel } from "./solidPanel.jsx";

const [plugin, pluginNoOp] = createSolidPlugin({
  name: "Fiveway",
  Component: FivewayDevtoolsPanel,
});

export const fivewayDevtoolsPlugin: ReturnType<typeof createSolidPlugin>[0] = plugin;
export const fivewayDevtoolsNoOpPlugin: ReturnType<typeof createSolidPlugin>[1] = pluginNoOp;
