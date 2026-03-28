import { createReactPanel } from "@tanstack/devtools-utils/react";
import type { DevtoolsPanelProps } from "@tanstack/devtools-utils/react";

import { FivewayDevtoolsCore } from "../core.jsx";

export interface FivewayDevtoolsReactInit extends DevtoolsPanelProps {}

const [panel, panelNoOp] = createReactPanel(FivewayDevtoolsCore);

export const FivewayDevtoolsPanel: ReturnType<typeof createReactPanel>[0] = panel;
export const FivewayDevtoolsPanelNoOp: ReturnType<typeof createReactPanel>[1] = panelNoOp;
