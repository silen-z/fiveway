import type { NavigationAction } from "./action.ts";
import { runHandler } from "./handler/handler.ts";
import type { NodeId } from "./tree/id.ts";
import { type NavigationTree } from "./tree/tree.ts";

export type InspectorNode = {
  id: string;
  parent: string | null;
  order: number | null;
  children: string[];
};

export type InspectorMessage = {
  type: "fiveway:treeState";
  tree: string;
  focus?: string;
  nodes?: InspectorNode[];
  removedNodes?: string[];
};

export function emitInspectorMessage(message: InspectorMessage): void {
  if (typeof window === "undefined") {
    return;
  }

  window.postMessage(message);
}

export type InspectorCommand =
  | { kind: "focus"; tree: string; node: string }
  | { kind: "requestCompleteSnapshot"; tree: string };

export function subscribeToInspectorCommands(
  tree: NavigationTree,
  callback: (command: InspectorCommand) => void,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("message", (event: MessageEvent) => {
    if (
      event.data.type === "fiveway:command" &&
      (event.data.command.tree === tree.label || event.data.command.tree === "*")
    ) {
      callback(event.data.command);
    }
  });
}

export type HandlerInfo = Record<string, string | { toString(): string }>;

export function describeHandler(action: NavigationAction, info: HandlerInfo): void {
  if (action.kind === "query" && action.key === "core:handler-info") {
    if (!Array.isArray(action.value)) {
      action.value = [];
    }

    (action.value as HandlerInfo[]).push(info);
  }
}

export function queryHandlerInfo(tree: NavigationTree, id: NodeId): HandlerInfo[] {
  const value = [] as HandlerInfo[];
  runHandler(tree, id, {
    kind: "query",
    key: "core:handler-info",
    value,
  });

  return value;
}
