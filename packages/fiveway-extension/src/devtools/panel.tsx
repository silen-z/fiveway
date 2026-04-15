import { createInspector } from "@fiveway/devtools";
import * as v from "valibot";
import browser from "webextension-polyfill";

import {
  Command,
  NavtreeCommandMessage,
  NavtreeUpdateMessage,
  type InitMessage,
} from "../messages.ts";

const port = browser.runtime.connect({ name: "devtools" });

port.postMessage({
  type: "init",
  tabId: browser.devtools.inspectedWindow.tabId,
} satisfies InitMessage);

const root = document.getElementById("app");
if (root === null) {
  throw new Error("root element not found");
}

createInspector(root, {
  subscribe: (callback) => {
    const handler = (message: unknown) => {
      const { success, output } = v.safeParse(NavtreeUpdateMessage, message);
      if (success) {
        callback(output);
      }
    };

    port.onMessage.addListener(handler);
    return () => {
      port.onMessage.removeListener(handler);
    };
  },
  sendCommand: (command: Command) => {
    port.postMessage({
      type: "fiveway:command",
      tabId: browser.devtools.inspectedWindow.tabId,
      command,
    } satisfies NavtreeCommandMessage);
  },
});
