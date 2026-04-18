import * as v from "valibot";
import browser from "webextension-polyfill";

import { InspectorMessage } from "./messages.ts";

let port = browser.runtime.connect({ name: "content-script" });

port.onMessage.addListener((message) => {
  if (
    typeof message === "object" &&
    message != null &&
    "type" in message &&
    message.type !== "ping"
  ) {
    // forward commands from devtools to page
    window.postMessage(message);
  }
});

port.onDisconnect.addListener(() => {
  port = browser.runtime.connect({ name: "content-script" });
});

window.addEventListener("message", (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  // forward tree updates to devtools
  const { success, output: message } = v.safeParse(InspectorMessage, event.data);
  if (success) {
    console.log("contents script received message from page", message);
    port.postMessage(message);
  }
});
