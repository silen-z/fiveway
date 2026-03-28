"use client";
import * as Devtools from "./reactPanel.jsx";
import * as plugin from "./reactPlugin.js";

export const FivewayDevtoolsPanel: typeof Devtools.FivewayDevtoolsPanel = import.meta.env.DEV
  ? Devtools.FivewayDevtoolsPanel
  : Devtools.FivewayDevtoolsPanelNoOp;

export const fivewayDevtoolsPlugin: typeof plugin.fivewayDevtoolsPlugin = import.meta.env.DEV
  ? plugin.fivewayDevtoolsPlugin
  : plugin.fivewayDevtoolsNoOpPlugin;

export type { FivewayDevtoolsReactInit } from "./reactPanel.jsx";
