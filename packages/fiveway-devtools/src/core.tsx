import { constructCoreClass } from "@tanstack/devtools-utils/solid";

export interface FivewayDevtoolsInit {}

const [core] = constructCoreClass(() => import("./panel.jsx"));

const FivewayDevtoolsCore: ReturnType<typeof constructCoreClass>[0] = core;

export { FivewayDevtoolsCore };
