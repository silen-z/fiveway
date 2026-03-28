import * as Devtools from "./solidPanel.jsx";
import * as plugin from "./solidPlugin.js";

export const FivewayDevtoolsPanel: typeof Devtools.FivewayDevtoolsPanel = import.meta.env.DEV
  ? Devtools.FivewayDevtoolsPanel
  : Devtools.FivewayDevtoolsPanelNoOp;

export const fivewayDevtoolsPlugin: typeof plugin.fivewayDevtoolsPlugin = import.meta.env.DEV
  ? plugin.fivewayDevtoolsPlugin
  : plugin.fivewayDevtoolsNoOpPlugin;

export type { FivewayDevtoolsSolidInit } from "./solidPanel.jsx";
