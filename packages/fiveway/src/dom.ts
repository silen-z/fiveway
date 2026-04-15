import type { NavigationAction } from "./action.ts";
import { metaHandler, type MetaHandler } from "./handler/metadata.ts";

const eventKeyToAction: Record<string, NavigationAction> = {
  ArrowUp: { kind: "move", direction: "up" },
  ArrowDown: { kind: "move", direction: "down" },
  ArrowLeft: { kind: "move", direction: "left" },
  ArrowRight: { kind: "move", direction: "right" },
  Enter: { kind: "select" },
  " ": { kind: "select" },
  Backspace: { kind: "move", direction: "back" },
};

export function defaultEventMapping(e: Event): NavigationAction | null {
  if ("key" in e && typeof e.key === "string") {
    return eventKeyToAction[e.key] ?? null;
  }

  return null;
}

export const elementHandler: MetaHandler<HTMLElement> = metaHandler("core:node-element");
