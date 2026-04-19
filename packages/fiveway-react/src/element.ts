import {
  type NavigationTree,
  type NavigationAction,
  type ChainedHandler,
  handleAction,
  chainedHandler,
  registerListener,
  spatialItemHandler,
  type FocusChangeEvent,
} from "@fiveway/core";
import { defaultEventMapping, elementHandler } from "@fiveway/core/dom";
import { useRef, useMemo, useEffect } from "react";

export type ElementHandler = ChainedHandler & {
  register: (e: HTMLElement | null) => void;
};

export function useElementHandler(): ElementHandler {
  const elementRef = useRef<HTMLElement | null>(null);

  return useMemo(() => {
    const handler = chainedHandler([
      elementHandler(() => elementRef.current),
      spatialItemHandler(() => {
        return elementRef.current?.getBoundingClientRect() ?? null;
      }),
    ]) as ElementHandler;

    handler.register = (element) => {
      elementRef.current = element;
    };

    return handler;
  }, []);
}

export type ActionHandlerOptions = {
  target?: EventTarget;
  eventToAction?: (e: Event) => NavigationAction | null;
};

export function useActionHandler(tree: NavigationTree, options: ActionHandlerOptions = {}): void {
  const eventToAction = options.eventToAction ?? defaultEventMapping;
  const target = options.target ?? window;

  useEffect(() => {
    const handler = (e: Event) => {
      const action = eventToAction(e);
      if (action === null) {
        return;
      }

      handleAction(tree, action);
    };

    target.addEventListener("keydown", handler);

    return () => {
      target.removeEventListener("keydown", handler);
    };
  }, [tree, target, eventToAction]);
}

export function useFocusSync(tree: NavigationTree): void {
  useEffect(() => {
    const handler = (e: FocusChangeEvent) => {
      const el = elementHandler.query(tree, e.focused);
      if (el != null) {
        el.focus({ focusVisible: true });
      }
    };

    return registerListener(tree, "#", "focuschange", handler);
  }, [tree]);
}
