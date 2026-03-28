import { type NavigationTree, type NodeId, inspector } from "@fiveway/core";
import { type PropsWithChildren, createContext, useContext, useEffect } from "react";

export type NavigationContext = {
  tree: NavigationTree;
  parentNode: NodeId;
};

export const NavigationContext = createContext<NavigationContext | null>(null);

export type NavigationProviderProps = PropsWithChildren<{
  tree: NavigationTree;
}>;

export function NavigationProvider(props: NavigationProviderProps) {
  useEffect(() => {
    inspector.emit("tree-update", { tree: props.tree });
    return () => {
      inspector.emit("tree-unmount", { tree: props.tree });
    };
  }, [props.tree]);

  return (
    <NavigationContext.Provider value={{ tree: props.tree, parentNode: "#" }}>
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
