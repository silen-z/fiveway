import { type DevtoolsPanelProps, createSolidPanel } from "@tanstack/devtools-utils/solid";

import { FivewayDevtoolsCore } from "../core.jsx";

export interface FivewayDevtoolsSolidInit extends DevtoolsPanelProps {}

const [panel, panelNoOp] = createSolidPanel(FivewayDevtoolsCore);

export const FivewayDevtoolsPanel: typeof panel = panel;
export const FivewayDevtoolsPanelNoOp: typeof panelNoOp = panelNoOp;
