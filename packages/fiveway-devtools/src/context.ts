import type { NodeId, NavigationTree } from "@fiveway/core";
import { createContext, useContext } from "solid-js";

export type DevtoolsAction = { type: "toggleExpand" } | { type: "inspectNode"; id: NodeId | null };

export type DevtoolsState = {
  expandAll: boolean;
  inspectedNode: NodeId | null;
};

export type DevtoolsContext = {
  tree: NavigationTree;
  state: DevtoolsState;
  dispatch: (action: DevtoolsAction) => void;
};

export const DevtoolsContext = createContext<DevtoolsContext>();

export function useDevtoolContext() {
  const devtools = useContext(DevtoolsContext);
  if (devtools == null) {
    throw new Error();
  }

  return devtools;
}
