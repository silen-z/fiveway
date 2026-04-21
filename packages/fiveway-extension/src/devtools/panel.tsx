import { type InspectorCommand } from "@fiveway/core";
import { createInspector } from "@fiveway/inspector";
import * as v from "valibot";
import browser from "webextension-polyfill";

import { type InspectorCommand as InspectorCommandMessage } from "../messages.ts";
import { type InitMessage, InspectorMessage, ReloadMessage } from "../messages.ts";

const port = browser.runtime.connect({ name: "devtools" });

port.postMessage({
  type: "init",
  tabId: browser.devtools.inspectedWindow.tabId,
} satisfies InitMessage);

const root = document.getElementById("app");
if (root === null) {
  throw new Error("root element not found");
}

export const AcceptedIncomingMessage = v.union([InspectorMessage, ReloadMessage]);

createInspector(root, {
  subscribe: (callback) => {
    const handler = (message: unknown) => {
      const { success, output } = v.safeParse(AcceptedIncomingMessage, message);
      if (success) {
        callback(output);
      }
    };

    port.onMessage.addListener(handler);
    return () => {
      port.onMessage.removeListener(handler);
    };
  },
  sendCommand: (command: InspectorCommand) => {
    port.postMessage({
      type: "fiveway:command",
      tabId: browser.devtools.inspectedWindow.tabId,
      command,
    } satisfies InspectorCommandMessage);
  },
});
