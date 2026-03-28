import { inspector, type NavigationAction, type NavigationTree, type NodeId } from "@fiveway/core";
import { createContext, createEffect, useContext, type JSX } from "solid-js";

export type NavigationContext = {
  tree: NavigationTree;
  parentNode: () => NodeId;
};

export const NavigationContext = createContext<NavigationContext | null>(null);

type NavigationProviderProps = {
  tree: NavigationTree;
  fromEvent?: (e: KeyboardEvent) => NavigationAction | null;
  children: JSX.Element;
};

export function NavigationProvider(props: NavigationProviderProps) {
  // reactive tree prop is not supported
  // eslint-disable-next-line solid/reactivity
  const tree = props.tree;

  createEffect(() => {
    inspector.emit("tree-update", { tree: props.tree });
    return () => {
      inspector.emit("tree-unmount", { tree: props.tree });
    };
  });

  return (
    <NavigationContext.Provider value={{ tree, parentNode: () => "#" }}>
      {props.children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext(): NavigationContext {
  const navContext = useContext(NavigationContext);
  if (navContext == null) {
    throw new Error("expected navigation context");
  }

  return navContext;
}
